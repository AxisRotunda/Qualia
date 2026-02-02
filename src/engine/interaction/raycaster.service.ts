
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

export interface TacticalHit {
  entityId: Entity;
  distance: number;
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

  private updateRaycaster(clientX: number, clientY: number): boolean {
      const domEl = this.sceneService.getDomElement();
      const camera = this.sceneService.getCamera();
      if (!domEl || !camera) return false;

      if (document.pointerLockElement === domEl) {
          this.mouse.set(0, 0);
      } else {
          const rect = domEl.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return false;
          this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
          this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      }
      
      this.raycaster.setFromCamera(this.mouse, camera);
      return true;
  }

  raycastTacticalCenter(): TacticalHit | null {
      const camera = this.sceneService.getCamera();
      if (!camera) return null;

      // Reset to screen center (0,0) in NDC
      this.mouse.set(0, 0);
      this.raycaster.setFromCamera(this.mouse, camera);

      const intersects = this.raycaster.intersectObjects(this.sceneGraph.entityGroup.children, true);
      const hit = intersects.find(h => h.object.visible);

      if (hit) {
          let entityId: number | undefined;
          if (hit.object instanceof THREE.InstancedMesh && hit.instanceId !== undefined) {
              entityId = this.instancedService.getEntityId(hit.object, hit.instanceId) || undefined;
          } else {
              entityId = hit.object.userData['entityId'];
          }

          if (entityId !== undefined && entityId !== -1) {
              return { entityId, distance: hit.distance };
          }
      }
      return null;
  }

  raycastFromScreen(clientX: number, clientY: number): Entity | null {
    if (!this.updateRaycaster(clientX, clientY)) return null;

    const gizmo = this.gizmoManager.getControl();
    if (gizmo && gizmo.visible && gizmo.enabled) {
        const gizmoHits = this.raycaster.intersectObject(gizmo, true);
        if (gizmoHits.length > 0) return this.entityStore.selectedEntity();
    }

    const intersects = this.raycaster.intersectObjects(this.sceneGraph.entityGroup.children, true);
    
    const hit = intersects.find(h => {
        if (!h.object.visible) return false;
        
        let eid: number | undefined;
        if (h.object instanceof THREE.InstancedMesh && h.instanceId !== undefined) {
            eid = this.instancedService.getEntityId(h.object, h.instanceId) || undefined;
        } else {
            eid = h.object.userData['entityId'];
        }

        if (eid !== undefined && eid !== -1) {
            return !this.entityStore.locked.has(eid);
        }
        return false;
    });

    if (hit) {
        if (hit.object instanceof THREE.InstancedMesh && hit.instanceId !== undefined) {
            return this.instancedService.getEntityId(hit.object, hit.instanceId);
        }
        const eid = hit.object.userData['entityId'];
        if (eid !== undefined && eid !== -1) return eid;
    }

    return null;
  }

  raycastSurface(clientX: number, clientY: number): SurfaceHit | null {
      if (!this.updateRaycaster(clientX, clientY)) return null;

      const intersects = this.raycaster.intersectObjects(this.sceneGraph.entityGroup.children, true);
      const hit = intersects.find(h => h.object.visible);

      if (hit) {
          let entity: Entity | null = null;
          if (hit.object instanceof THREE.InstancedMesh && hit.instanceId !== undefined) {
              entity = this.instancedService.getEntityId(hit.object, hit.instanceId);
          } else {
              const eid = hit.object.userData['entityId'];
              if (eid !== undefined && eid !== -1) entity = eid;
          }
          
          const normal = hit.face?.normal?.clone() ?? new THREE.Vector3(0, 1, 0);
          normal.transformDirection(hit.object.matrixWorld).normalize();

          return { point: hit.point, normal, entity };
      }

      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const target = new THREE.Vector3();
      const planeHit = this.raycaster.ray.intersectPlane(plane, target);

      if (planeHit) {
          return { point: planeHit, normal: new THREE.Vector3(0, 1, 0), entity: null };
      }

      return null;
  }
}
