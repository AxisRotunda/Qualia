
import { Injectable, inject } from '@angular/core';
import { EngineService } from './engine.service';
import { EntityLibraryService } from './entity-library.service';
import { SceneContext } from '../engine/level/scene-context';
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

  async loadScene(engine: EngineService, sceneId: string) {
    const preset = this.scenes.get(sceneId);
    if (!preset) return;

    engine.level.reset();
    
    // Provide library reference to AssetService for SceneContext lookup
    // This is still needed because SceneContext accesses engine.assetService['entityLib']
    // We should make 'entityLib' public on AssetService to be typesafe or expose it on Engine.
    (engine.assetService as any)['entityLib'] = this.entityLib;

    const ctx = new SceneContext(engine);
    
    // Support both sync and async loaders
    await preset.load(ctx, engine);
    
    if (preset.theme === 'forest' || preset.theme === 'ice') {
        if (!engine.texturesEnabled()) engine.viewport.toggleTextures();
    }
  }
}
