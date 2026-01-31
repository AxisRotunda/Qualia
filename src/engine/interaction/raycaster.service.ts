
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { SceneService } from '../../services/scene.service';
import { SceneGraphService } from '../graphics/scene-graph.service';
import { EntityStoreService } from '../ecs/entity-store.service';
import { InstancedMeshService } from '../graphics/instanced-mesh.service';
import { GizmoManagerService } from '../graphics/gizmo-manager.service';
import { Entity } from '../core';

export interface SurfaceHit {
  point: THREE.Vector3;
  normal: THREE.Vector3;
  entity: Entity | null;
}

@Injectable({
  providedIn: 'root'
})
export class RaycasterService {
  private sceneService = inject(SceneService);
  private sceneGraph = inject(SceneGraphService);
  private entityStore = inject(EntityStoreService);
  private instancedService = inject(InstancedMeshService);
  private gizmoManager = inject(GizmoManagerService);

  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  
  // Cache for lookup
  private meshToEntity = new Map<number, Entity>();
  private lastObjectCount = -1;

  private updateRaycaster(clientX: number, clientY: number): boolean {
      const domEl = this.sceneService.getDomElement();
      if (!domEl) return false;

      if (document.pointerLockElement === domEl) {
          this.mouse.set(0, 0);
      } else {
          const rect = domEl.getBoundingClientRect();
          this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
          this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      }
      
      this.raycaster.setFromCamera(this.mouse, this.sceneService.getCamera());
      return true;
  }

  private updateLookupCache() {
      const currentCount = this.entityStore.objectCount();
      if (currentCount === this.lastObjectCount) return;

      this.meshToEntity.clear();
      // Only needed for standard meshes, instanced handled via service
      this.entityStore.world.meshes.forEach((ref, entity) => {
          this.meshToEntity.set(ref.mesh.id, entity);
      });
      this.lastObjectCount = currentCount;
  }

  raycastFromScreen(clientX: number, clientY: number): Entity | null {
    if (!this.updateRaycaster(clientX, clientY)) return null;

    // 1. Check Gizmo (Priority)
    const gizmo = this.gizmoManager.getControl();
    if (gizmo && gizmo.visible && gizmo.enabled) {
        const gizmoHits = this.raycaster.intersectObject(gizmo, true);
        if (gizmoHits.length > 0) return this.entityStore.selectedEntity();
    }

    // 2. Check Entities (Optimized Group Raycast)
    this.updateLookupCache();
    
    // Raycast against the Entity Group directly.
    // This allows Three.js to optimize spatial checks if it implements BVH internally (or we add it later).
    // It avoids us allocating a new array of objects every frame.
    const intersects = this.raycaster.intersectObjects(this.sceneGraph.entityGroup.children, true);
    
    // Filter visible only
    const visibleHits = intersects.filter(h => h.object.visible);

    if (visibleHits.length > 0) {
        const hit = visibleHits[0];
        
        if (hit.object instanceof THREE.InstancedMesh && hit.instanceId !== undefined) {
            return this.instancedService.getEntityId(hit.object, hit.instanceId);
        }
        return this.meshToEntity.get(hit.object.id) ?? null;
    }

    return null;
  }

  raycastSurface(clientX: number, clientY: number): SurfaceHit | null {
      if (!this.updateRaycaster(clientX, clientY)) return null;

      this.updateLookupCache();
      
      // Check entities first
      const intersects = this.raycaster.intersectObjects(this.sceneGraph.entityGroup.children, true);
      const visibleHits = intersects.filter(h => h.object.visible);

      if (visibleHits.length > 0) {
          const hit = visibleHits[0];
          let entity: Entity | null = null;

          if (hit.object instanceof THREE.InstancedMesh && hit.instanceId !== undefined) {
              entity = this.instancedService.getEntityId(hit.object, hit.instanceId);
          } else {
              entity = this.meshToEntity.get(hit.object.id) ?? null;
          }
          
          const normal = hit.face?.normal?.clone() ?? new THREE.Vector3(0, 1, 0);
          normal.transformDirection(hit.object.matrixWorld).normalize();

          return { point: hit.point, normal, entity };
      }

      // Fallback: Infinite Ground Plane
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const target = new THREE.Vector3();
      const planeHit = this.raycaster.ray.intersectPlane(plane, target);

      if (planeHit) {
          return { point: planeHit, normal: new THREE.Vector3(0, 1, 0), entity: null };
      }

      return null;
  }
}
