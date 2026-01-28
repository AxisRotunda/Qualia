
// DEPRECATED: Logic moved to src/engine/graphics/environment-manager.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  init() {}
  setAtmosphere(preset: any) {}
  setLightSettings(settings: any) {}
}
