
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { EngineStateService } from './engine-state.service';
import { SceneService } from '../services/scene.service';
import { EntityStoreService } from './ecs/entity-store.service';
import { CameraControlService, CameraViewPreset } from './controllers/camera-control.service';
import { FlyControlsService } from './controllers/fly-controls.service';
import { CharacterControllerService } from './controllers/character-controller.service';
import { GameInputService } from '../services/game-input.service';

@Injectable({
  providedIn: 'root'
})
export class InputManagerService {
  private state = inject(EngineStateService);
  private sceneService = inject(SceneService);
  private entityStore = inject(EntityStoreService);
  private gameInput = inject(GameInputService);

  // Controllers
  private cameraControl = inject(CameraControlService);
  private flyControls = inject(FlyControlsService);
  private charController = inject(CharacterControllerService);

  init() {
    const canvas = this.sceneService.getDomElement();
    const camera = this.sceneService.getCamera();
    
    this.cameraControl.init(camera, canvas);
    this.flyControls.init(camera, canvas);
  }

  update(dt: number) {
    const mode = this.state.mode();
    if (mode === 'explore') {
        this.flyControls.update(dt);
    } else if (mode === 'walk') {
        this.charController.update(dt);
    } else {
        const dragging = this.sceneService.isDraggingGizmo();
        // Disable camera control if dragging gizmo or if menu is open
        const camActive = !dragging && !this.state.mainMenuVisible();
        this.cameraControl.setEnabled(camActive);
        this.cameraControl.update();
    }
  }

  setMode(mode: 'edit' | 'explore' | 'walk') {
      const previous = this.state.mode();
      if (previous === mode) return;
      const canvas = this.sceneService.getDomElement();

      // Teardown previous
      if (previous === 'explore') this.flyControls.disable();
      if (previous === 'walk') { 
          this.charController.destroy(); 
          this.gameInput.exitPointerLock(); 
      }
      if (previous === 'edit') this.cameraControl.setEnabled(false);

      this.state.mode.set(mode);
      
      // Setup new
      if (mode === 'edit') {
          this.cameraControl.setEnabled(true);
          this.gameInput.exitPointerLock();
      } else if (mode === 'explore') {
          this.entityStore.selectedEntity.set(null); 
          this.flyControls.enable();
          this.gameInput.requestPointerLock(canvas);
      } else if (mode === 'walk') {
          this.entityStore.selectedEntity.set(null);
          this.charController.init(this.sceneService.getCamera().position.clone());
          this.gameInput.requestPointerLock(canvas);
      }
  }

  toggleMode() {
      const m = this.state.mode();
      this.setMode(m === 'edit' ? 'walk' : m === 'walk' ? 'explore' : 'edit');
  }

  // --- Delegation ---

  setCameraPreset(p: CameraViewPreset) {
      this.cameraControl.setPreset(p);
  }

  resetCamera() {
      this.cameraControl.reset();
  }
  
  focusSelectedEntity() {
      const e = this.entityStore.selectedEntity();
      if (e === null) return;
      
      const t = this.entityStore.world.transforms.get(e);
      if (t) {
          this.cameraControl.focusOn(new THREE.Vector3(t.position.x, t.position.y, t.position.z));
      }
  }
}
