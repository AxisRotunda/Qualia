import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { EngineStateService } from '../engine-state.service';
import { EnvironmentManagerService } from '../graphics/environment-manager.service';
import { SceneService } from '../../services/scene.service';
import { ParticleService, WeatherType } from '../../services/particle.service';
import { ATMOSPHERE_PRESETS, AtmosphereDefinition } from '../../config/atmosphere.config';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentControlService {
  private state = inject(EngineStateService);
  private envManager = inject(EnvironmentManagerService);
  private sceneService = inject(SceneService);
  private particleService = inject(ParticleService);

  private overrides = {
      ambientIntensity: -1,
      dirIntensity: -1,
      dirColor: null as string | null
  };

  setAtmosphere(presetId: string) {
      this.state.atmosphere.set(presetId);
      
      const presetFn = ATMOSPHERE_PRESETS[presetId] || ATMOSPHERE_PRESETS['clear'];
      const preset = presetFn();
      
      // Initialize basic state
      this.envManager.setFog(preset.fog);
      this.envManager.setBackground(preset.background);
      
      // Auto-set time context based on preset for best look
      if (presetId === 'night') this.setTimeOfDay(22);
      else if (presetId === 'space') this.setTimeOfDay(12); // Space usually static lighting
      else if (presetId === 'forest' || presetId === 'fog') this.setTimeOfDay(8); // Morning light
      else if (presetId === 'city' || presetId === 'ice' || presetId === 'desert') this.setTimeOfDay(14); // Bright afternoon
      else this.setTimeOfDay(12);
      
      // Handle ground visibility logic
      if (['space', 'ice', 'desert', 'blizzard'].includes(presetId)) {
          this.sceneService['stageService'].setVisible(false);
      } else {
          this.sceneService['stageService'].setVisible(true);
      }
  }

  setWeather(type: WeatherType) {
      this.state.weather.set(type);
      this.particleService.setWeather(type, this.sceneService.getScene());
  }

  setTimeOfDay(hour: number) {
      this.state.timeOfDay.set(hour);
      this.updateCelestialState(hour);
  }

  toggleDayNightCycle(active: boolean) {
      this.state.dayNightActive.set(active);
  }

  setCycleSpeed(speed: number) {
      this.state.dayNightSpeed.set(speed);
  }

  setLightSettings(settings: { ambientIntensity?: number; dirIntensity?: number; dirColor?: string }) {
      if (settings.ambientIntensity !== undefined) this.overrides.ambientIntensity = settings.ambientIntensity;
      if (settings.dirIntensity !== undefined) this.overrides.dirIntensity = settings.dirIntensity;
      if (settings.dirColor !== undefined) this.overrides.dirColor = settings.dirColor;
      
      // Force update to apply overrides
      this.updateCelestialState(this.state.timeOfDay());
  }

  private updateCelestialState(hour: number) {
      const presetId = this.state.atmosphere();
      const presetFn = ATMOSPHERE_PRESETS[presetId] || ATMOSPHERE_PRESETS['clear'];
      const preset = presetFn();

      // 1. Calculate Orbit
      // Convert hour 0-24 to radians 0-2PI, offset by -PI/2 so 6am is 0 radians (horizon)
      const normTime = ((hour - 6) / 24) * Math.PI * 2;
      const radius = 150;
      const x = Math.cos(normTime) * radius; // East-West
      const y = Math.sin(normTime) * radius; // Up-Down
      const z = Math.cos(normTime * 0.5) * 40; // Slight seasonal wobble
      
      this.envManager.setSunPosition(x, y, z);

      // 2. Calculate Colors
      const elevation = y / radius; // -1 to 1
      const isSpace = presetId === 'space';

      if (isSpace) {
          const int = this.overrides.dirIntensity >= 0 ? this.overrides.dirIntensity : 2.5;
          this.envManager.setSunProperties(new THREE.Color(0xffffff), int, true);
          return;
      }

      const sunColor = new THREE.Color();
      const skyColor = new THREE.Color();
      
      let fogDensityScale = 1.0;
      let ambientBase = preset.hemiInt ?? 0.1;

      // Desert/Ice overrides for ambient logic
      if (presetId === 'desert') ambientBase = 0.3;
      else if (presetId === 'ice' || presetId === 'blizzard') ambientBase = 0.5;
      else if (presetId === 'night') ambientBase = 0.02;

      let dirInt = 4.5;
      let castShadow = true;

      if (elevation > 0) {
          // DAYTIME
          if (elevation < 0.2) {
              // Golden Hour
              const t = elevation / 0.2; 
              sunColor.setHSL(0.08, 0.9, 0.6); 
              skyColor.setHSL(0.6 + (0.1 * t), 0.5, 0.2 + (0.4 * t));
              dirInt = Math.max(0, t * 3.5);
          } else {
              // Mid-day
              sunColor.setHSL(0.1, 0.1, 0.98); 
              skyColor.setHSL(0.6, 0.6, 0.6); 
              dirInt = 4.5;
          }
      } else {
          // NIGHTTIME
          sunColor.setHSL(0.6, 0.4, 0.3); 
          skyColor.setHSL(0.66, 0.8, 0.02); 
          dirInt = 0.2; 
      }

      // Apply Overrides
      if (this.overrides.dirIntensity >= 0) dirInt = this.overrides.dirIntensity;
      if (this.overrides.dirColor) sunColor.set(this.overrides.dirColor);

      // Apply Sun
      this.envManager.setSunProperties(sunColor, dirInt, castShadow && preset.sunShadows);

      // Apply Environment (Hemi)
      const blendedBg = preset.background.clone().lerp(skyColor, 0.5);
      
      // Darken at night
      if (elevation < 0) blendedBg.multiplyScalar(0.1); 
      else if (elevation < 0.2) blendedBg.multiplyScalar(0.5 + (elevation/0.2)*0.5);

      const hemiColor = blendedBg.clone().offsetHSL(0, 0, 0.1);
      const groundColor = blendedBg.clone().offsetHSL(0, 0, -0.1);
      const targetAmbient = (elevation > 0) ? ambientBase : ambientBase * 0.2;
      const finalAmbient = this.overrides.ambientIntensity >= 0 ? this.overrides.ambientIntensity : targetAmbient;

      this.envManager.setEnvironmentLights(hemiColor, groundColor, finalAmbient, 0.05); // low static ambient
      this.envManager.setBackground(blendedBg);
      this.envManager.updateFogColor(blendedBg);
  }
}