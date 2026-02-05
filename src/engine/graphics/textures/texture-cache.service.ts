/**
 * Texture Cache Service
 * Implements LRU (Least Recently Used) caching for procedural textures
 * with memory budget management and automatic eviction
 *
 * @scope Graphics Pipeline
 * @source src/engine/graphics/textures/texture-cache.service.ts
 */

import { Injectable } from '@angular/core';
import * as THREE from 'three';

interface CacheEntry {
    texture: THREE.Texture;
    size: number;
    lastAccessed: number;
    accessCount: number;
}

@Injectable({
    providedIn: 'root'
})
export class TextureCacheService {
    // Configuration
    private readonly MAX_CACHE_SIZE = 50; // Maximum number of textures
    private readonly MEMORY_BUDGET_MB = 512; // 512MB budget
    private readonly MEMORY_BUDGET_BYTES = this.MEMORY_BUDGET_MB * 1024 * 1024;

    // Cache storage
    private cache = new Map<string, CacheEntry>();
    private currentMemoryUsage = 0;
    private accessCounter = 0;

    /**
     * Get texture from cache or create and cache it
     */
    getOrCreate(
        key: string,
        factory: () => THREE.Texture,
        options: { size?: number; isDataTexture?: boolean } = {}
    ): THREE.Texture {
        // Check cache first
        const cached = this.cache.get(key);
        if (cached) {
            this.touchEntry(key, cached);
            return cached.texture;
        }

        // Create new texture
        const texture = factory();

        // Calculate texture memory size
        const textureSize = this.calculateTextureSize(texture, options);

        // Check if we need to evict before adding
        if (this.currentMemoryUsage + textureSize > this.MEMORY_BUDGET_BYTES) {
            this.evictForSpace(textureSize);
        }

        // Add to cache
        this.cache.set(key, {
            texture,
            size: textureSize,
            lastAccessed: ++this.accessCounter,
            accessCount: 1
        });

        this.currentMemoryUsage += textureSize;

        // Log cache stats in debug mode
        if (process.env.NODE_ENV === 'development') {
            console.log(`[TextureCache] Added: ${key}, Size: ${(textureSize / 1024 / 1024).toFixed(2)}MB, Total: ${(this.currentMemoryUsage / 1024 / 1024).toFixed(2)}MB`);
        }

        return texture;
    }

    /**
     * Check if texture exists in cache
     */
    has(key: string): boolean {
        return this.cache.has(key);
    }

    /**
     * Get cached texture without creating
     */
    get(key: string): THREE.Texture | undefined {
        const entry = this.cache.get(key);
        if (entry) {
            this.touchEntry(key, entry);
            return entry.texture;
        }
        return undefined;
    }

    /**
     * Clear entire cache
     */
    clear(): void {
        this.cache.forEach(entry => {
            entry.texture.dispose();
        });
        this.cache.clear();
        this.currentMemoryUsage = 0;
        this.accessCounter = 0;
    }

    /**
     * Remove specific texture from cache
     */
    remove(key: string): boolean {
        const entry = this.cache.get(key);
        if (entry) {
            this.removeEntry(key, entry);
            return true;
        }
        return false;
    }

    /**
     * Get cache statistics
     */
    getStats(): {
        count: number;
        memoryUsageMB: number;
        memoryBudgetMB: number;
        utilizationPercent: number;
        } {
        return {
            count: this.cache.size,
            memoryUsageMB: this.currentMemoryUsage / 1024 / 1024,
            memoryBudgetMB: this.MEMORY_BUDGET_MB,
            utilizationPercent: (this.currentMemoryUsage / this.MEMORY_BUDGET_BYTES) * 100
        };
    }

    /**
     * Force garbage collection of unused textures
     */
    cleanupUnused(minAccessCount: number = 3): number {
        let cleaned = 0;

        this.cache.forEach((entry, key) => {
            // Remove textures with low access count (likely unused)
            if (entry.accessCount < minAccessCount) {
                this.removeEntry(key, entry);
                cleaned++;
            }
        });

        return cleaned;
    }

