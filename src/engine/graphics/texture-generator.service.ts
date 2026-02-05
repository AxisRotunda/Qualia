/**
 * Texture Generator Service
 * Central service for procedural texture generation with caching support
 *
 * @scope Graphics Pipeline
 * @source src/engine/graphics/texture-generator.service.ts
 */

import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { NatureTextureService } from './textures/nature-texture.service';
import { PatternTextureService } from './textures/pattern-texture.service';
import { TechTextureService } from './textures/tech-texture.service';
import { TextureCacheService } from './textures/texture-cache.service';

@Injectable({
    providedIn: 'root'
})
export class TextureGeneratorService {
    public nature = inject(NatureTextureService);
    public pattern = inject(PatternTextureService);
    public tech = inject(TechTextureService);
    private cache = inject(TextureCacheService);

    // ==========================================
    // Nature Textures
    // ==========================================

    createNoiseTexture(colorHex: string, intensity: number, scale = 1): THREE.Texture {
        const cacheKey = `noise-${colorHex}-${intensity}-${scale}`;
        return this.cache.getOrCreate(cacheKey, () =>
            this.nature.createNoiseTexture(colorHex, intensity, scale)
        );
    }

    createIceTexture(): THREE.Texture {
        return this.cache.getOrCreate('ice', () => this.nature.createIceTexture());
    }

    createWaterNormal(scale = 1): THREE.Texture {
        const cacheKey = `water-normal-${scale}`;
        return this.cache.getOrCreate(cacheKey, () =>
            this.nature.createWaterNormal(scale)
        , { isDataTexture: true });
    }

    // --- New PBR Bridges ---
    createRockNormal(scale = 1): THREE.Texture {
        const cacheKey = `rock-normal-${scale}`;
        return this.cache.getOrCreate(cacheKey, () =>
            this.nature.createRockNormal(scale)
        , { isDataTexture: true });
    }

    createBarkNormal(scale = 1): THREE.Texture {
        const cacheKey = `bark-normal-${scale}`;
        return this.cache.getOrCreate(cacheKey, () =>
            this.nature.createBarkNormal(scale)
        , { isDataTexture: true });
    }
    // ---------------------

    // ==========================================
    // Pattern Textures
    // ==========================================

    createGridTexture(bgHex: string, lineHex: string, segments = 8, scale = 1): THREE.Texture {
        const cacheKey = `grid-${bgHex}-${lineHex}-${segments}-${scale}`;
        return this.cache.getOrCreate(cacheKey, () =>
            this.pattern.createGridTexture(bgHex, lineHex, segments, scale)
        );
    }

    createBrickTexture(brickHex: string, mortarHex: string, scale = 1): THREE.Texture {
        const cacheKey = `brick-${brickHex}-${mortarHex}-${scale}`;
        return this.cache.getOrCreate(cacheKey, () =>
            this.pattern.createBrickTexture(brickHex, mortarHex, scale)
        );
    }

    createMarbleTexture(baseHex: string, veinHex: string, scale = 1): THREE.Texture {
        const cacheKey = `marble-${baseHex}-${veinHex}-${scale}`;
        return this.cache.getOrCreate(cacheKey, () =>
            this.pattern.createMarbleTexture(baseHex, veinHex, scale)
        );
    }

    createCarpetTexture(colorHex: string, patternHex: string): THREE.Texture {
        const cacheKey = `carpet-${colorHex}-${patternHex}`;
        return this.cache.getOrCreate(cacheKey, () =>
            this.pattern.createCarpetTexture(colorHex, patternHex)
        );
    }

    createCityWindowTexture(frameHex: string, glassHex: string, litHex: string, density = 4): THREE.Texture {
        const cacheKey = `city-window-${frameHex}-${glassHex}-${litHex}-${density}`;
        return this.cache.getOrCreate(cacheKey, () =>
            this.pattern.createCityWindowTexture(frameHex, glassHex, litHex, density)
        );
    }

    createCityWindowNormal(density = 4): THREE.Texture {
        const cacheKey = `city-window-normal-${density}`;
        return this.cache.getOrCreate(cacheKey, () =>
            this.pattern.createCityWindowNormal(density)
        , { isDataTexture: true });
    }

    // ==========================================
    // Tech Textures
    // ==========================================

    createTechScreenCode(baseHex: string, textHex: string): THREE.Texture {
        const cacheKey = `tech-screen-${baseHex}-${textHex}`;
        return this.cache.getOrCreate(cacheKey, () =>
            this.tech.createTechScreenCode(baseHex, textHex)
        );
    }

    createTechScreenMap(): THREE.Texture {
        return this.cache.getOrCreate('tech-screen-map', () =>
            this.tech.createTechScreenMap()
        );
    }

    createServerRackTexture(): THREE.Texture {
        return this.cache.getOrCreate('server-rack', () =>
            this.tech.createServerRackTexture()
        );
    }

    // ==========================================
    // Cache Management
    // ==========================================

    /**
   * Get cache statistics for debugging and monitoring
   */
    getCacheStats() {
        return this.cache.getStats();
    }

    /**
   * Clear all cached textures
   */
    clearCache(): void {
        this.cache.clear();
    }

    /**
   * Cleanup unused textures older than specified threshold
   */
    cleanupUnusedTextures(thresholdMs: number = 60000): number {
        return this.cache.cleanupUnused(thresholdMs);
    }
}
