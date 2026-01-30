
import { Injectable, inject } from '@angular/core';
import { EngineService } from './engine.service';
import { EntityLibraryService } from './entity-library.service';
import { SCENE_DEFINITIONS } from '../data/scene-definitions';
import { ScenePreset } from '../data/scene-types';

@Injectable({
  providedIn: 'root'
})
export class SceneRegistryService {
  private entityLib = inject(EntityLibraryService);
  private scenes = new Map<string, ScenePreset>();

  constructor() {
    SCENE_DEFINITIONS.forEach(s => this.scenes.set(s.id, s));
  }

  listScenes() { return Array.from(this.scenes.values()); }
  getPreset(id: string) { return this.scenes.get(id); }
  getLabel(id: string) { return this.scenes.get(id)?.label ?? 'Unknown Scene'; }

  loadScene(engine: EngineService, sceneId: string) {
    const preset = this.scenes.get(sceneId);
    if (!preset) return;

    engine.reset();
    preset.load(engine, this.entityLib);
    
    if (preset.theme === 'forest' || preset.theme === 'ice') {
        if (!engine.texturesEnabled()) engine.toggleTextures();
    }
  }
}
