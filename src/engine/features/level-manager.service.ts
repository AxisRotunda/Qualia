
import { Injectable, inject } from '@angular/core';
import { EngineStateService } from '../engine-state.service';
import { EntityStoreService } from '../ecs/entity-store.service';
import { PhysicsService } from '../../services/physics.service';
import { PersistenceService } from '../persistence.service';
import { InputManagerService } from '../input-manager.service';
import { EnvironmentControlService } from './environment-control.service';
import { SceneGraphService } from '../graphics/scene-graph.service';
import { VisualsFactoryService } from '../graphics/visuals-factory.service';
import { EntityLifecycleService } from '../ecs/entity-lifecycle.service';
import { SceneLoaderService } from '../level/scene-loader.service';
import { SceneLifecycleService } from '../level/scene-lifecycle.service';
import { SceneRegistryService } from '../level/scene-registry.service';
import { wait, yieldToMain } from '../utils/thread.utils';
import type { EngineService } from '../../services/engine.service';

/**
 * LevelManagerService: Orchestrates scene transitions and world state lifecycle.
 * Refactored for RUN_LIFECYCLE: Decoupled resource disposal via Event Bus.
 * Updated for RUN_INDUSTRY: Robust Failover & Golden Path enforcement.
 */
@Injectable({
  providedIn: 'root'
})
export class LevelManagerService {
  private state = inject(EngineStateService);
  private entityStore = inject(EntityStoreService);
  private physicsService = inject(PhysicsService);
  private persistence = inject(PersistenceService);
  private inputManager = inject(InputManagerService);
  private envControl = inject(EnvironmentControlService);
  private sceneGraph = inject(SceneGraphService);
  private visualsFactory = inject(VisualsFactoryService);
  private entityLifecycle = inject(EntityLifecycleService);
  private sceneLifecycle = inject(SceneLifecycleService);
  private sceneRegistry = inject(SceneRegistryService);
  private loader = inject(SceneLoaderService);

  private readonly SAFE_MODE_SCENE = 'proving-grounds';

  async loadScene(engine: EngineService, id: string) {
      // 0. Pre-Flight Validation (Fail Fast)
      if (!this.sceneRegistry.isValidScene(id)) {
          console.error(`[LevelManager] Invalid Scene ID: ${id}`);
          // If the requested ID is invalid, we don't even start the transition.
          // Unless we are already stuck, in which case we force Safe Mode.
          if (this.state.loading()) {
              this.triggerPanic(engine, `INVALID_TARGET: ${id}`);
          }
          return;
      }

      this.state.setLoading(true);
      this.state.setLoadingProgress(0);
      this.state.setLoadingStage('PREPARING TRANSITION');
      this.state.setMainMenuVisible(false);

      // Notify systems to begin teardown
      this.sceneLifecycle.onLoadStart.next({ id, timestamp: Date.now() });

      await wait(50);

      // 1. Purge current world
      this.reset();
      await yieldToMain();

      // 2. Delegate to construction loader
      const success = await this.loader.load(engine, id);

      if (success) {
          this.state.setLoadingStage('STABILIZED');
          this.state.setCurrentSceneId(id);
          this.sceneLifecycle.onLoadComplete.next({ id, timestamp: Date.now() });
          await wait(100); 
          this.state.setLoading(false);
      } else {
          this.triggerPanic(engine, `LOAD_FAILURE: ${id}`);
      }
  }

  private async triggerPanic(engine: EngineService, reason: string) {
      // Protocol [REPAIR]: Emergency recovery to Safe Mode
      this.state.setLoadingStage('KERNEL_PANIC: RECOVERY_INITIATED');
      this.state.setLoadError(reason);
      
      // Let the user see the panic state for a moment (UX: Transparency)
      await wait(3000);
      
      this.state.setLoadingStage('REVERTING_TO_SAFE_ZONE');
      this.reset(); 
      
      // Load Safe Mode as fallback
      // Guard against recursive failure if Safe Mode itself is broken
      if (this.state.currentSceneId() !== this.SAFE_MODE_SCENE) {
          await this.loader.load(engine, this.SAFE_MODE_SCENE);
          this.state.setCurrentSceneId(this.SAFE_MODE_SCENE);
      }
      
      this.state.setLoading(false);
      this.state.setLoadError(null); // Clear error after successful recovery
  }

  /**
   * Resets all engine subsystems to a clean 'void' state.
   * RUN_LIFECYCLE: Broadcasts purge signal to specialized resource managers.
   */
  reset() {
      this.state.setLoadingStage('FLUSHING REGISTRIES');
      
      // 1. Lifecycle Broadcast
      this.sceneLifecycle.beforeUnload.next();

      this.entityStore.selectedEntity.set(null);

      // 2. Subsystem Flush
      this.physicsService.resetWorld();
      
      // Visual Purge
      const children = [...this.sceneGraph.entityGroup.children];
      for (const child of children) {
          this.sceneGraph.removeEntity(child);
          this.visualsFactory.deleteVisuals(-1, child);
      }
      
      this.visualsFactory.disposeRegistries();

      // 3. ECS Data Purge
      this.entityStore.reset();
      
      // 4. World Restoration
      this.entityLifecycle.onWorldReset.next();
      this.sceneLifecycle.onWorldCleared.next();
      
      this.state.setPaused(false);
      this.state.setGravity(-9.81); 
      this.physicsService.setGravity(-9.81);
      this.state.setWaterLevel(null);
      this.state.setLoadError(null);
      
      this.inputManager.resetCamera();
      this.inputManager.setMode('edit');
      
      this.envControl.setTimeOfDay(12);
      this.envControl.setWeather('clear');
  }

  quickSave() { 
      this.persistence.saveToLocal(
          this.persistence.exportScene(
              this.state.currentSceneId(), 
              this.state.gravityY(), 
              this.state.texturesEnabled()
          )
      ); 
  }

  quickLoad(engine: EngineService) { 
      const data = this.persistence.loadFromLocal(); 
      if(data) this.persistence.loadSceneData(data, engine); 
  }

  hasSavedState() { return !!this.persistence.loadFromLocal(); }
  getQuickSaveLabel() { 
      const d = this.persistence.loadFromLocal(); 
      return d?.meta?.label ? `Resume: ${d.meta.label}` : 'Resume Simulation'; 
  }
}
