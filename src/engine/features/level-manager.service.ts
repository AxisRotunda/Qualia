
import { Injectable, inject } from '@angular/core';
import { EngineStateService } from '../engine-state.service';
import { EntityStoreService } from '../ecs/entity-store.service';
import { PhysicsService } from '../../services/physics.service';
import { SceneRegistryService } from '../../services/scene-registry.service';
import { PersistenceService } from '../persistence.service';
import { InputManagerService } from '../input-manager.service';
import { EnvironmentControlService } from './environment-control.service';
import { SceneGraphService } from '../graphics/scene-graph.service';
import { VisualsFactoryService } from '../graphics/visuals-factory.service';
import { VisibilityManagerService } from '../graphics/visibility-manager.service';
import { wait } from '../utils/thread.utils';

@Injectable({
  providedIn: 'root'
})
export class LevelManagerService {
  private state = inject(EngineStateService);
  private entityStore = inject(EntityStoreService);
  private physicsService = inject(PhysicsService);
  private sceneRegistry = inject(SceneRegistryService);
  private persistence = inject(PersistenceService);
  private inputManager = inject(InputManagerService);
  private envControl = inject(EnvironmentControlService);
  private sceneGraph = inject(SceneGraphService);
  private visualsFactory = inject(VisualsFactoryService);
  private visibilityManager = inject(VisibilityManagerService);

  async loadScene(engineContext: any, id: string) {
      this.state.loading.set(true);
      this.state.loadingProgress.set(0);
      this.state.loadingStage.set('BOOT SEQUENCE');
      this.state.mainMenuVisible.set(false);

      // Brief delay to allow UI to render the loading screen
      await wait(50);

      let success = false;

      try {
        await this.sceneRegistry.loadScene(engineContext, id);
        success = true;
      } catch (err) {
        console.error('Scene load failed', err);
        this.state.loadingStage.set('CRITICAL FAIL - RESETTING');
        await wait(1000);
        this.reset();
      } finally {
        if (success) {
            this.state.loadingProgress.set(100);
            this.state.loadingStage.set('SYSTEM READY');
            await wait(600); 
            this.state.currentSceneId.set(id);
        } else {
            this.state.currentSceneId.set(null); 
        }
        this.state.loading.set(false);
      }
  }

  reset() {
      this.state.loadingStage.set('PURGING DATA');
      
      // 1. Clear State
      this.entityStore.selectedEntity.set(null);

      // 2. Bulk Physics Reset
      this.physicsService.resetWorld();

      // 3. Bulk Visual Reset
      const children = [...this.sceneGraph.entityGroup.children];
      for (const child of children) {
          this.sceneGraph.removeEntity(child);
          this.visualsFactory.disposeMesh(child);
      }

      // 4. ECS & Systems Reset
      this.entityStore.reset();
      this.visibilityManager.reset();
      
      // 5. Restore Defaults
      this.state.isPaused.set(false);
      this.state.gravityY.set(-9.81); 
      this.physicsService.setGravity(-9.81);
      
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

  quickLoad(engineContext: any) { 
      const data = this.persistence.loadFromLocal(); 
      if(data) this.persistence.loadSceneData(data, engineContext); 
  }

  hasSavedState() { return !!this.persistence.loadFromLocal(); }
  getQuickSaveLabel() { const d = this.persistence.loadFromLocal(); return d?.meta?.label ? `Continue: ${d.meta.label}` : 'Continue'; }
}
