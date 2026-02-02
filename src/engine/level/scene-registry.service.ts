
import { Injectable } from '@angular/core';
import { SCENE_DEFINITIONS } from '../../data/scene-definitions';
import { ScenePreset } from '../../data/scene-types';

@Injectable({
  providedIn: 'root'
})
export class SceneRegistryService {
  private scenes = new Map<string, ScenePreset>();

  constructor() {
    SCENE_DEFINITIONS.forEach(s => this.scenes.set(s.id, s));
  }

  listScenes(): ScenePreset[] { 
    return Array.from(this.scenes.values()); 
  }

  getPreset(id: string): ScenePreset | undefined { 
    return this.scenes.get(id); 
  }

  isValidScene(id: string): boolean {
      return this.scenes.has(id);
  }

  getLabel(id: string): string { 
    return this.scenes.get(id)?.label ?? 'Unknown Scene'; 
  }
}
