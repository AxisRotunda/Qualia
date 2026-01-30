
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { EntityLibraryService } from '../../services/entity-library.service';
import { EntityManager } from '../entity-manager.service';
import { InteractionService } from '../interaction.service';
import { PlacementService } from '../../services/placement.service';
import { EngineStateService } from '../engine-state.service';
import { InputManagerService } from '../input-manager.service';

@Injectable({
  providedIn: 'root'
})
export class SpawnerService {
  private entityLib = inject(EntityLibraryService);
  private entityMgr = inject(EntityManager);
  private interaction = inject(InteractionService);
  private placementService = inject(PlacementService);
  private state = inject(EngineStateService);
  private inputManager = inject(InputManagerService);

  spawnFromTemplate(id: string) {
      // Use center of screen
      const hit = this.interaction.raycastSurface(window.innerWidth / 2, window.innerHeight / 2);
      
      let pos = new THREE.Vector3(0, 5, 0);
      let rot = new THREE.Quaternion();

      if (hit) {
          pos.copy(hit.point);
          // For instant spawn, we can optionally align or just keep upright.
          // Let's check template? For simplicity, we just place it.
          // Physics will handle settling.
          
          // Slight upward nudge to prevent clipping floor immediately
          const tpl = this.entityLib.templates.find(t => t.id === id);
          if (tpl && tpl.geometry !== 'mesh') {
              pos.y += tpl.size.y / 2;
          } else {
              pos.y += 0.1;
          }
      }

      this.entityLib.spawnFromTemplate(this.entityMgr, id, pos, rot);
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
