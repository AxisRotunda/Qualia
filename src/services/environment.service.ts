
import { Injectable } from '@angular/core';

/**
 * @deprecated Use SceneService instead.
 * Logic has been consolidated into SceneService to reduce dependency scattering.
 */
@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  init() {}
  setAtmosphere(preset: any) {}
  setLightSettings(settings: any) {}
}
