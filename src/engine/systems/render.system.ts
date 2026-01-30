
import { Injectable, inject } from '@angular/core';
import { GameSystem } from '../system';
import { SceneService } from '../../services/scene.service';
import { EngineStateService } from '../engine-state.service';
import { EntityManager } from '../entity-manager.service';
import * as THREE from 'three';

@Injectable({ providedIn: 'root' })
export class RenderSystem implements GameSystem {
  readonly priority = 900;
  private scene = inject(SceneService);
  private state = inject(EngineStateService);
  private entityMgr = inject(EntityManager);

  // Culling State
  private readonly CULL_DIST_SQ = 150 * 150; // 150m draw distance for small objects
  private readonly LARGE_OBJECT_THRESHOLD = 5.0; // Objects larger than 5m are always drawn (structures)

  update(): void {
    const cam = this.scene.getCamera();
    const camPos = cam.position;

    // 1. View Culling Pass (LOD)
    // We iterate meshes to toggle visibility based on distance.
    // This reduces draw calls for distant small props (debris, rocks).
    this.entityMgr.world.meshes.forEach((ref, entity) => {
        const mesh = ref.mesh;
        
        // Skip if this is the selected entity (always visible)
        if (this.entityMgr.selectedEntity() === entity) {
            mesh.visible = true;
            return;
        }

        // Compute approx size (bounding sphere radius) if not cached
        if (!mesh.userData['radius']) {
            if (!mesh.geometry.boundingSphere) mesh.geometry.computeBoundingSphere();
            mesh.userData['radius'] = mesh.geometry.boundingSphere?.radius || 1.0;
        }
        
        const radius = mesh.userData['radius'] * Math.max(mesh.scale.x, Math.max(mesh.scale.y, mesh.scale.z));

        // Always draw large structures
        if (radius > this.LARGE_OBJECT_THRESHOLD) {
            mesh.visible = true;
            return;
        }

        // Distance check
        const distSq = camPos.distanceToSquared(mesh.position);
        
        // Simple Logic: Hide if > 150m away AND small
        if (distSq > this.CULL_DIST_SQ) {
            mesh.visible = false;
        } else {
            mesh.visible = true;
        }
    });

    // 2. Selection Helper Update
    if (this.entityMgr.selectedEntity() !== null) {
      this.scene.updateSelectionHelper();
    }

    // 3. Render
    const rStart = performance.now();
    this.scene.render();
    this.state.renderTime.set(Math.round((performance.now() - rStart) * 100) / 100);
  }
}
