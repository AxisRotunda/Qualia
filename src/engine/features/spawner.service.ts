
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { EntityLibraryService } from '../../services/entity-library.service';
import { TemplateFactoryService } from '../../services/factories/template-factory.service';
import { EntityStoreService } from '../ecs/entity-store.service';
import { RaycasterService } from '../interaction/raycaster.service';
import { PlacementService } from '../../services/placement.service';
import { EngineStateService } from '../engine-state.service';
import { InputManagerService } from '../input-manager.service';
import { SceneService } from '../../services/scene.service';

@Injectable({
  providedIn: 'root'
})
export class SpawnerService {
  private entityLib = inject(EntityLibraryService);
  private factory = inject(TemplateFactoryService);
  private entityStore = inject(EntityStoreService);
  private raycaster = inject(RaycasterService);
  private placementService = inject(PlacementService);
  private state = inject(EngineStateService);
  private inputManager = inject(InputManagerService);
  private sceneService = inject(SceneService);

  spawnFromTemplate(id: string) {
      // 1. Resolve Template
      const tpl = this.entityLib.getTemplate(id);
      if (!tpl) {
          console.warn(`Cannot spawn: Template '${id}' not found`);
          return;
      }

      // 2. Try spawning on surface (Mouse cursor)
      const hit = this.raycaster.raycastSurface(window.innerWidth / 2, window.innerHeight / 2);
      
      let pos = new THREE.Vector3();
      let rot = new THREE.Quaternion();
      let useBottomAlign = false;

      if (hit) {
          pos.copy(hit.point);
          useBottomAlign = true; // Snap bottom to hit point
      } else {
          // 3. Aerial Spawn (Void)
          const cam = this.sceneService.getCamera();
          const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
          pos.copy(cam.position).add(forward.multiplyScalar(10));
          useBottomAlign = false; // Center at air point
      }

      this.factory.spawn(this.entityStore, tpl, pos, rot, { alignToBottom: useBottomAlign });
  }
  
  startPlacement(id: string) {
      if (this.state.mode() !== 'edit') {
          this.state.mode.set('edit');
          this.inputManager.setMode('edit');
      }
      this.placementService.startPlacement(id);
  }

  spawnBox() { this.spawnFromTemplate('prop-crate'); }
  spawnSphere() { this.spawnFromTemplate('prop-barrel'); }
}
