
import { Injectable, inject } from '@angular/core';
import { EngineStateService } from '../engine-state.service';
import { SceneRegistryService } from '../../services/scene-registry.service';
import { AssetService } from '../../services/asset.service';
import { yieldToMain, wait } from '../utils/thread.utils';
import type { EngineService } from '../../services/engine.service';

@Injectable({
  providedIn: 'root'
})
export class SceneLoaderService {
  private state = inject(EngineStateService);
  private sceneRegistry = inject(SceneRegistryService);
  private assetService = inject(AssetService);

  async load(engine: EngineService, sceneId: string): Promise<boolean> {
    const preset = this.sceneRegistry.getPreset(sceneId);
    if (!preset) {
      console.error(`SceneLoader: Preset '${sceneId}' not found.`);
      return false;
    }

    try {
      // 1. Preload Assets
      if (preset.preloadAssets && preset.preloadAssets.length > 0) {
        this.state.loadingStage.set('GENERATING ASSETS');
        const total = preset.preloadAssets.length;

        for (let i = 0; i < total; i++) {
          const assetId = preset.preloadAssets[i];
          this.assetService.warmupAsset(assetId);

          // Update progress (0-50% range dedicated to asset gen)
          const progress = Math.round((i / total) * 50);
          this.state.loadingProgress.set(progress);

          // Yield to main thread every few assets to keep UI responsive
          if (i % 3 === 0) await yieldToMain();
        }
      }

      // 2. Load Scene Logic
      // Start loading logic at 50% progress
      this.state.loadingProgress.set(50);
      this.state.loadingStage.set('INITIALIZING WORLD');
      
      await this.sceneRegistry.loadScene(engine, sceneId);
      
      return true;
    } catch (err) {
      console.error('SceneLoader: Critical failure', err);
      return false;
    }
  }
}
