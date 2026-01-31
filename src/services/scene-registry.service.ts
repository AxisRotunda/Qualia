
import { Injectable, inject } from '@angular/core';
import { EngineService } from './engine.service';
import { SceneContext } from '../engine/level/scene-context';
import { SCENE_DEFINITIONS } from '../data/scene-definitions';
import { ScenePreset } from '../data/scene-types';

@Injectable({
  providedIn: 'root'
})
export class SceneRegistryService {
  private scenes = new Map<string, ScenePreset>();

  constructor() {
    SCENE_DEFINITIONS.forEach(s => this.scenes.set(s.id, s));
  }

  listScenes() { return Array.from(this.scenes.values()); }
  getPreset(id: string) { return this.scenes.get(id); }
  getLabel(id: string) { return this.scenes.get(id)?.label ?? 'Unknown Scene'; }

  async loadScene(engine: EngineService, sceneId: string) {
    const preset = this.scenes.get(sceneId);
    if (!preset) return;

    engine.level.reset();
    
    // Context now accesses engine.library directly via public API
    const ctx = new SceneContext(engine);
    
    // Support both sync and async loaders
    await preset.load(ctx, engine);
    
    if (preset.theme === 'forest' || preset.theme === 'ice') {
        if (!engine.texturesEnabled()) engine.viewport.toggleTextures();
    }
  }
}
