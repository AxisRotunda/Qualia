
import { Injectable, inject } from '@angular/core';
import { EngineStateService } from '../engine-state.service';
import { SceneRegistryService } from './scene-registry.service';
import { AssetService } from '../../services/asset.service';
import { SceneContext } from './scene-context';
import { SceneLifecycleService } from './scene-lifecycle.service';
import { EntityStoreService } from '../ecs/entity-store.service';
import { wait, yieldToMain } from '../utils/thread.utils';
import type { EngineService } from '../../services/engine.service';

@Injectable({
  providedIn: 'root'
})
export class SceneLoaderService {
  private state = inject(EngineStateService);
  private sceneRegistry = inject(SceneRegistryService);
  private assetService = inject(AssetService);
  private lifecycle = inject(SceneLifecycleService);
  private entityStore = inject(EntityStoreService);

  private readonly WARMUP_WEIGHT = 0.55; 
  private readonly LOGIC_WEIGHT = 0.35;  

  async load(engine: EngineService, sceneId: string): Promise<boolean> {
    const preset = this.sceneRegistry.getPreset(sceneId);
    if (!preset) {
        this.state.setLoadError(`SCENE_NOT_FOUND: ${sceneId}`);
        return false;
    }

    const startTime = performance.now();
    this.state.setLoading(true);
    this.state.setLoadingProgress(0);
    this.state.setLoadError(null);
    this.state.setLoadingStage('INITIALIZING KERNEL');
    this.state.setLoadingDetail('Allocating memory buffers...');
    
    this.state.updateLoadingTelemetry(t => ({
        ...t,
        entityCount: 0,
        elapsedTime: 0,
        totalAssets: preset.preloadAssets?.length || 0,
        completedAssets: 0
    }));

    try {
      await wait(100); 

      const rawAssets = preset.preloadAssets || [];
      const assetPool = Array.from(new Set(rawAssets));
      const assetCount = assetPool.length;

      if (assetCount > 0) {
        this.state.setLoadingStage('SYNTHESIZING TOPOLOGY');
        for (let i = 0; i < assetCount; i++) {
          const assetId = assetPool[i];
          this.state.setLoadingDetail(`Warming up: ${assetId}`);
          
          try {
              const warmupStart = performance.now();
              this.assetService.warmupAsset(assetId);
          } catch (e) {
              const errMsg = `ASSET_WARMUP_FAILURE: ${assetId}`;
              this.state.setLoadError(errMsg);
              return false; 
          }

          const progress = Math.round(((i + 1) / assetCount) * (this.WARMUP_WEIGHT * 100));
          this.state.setLoadingProgress(5 + progress);
          
          this.state.updateLoadingTelemetry(t => ({
              ...t,
              completedAssets: i + 1,
              elapsedTime: Math.round(performance.now() - startTime)
          }));

          if (i % 2 === 0) await yieldToMain();
        }
      } else {
          this.state.setLoadingProgress(60);
      }

      this.state.setLoadingStage('EXECUTING PROCEDURAL LOGIC');
      this.state.setLoadingDetail('Constructing entity hierarchy...');
      await yieldToMain();
      
      const ctx = new SceneContext(engine);
      
      const monitorInterval = setInterval(() => {
          this.state.updateLoadingTelemetry(t => ({
              ...t,
              entityCount: this.entityStore.objectCount(),
              elapsedTime: Math.round(performance.now() - startTime)
          }));
      }, 100);

      try {
          const loadPromise = preset.load(ctx, engine);
          if (loadPromise instanceof Promise) {
              await loadPromise;
          }
          clearInterval(monitorInterval);
          this.state.setLoadingProgress(95);
      } catch (sceneErr: any) {
          clearInterval(monitorInterval);
          const diag = sceneErr?.message || 'Unknown procedural error';
          this.state.setLoadError(`PROCEDURAL_FAULT: ${diag}`);
          this.lifecycle.onEmergencyPurge.next(sceneId);
          return false; 
      }

      this.state.setLoadingStage('FINALIZING BUFFERS');
      
      if (['forest', 'ice', 'city', 'desert'].includes(preset.theme)) {
          if (!engine.texturesEnabled()) engine.viewport.toggleTextures();
      }

      await yieldToMain();
      this.state.setLoadingProgress(100);
      return true;
    } catch (err: any) {
      this.state.setLoadError(`INFRASTRUCTURE_EXCEPTION: ${err?.message || 'Unstable environment'}`);
      return false;
    }
  }
}
