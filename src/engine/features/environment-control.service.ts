
import { Injectable, inject } from '@angular/core';
import { EngineStateService } from '../engine-state.service';
import { SceneService } from '../../services/scene.service';
import { ParticleService, WeatherType } from '../../services/particle.service';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentControlService {
  private state = inject(EngineStateService);
  private sceneService = inject(SceneService);
  private particleService = inject(ParticleService);

  setAtmosphere(preset: 'clear'|'fog'|'night'|'forest'|'ice'|'space'|'city'|'blizzard') {
      this.state.atmosphere.set(preset);
      this.sceneService.setAtmosphere(preset);
      
      // Auto-set time context based on preset for best look
      if (preset === 'night' || preset === 'space') this.setTimeOfDay(22);
      else if (preset === 'forest' || preset === 'fog') this.setTimeOfDay(8); // Morning light
      else if (preset === 'city' || preset === 'ice') this.setTimeOfDay(14); // Bright afternoon
      else this.setTimeOfDay(12);
  }

  setWeather(type: WeatherType) {
      this.state.weather.set(type);
      this.particleService.setWeather(type, this.sceneService.getScene());
  }

  setTimeOfDay(hour: number) {
      this.state.timeOfDay.set(hour);
      this.sceneService.setTimeOfDay(hour);
  }

  setLightSettings(settings: { ambientIntensity?: number; dirIntensity?: number; dirColor?: string }) {
      this.sceneService.setLightSettings(settings);
  }
}