    /**
     * Update an existing cached texture
     */
    update(key: string, texture: THREE.Texture, options: { size?: number } = {}): void {
        // Validate inputs
        if (!key || !texture) {
            console.warn('[TextureCache] Invalid key or texture in update()');
            return;
        }

        const existing = this.cache.get(key);

        // Check if we're updating with the same texture object
        if (existing && existing.texture === texture) {
            // Just update access time and count
            this.touchEntry(key, existing);
            return;
        }

        // Dispose of existing texture if it exists
        if (existing) {
            this.currentMemoryUsage -= existing.size;
            existing.texture.dispose();
        }

        // Calculate new texture size
        const textureSize = options.size || this.calculateTextureSize(texture, { isDataTexture: false });

        // Check memory budget before adding
        if (this.currentMemoryUsage + textureSize > this.MEMORY_BUDGET_BYTES) {
            this.evictForSpace(textureSize);
        }

        // Add updated texture to cache
        this.cache.set(key, {
            texture,
            size: textureSize,
            lastAccessed: ++this.accessCounter,
            accessCount: 1
        });
        this.currentMemoryUsage += textureSize;

        if (process.env.NODE_ENV === 'development') {
            console.log(`[TextureCache] Updated: ${key}, Size: ${(textureSize / 1024 / 1024).toFixed(2)}MB, Total: ${(this.currentMemoryUsage / 1024 / 1024).toFixed(2)}MB`);
        }
    }

    // Private methods

    private touchEntry(key: string, entry: CacheEntry): void {
        entry.lastAccessed = ++this.accessCounter;

        // Prevent access count overflow and reset if too high
        if (entry.accessCount < Number.MAX_SAFE_INTEGER - 1) {
            entry.accessCount++;
        } else {
            // Reset access count to prevent overflow, but keep the texture
            entry.accessCount = Math.floor(entry.accessCount / 2);
        }
    }

    private calculateTextureSize(texture: THREE.Texture, options: { isDataTexture?: boolean } = {}): number {
        // Validate texture input
        if (!texture || !texture.image) {
            console.warn('[TextureCache] Invalid texture provided for size calculation');
            return 0;
        }

        const image = texture.image;
        const width = image.width || 512;
        const height = image.height || 512;

        // Determine bytes per pixel based on texture type and format
        let bytesPerPixel = 4; // Default RGBA

        // Check for compressed textures
        if ((texture as any).isCompressedTexture) {
            // Compressed textures use different calculation
            // DXT1: ~0.5 bytes per pixel, DXT5: ~1 byte per pixel
            bytesPerPixel = 0.75;
        } else if (options.isDataTexture) {
            // Data textures (normal, displacement, etc.) typically use RGBA format
            bytesPerPixel = 4;
        } else {
            // Check for half-float or float textures
            if (texture.type === THREE.HalfFloatType || texture.type === THREE.FloatType) {
                // Float textures use 4 bytes per channel
                bytesPerPixel = 16; // RGBA32F = 4 channels * 4 bytes
            } else if (texture.type === THREE.UnsignedByteType) {
                // Standard byte textures
                bytesPerPixel = 4;
            }
        }

        // Include mipmaps (approximately 33% more for full mipmap chain)
        const mipmapsFactor = texture.generateMipmaps ? 1.33 : 1.0;

        const baseSize = width * height * bytesPerPixel;
        const totalSize = Math.floor(baseSize * mipmapsFactor);

        // Add safety margin for texture metadata and GPU overhead
        return totalSize + 1024; // Add 1KB overhead
    }

    private evictForSpace(requiredBytes: number): void {
        // Sort by access count (least used) then by last accessed (oldest)
        const entries = Array.from(this.cache.entries())
            .sort((a, b) => {
                const entryA = a[1];
                const entryB = b[1];

                // Prioritize by access count, then by recency
                if (entryA.accessCount !== entryB.accessCount) {
                    return entryA.accessCount - entryB.accessCount;
                }
                return entryA.lastAccessed - entryB.lastAccessed;
            });

        let freedSpace = 0;

        for (const [key, entry] of entries) {
            if (freedSpace >= requiredBytes) break;

            this.removeEntry(key, entry);
            freedSpace += entry.size;

            if (process.env.NODE_ENV === 'development') {
                console.log(`[TextureCache] Evicted: ${key}, Freed: ${(entry.size / 1024 / 1024).toFixed(2)}MB`);
            }
        }
    }

    private removeEntry(key: string, entry: CacheEntry): void {
        entry.texture.dispose();
        this.cache.delete(key);
        this.currentMemoryUsage -= entry.size;
    }
}
