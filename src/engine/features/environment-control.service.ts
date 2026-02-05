
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { EngineStateService } from '../engine-state.service';
import { EnvironmentManagerService } from '../graphics/environment-manager.service';
import { SceneService } from '../../services/scene.service';
import { ParticleService, WeatherType } from '../../services/particle.service';
import { ATMOSPHERE_PRESETS, AtmosphereDefinition } from '../../config/atmosphere.config';
import { CelestialEngine } from '../logic/celestial-engine';
import { NullShield } from '../utils/string.utils';

@Injectable({
    providedIn: 'root'
})
export class EnvironmentControlService {
    private state = inject(EngineStateService);
    private envManager = inject(EnvironmentManagerService);
    private sceneService = inject(SceneService);
    private particleService = inject(ParticleService);

    private currentPreset: AtmosphereDefinition | null = null;
    private isWhiteSunCached = true;

    // Optimization: Scratch Objects
    private readonly _blendedBg = new THREE.Color();
    private readonly _hemiColor = new THREE.Color();
    private readonly _groundColor = new THREE.Color();
    private readonly _tempSunColor = new THREE.Color();

    /**
   * Applies a complete atmosphere preset.
   * RUN_REF Phase 42.0: Centralized logic driven by AtmosphereDefinition.
   */
    setAtmosphere(presetId: string | null | undefined) {
        const safeId = NullShield.sanitize(presetId) || 'clear';
        this.state.setAtmosphere(safeId);

        const presetFn = ATMOSPHERE_PRESETS[safeId] || ATMOSPHERE_PRESETS.clear;
        this.currentPreset = presetFn();

        const preset = this.currentPreset;

        // 1. Fog & Background Synthesis
        this.envManager.setFog(preset.fog);
        this.envManager.setBackground(preset.background);

        // 2. Volumetric Propagation
        this.envManager.heightFogUniforms.uFogHeight.value = preset.fogHeight ?? 0;
        this.envManager.heightFogUniforms.uFogFalloff.value = preset.fogFalloff ?? 0.01;
        this.envManager.heightFogUniforms.uFogScattering.value = preset.fogScattering ?? 0.0;

        // 3. Baseline Lighting State
        this.state.setAmbientIntensity(preset.ambientIntensity);
        this.state.setSunIntensity(preset.sunIntensity);

        if (preset.sunColor) {
            this.state.setSunColor(preset.sunColor);
            this.isWhiteSunCached = preset.sunColor.toLowerCase() === '#ffffff';
        } else {
            this.isWhiteSunCached = true;
        }

        // 4. Biome Temporal Context
        this.setTimeOfDay(preset.defaultTime ?? 12);

        // 5. Automatic Weather Policy
        if (preset.defaultWeather) {
            this.setWeather(preset.defaultWeather);
        }

        // 6. Stage Visibility Policy
        const isVoidBiome = ['space', 'ice', 'desert', 'blizzard'].includes(safeId);
        this.sceneService.stageService.setVisible(!isVoidBiome);
    }

    setWeather(type: WeatherType) {
        this.state.setWeather(type);
        this.particleService.setWeather(type, this.sceneService.getScene());
    }

    setTimeOfDay(hour: number) {
        this.state.setTimeOfDay(hour);
        this.updateEnvironment(hour);
    }

    toggleDayNightCycle(active: boolean) {
        this.state.setDayNightActive(active);
    }

    setCycleSpeed(speed: number) {
        this.state.setDayNightSpeed(speed);
    }

    /**
   * Manual light overrides usually called by individual Scene presets.
   */
    setLightSettings(settings: { ambientIntensity?: number; dirIntensity?: number; dirColor?: string } | null | undefined) {
        if (!settings) return;

        if (settings.ambientIntensity !== undefined) this.state.setAmbientIntensity(settings.ambientIntensity);
        if (settings.dirIntensity !== undefined) this.state.setSunIntensity(settings.dirIntensity);

        if (settings.dirColor !== undefined) {
            const safeColor = NullShield.trim(settings.dirColor);
            if (safeColor) {
                this.state.setSunColor(safeColor);
                this.isWhiteSunCached = NullShield.safeLowerCase(safeColor) === '#ffffff';
            }
        }
        this.updateEnvironment(this.state.timeOfDay());
    }

    private updateEnvironment(hour: number) {
        if (!this.currentPreset) {
            this.setAtmosphere(this.state.atmosphere());
        }
        const preset = this.currentPreset!;
        const presetId = this.state.atmosphere();

        // 1. Resolve Celestial Body
        // RUN_OPT: Returns reference to static singleton, no allocation.
        const sun = CelestialEngine.calculateSun(hour);
        this.envManager.setSunPosition(sun.position.x, sun.position.y, sun.position.z);
        this.envManager.snapShadowCamera(this.sceneService.getCamera());

        // 2. Resolve Primary Light (Sun)
        if (presetId === 'space') {
            // Manually parse color only when needed
            this._tempSunColor.set(this.state.sunColor());
            this.envManager.setSunProperties(this._tempSunColor, this.state.sunIntensity(), true);
            this.envManager.setEnvironmentLights(new THREE.Color(0x0), new THREE.Color(0x0), this.state.ambientIntensity(), 0.05);
            return;
        }

        const finalSunInt = this.state.sunIntensity() * sun.intensity;

        // Handle sun color mix
        let finalSunCol: THREE.Color;
        if (this.isWhiteSunCached) {
            finalSunCol = sun.color;
        } else {
            this._tempSunColor.set(this.state.sunColor());
            finalSunCol = this._tempSunColor;
        }

        this.envManager.setSunProperties(finalSunCol, finalSunInt, preset.sunShadows);

        // 3. Resolve Ambient Atmosphere (Hemisphere & Background)
        // Top hemisphere: Blend celestial dome with biome fog
        this._hemiColor.copy(sun.ambientSky).lerp(preset.background, 0.4);
        if (preset.hemiColor !== undefined) this._hemiColor.setHex(preset.hemiColor);

        // Bottom hemisphere: Terrain bounce motivated by celestial ground component
        this._groundColor.copy(sun.ambientGround).lerp(preset.background, 0.2);
        if (preset.hemiGround !== undefined) this._groundColor.setHex(preset.hemiGround);

        // Intensity modulation
        const ambientModulator = 0.4 + (0.6 * Math.max(0, sun.elevation));
        const finalAmbient = this.state.ambientIntensity() * ambientModulator;

        // 4. Background & Fog Synthesis
        this._blendedBg.copy(preset.background).lerp(sun.ambientSky, 0.2);
        if (sun.elevation < 0) this._blendedBg.multiplyScalar(0.2);

        this.envManager.setEnvironmentLights(this._hemiColor, this._groundColor, finalAmbient, 0.05);
        this.envManager.setBackground(this._blendedBg);
        this.envManager.updateFogColor(this._blendedBg);
    }
}
