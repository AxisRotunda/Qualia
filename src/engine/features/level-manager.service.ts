
import { Injectable, inject } from '@angular/core';
import { EngineStateService } from '../engine-state.service';
import { EntityManager } from '../entity-manager.service';
import { PhysicsService } from '../../services/physics.service';
import { SceneRegistryService } from '../../services/scene-registry.service';
import { PersistenceService } from '../persistence.service';
import { InputManagerService } from '../input-manager.service';
import { EnvironmentControlService } from './environment-control.service';
import { EntityLibraryService } from '../../services/entity-library.service';

@Injectable({
  providedIn: 'root'
})
export class LevelManagerService {
  private state = inject(EngineStateService);
  private entityMgr = inject(EntityManager);
  private physicsService = inject(PhysicsService);
  private sceneRegistry = inject(SceneRegistryService);
  private persistence = inject(PersistenceService);
  private inputManager = inject(InputManagerService);
  private envControl = inject(EnvironmentControlService);
  private entityLib = inject(EntityLibraryService);

  loadScene(engineContext: any, id: string) {
      this.sceneRegistry.loadScene(engineContext, id);
      this.state.currentSceneId.set(id);
      this.state.mainMenuVisible.set(false);
  }

  reset() {
      this.entityMgr.reset();
      this.state.isPaused.set(false);
      
      // Default Gravity
      this.state.gravityY.set(-9.81); 
      this.physicsService.setGravity(-9.81);
      
      this.inputManager.resetCamera();
      this.inputManager.setMode('edit');
      
      // Defaults
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
