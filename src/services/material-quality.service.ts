/**
 * Material Quality Service
 * Manages material quality settings and applies them to Three.js materials
 *
 * @scope Graphics Pipeline
 * @source src/services/material-quality.service.ts
 */

import { Injectable, inject, effect, signal } from '@angular/core';
import * as THREE from 'three';
import {
    QualityLevel,
    QUALITY_SETTINGS,
    MaterialQualitySettings,
    detectQualityLevel
} from '../config/quality.config';
import { EngineStateService } from '../engine/engine-state.service';

@Injectable({
    providedIn: 'root'
})
export class MaterialQualityService {
    private engineState = inject(EngineStateService);

    // Signal for reactive quality level changes
    currentLevel = signal<QualityLevel>('medium');

    // Cached settings for current level
    private currentSettings = signal<MaterialQualitySettings>(QUALITY_SETTINGS.medium.materials);

    constructor() {
        // Auto-detect quality level on initialization
        this.initializeQualityLevel();

        // React to quality level changes
        effect(() => {
            const level = this.currentLevel();
            this.currentSettings.set(QUALITY_SETTINGS[level].materials);

            if (process.env.NODE_ENV === 'development') {
                console.log(`[MaterialQuality] Level changed to: ${level}`);
            }
        });
    }

    /**
     * Initialize quality level based on device capabilities
     */
    private initializeQualityLevel(): void {
        const detectedLevel = detectQualityLevel();
        this.currentLevel.set(detectedLevel);
    }

    /**
     * Manually set quality level
     */
    setQualityLevel(level: QualityLevel): void {
        this.currentLevel.set(level);
    }

    /**
     * Get current quality settings
     */
    getSettings(): MaterialQualitySettings {
        return this.currentSettings();
    }

    /**
     * Apply quality settings to a StandardMaterial
     */
    applyToStandardMaterial(material: THREE.MeshStandardMaterial): void {
        const settings = this.currentSettings();

        // Apply roughness and metalness limits based on quality
        material.roughness = Math.min(material.roughness, 1.0);
        material.metalness = settings.metalnessMapEnabled ? material.metalness : 0;

        // Anisotropy for texture quality
        if (material.map) {
            material.map.anisotropy = settings.anisotropy;
        }
        if (material.normalMap) {
            material.normalMap.anisotropy = settings.anisotropy;
        }
        if (material.roughnessMap) {
            material.roughnessMap.anisotropy = settings.anisotropy;
        }
        if (material.metalnessMap) {
            material.metalnessMap.anisotropy = settings.anisotropy;
        }
    }

    /**
     * Apply quality settings to a PhysicalMaterial
     */
    applyToPhysicalMaterial(material: THREE.MeshPhysicalMaterial): void {
        const settings = this.currentSettings();

        // Apply core PBR features based on quality level
        material.clearcoat = Math.min(material.clearcoat, settings.clearcoat);
        material.clearcoatRoughness = settings.clearcoatRoughness;
        material.transmission = Math.min(material.transmission, settings.transmission);
        material.thickness = settings.thickness;
        material.ior = settings.ior;

        // Reflectivity
        material.reflectivity = settings.reflectivity;

        // Anisotropy for texture quality
        if (material.map) {
            material.map.anisotropy = settings.anisotropy;
        }
        if (material.normalMap) {
            material.normalMap.anisotropy = settings.anisotropy;
        }

        // Disable expensive features for low quality
        if (!settings.attenuationColor) {
            material.attenuationColor = new THREE.Color(1, 1, 1);
        }

        // Optimize shadow mapping
        this.optimizeShadowMap(material);
    }

    /**
     * Create material with quality-appropriate settings
     */
    createMaterial(
        type: 'standard' | 'physical',
        params: Partial<THREE.MeshStandardMaterialParameters> = {}
    ): THREE.Material {
        const settings = this.currentSettings();

        if (type === 'physical' && settings.clearcoat > 0) {
            const material = new THREE.MeshPhysicalMaterial({
                ...params,
                clearcoat: Math.min((params as any).clearcoat || 0, settings.clearcoat),
                clearcoatRoughness: settings.clearcoatRoughness,
                transmission: Math.min((params as any).transmission || 0, settings.transmission),
                thickness: settings.thickness,
                ior: settings.ior
            });

            this.applyToPhysicalMaterial(material);
            return material;
        }
        // Fall back to standard material for low quality
        const material = new THREE.MeshStandardMaterial(params);
        this.applyToStandardMaterial(material);
        return material;

    }

    /**
     * Optimize material maps based on quality settings
     */
    optimizeMaterialMaps(material: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial): void {
        const settings = this.currentSettings();

        // Disable displacement maps for low quality
        if (!settings.displacementMapEnabled && material.displacementMap) {
            material.displacementMap = null;
            material.needsUpdate = true;
        }

        // Disable roughness/metalness maps if not supported
        if (!settings.roughnessMapEnabled && material.roughnessMap) {
            material.roughnessMap = null;
            material.needsUpdate = true;
        }

        if (!settings.metalnessMapEnabled && 'metalnessMap' in material && material.metalnessMap) {
            material.metalnessMap = null;
            material.needsUpdate = true;
        }

        // Optimize normal map usage
        if (!settings.normalMapEnabled && material.normalMap) {
            material.normalMap = null;
            material.needsUpdate = true;
        }
    }

    /**
     * Get recommended texture size for current quality level
     */
    getRecommendedTextureSize(): number {
        return this.currentSettings().textureSize;
    }

    /**
     * Check if a feature is enabled at current quality level
     */
    isFeatureEnabled(feature: keyof MaterialQualitySettings): boolean {
        const value = this.currentSettings()[feature];
        if (typeof value === 'boolean') {
            return value;
        }
        if (typeof value === 'number') {
            return value > 0;
        }
        return true;
    }

    /**
     * Batch apply quality settings to multiple materials
     */
    batchApplyMaterials(materials: THREE.Material[]): void {
        materials.forEach(material => {
            if (material instanceof THREE.MeshPhysicalMaterial) {
                this.applyToPhysicalMaterial(material);
            } else if (material instanceof THREE.MeshStandardMaterial) {
                this.applyToStandardMaterial(material);
            }
        });
    }

    /**
     * Get quality metrics for debugging
     */
    getMetrics(): {
        level: QualityLevel;
        settings: MaterialQualitySettings;
        recommendedTextureSize: number;
        features: Record<string, boolean>;
        } {
        const settings = this.currentSettings();

        return {
            level: this.currentLevel(),
            settings,
            recommendedTextureSize: settings.textureSize,
            features: {
                clearcoat: settings.clearcoat > 0,
                transmission: settings.transmission > 0,
                displacement: settings.displacementMapEnabled,
                ssao: false, // Would need SSAO service
                ssr: false // Would need SSR service
            }
        };
    }

    /**
     * Optimize shadow map settings for current quality
     */
    private optimizeShadowMap(material: THREE.Material): void {
        const settings = this.currentSettings();

        // Adjust shadow-related material properties
        if (material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshPhysicalMaterial) {
            // Disable expensive shadow features for low quality
            if (settings.shadowMapSize < 2048) {
                // Note: customDepthMaterial is not available on standard materials
                // This would be handled by the renderer's shadow system
                // For now, we'll just ensure the material is properly configured for shadows
                material.needsUpdate = true;
            }
        }
    }
}
