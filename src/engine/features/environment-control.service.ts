
import { Injectable, inject } from '@angular/core';
import { EngineStateService } from '../engine-state.service';
import { EnvironmentManagerService } from '../graphics/environment-manager.service';
import { SceneService } from '../../services/scene.service';
import { ParticleService, WeatherType } from '../../services/particle.service';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentControlService {
  private state = inject(EngineStateService);
  private envManager = inject(EnvironmentManagerService);
  private sceneService = inject(SceneService); // Still needed for Scene ref for particles
  private particleService = inject(ParticleService);

  setAtmosphere(preset: 'clear'|'fog'|'night'|'forest'|'ice'|'space'|'city'|'blizzard'|'desert') {
      this.state.atmosphere.set(preset);
      this.envManager.setAtmosphere(preset);
      
      // Auto-set time context based on preset for best look
      if (preset === 'night' || preset === 'space') this.setTimeOfDay(22);
      else if (preset === 'forest' || preset === 'fog') this.setTimeOfDay(8); // Morning light
      else if (preset === 'city' || preset === 'ice' || preset === 'desert') this.setTimeOfDay(14); // Bright afternoon
      else this.setTimeOfDay(12);
      
      // Handle ground visibility logic which was previously in SceneService
      // Hide ground for space (void) and organic terrain scenes where we generate our own floor
      if (['space', 'ice', 'desert', 'blizzard'].includes(preset)) {
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
      this.envManager.setTimeOfDay(hour);
  }

  setLightSettings(settings: { ambientIntensity?: number; dirIntensity?: number; dirColor?: string }) {
      this.envManager.setLightSettings(settings);
  }
}
