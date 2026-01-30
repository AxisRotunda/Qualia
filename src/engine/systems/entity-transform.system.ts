
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { EntityManager } from '../entity-manager.service';
import { PhysicsService } from '../../services/physics.service';
import { SceneService } from '../../services/scene.service';
import { Entity } from '../core';

@Injectable({
  providedIn: 'root'
})
export class EntityTransformSystem {
  private entityMgr = inject(EntityManager);
  private physics = inject(PhysicsService);
  private scene = inject(SceneService); 

  // ECS <-> Physics Sync
  syncPhysicsTransforms(mode: 'edit' | 'play', isDragging: boolean) {
    const rWorld = this.physics.rWorld;
    if (!rWorld) return;

    this.entityMgr.world.rigidBodies.forEach((rb, entity) => {
      // If dragging ANY entity (Edit, Walk, or Fly modes), don't overwrite with physics
      // We prioritize user interaction over simulation
      if (isDragging && this.entityMgr.selectedEntity() === entity) return;

      // Optimization: Access Rapier body directly to check sleep state
      // If body is sleeping, we assume it hasn't moved, so we skip the expensive ECS/Visual sync
      const rawBody = rWorld.getRigidBody(rb.handle);
      if (!rawBody) return;
      
      if (rawBody.isSleeping() && !rawBody.isKinematic()) {
          return;
      }

      const p = rawBody.translation();
      const q = rawBody.rotation();

      const transform = this.entityMgr.world.transforms.get(entity);
      const meshRef = this.entityMgr.world.meshes.get(entity);
      
      if (transform) {
          transform.position = p;
          transform.rotation = q;

          if (meshRef) {
              meshRef.mesh.position.set(p.x, p.y, p.z);
              meshRef.mesh.quaternion.set(q.x, q.y, q.z, q.w);
              // Scale is controlled by ECS, not Physics (Physics doesn't change scale dynamically usually)
              // We re-apply ECS scale to mesh to ensure consistency if it changed elsewhere
              meshRef.mesh.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);
          }
      }
    });
  }

  // Update specific entity from visual transform (Gizmo)
  updateSingleEntityFromVisual(entity: Entity) {
      const meshRef = this.entityMgr.world.meshes.get(entity);
      const transform = this.entityMgr.world.transforms.get(entity);
      
      if (meshRef && transform) {
          const mesh = meshRef.mesh;
          transform.position = { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z };
          transform.rotation = { x: mesh.quaternion.x, y: mesh.quaternion.y, z: mesh.quaternion.z, w: mesh.quaternion.w };
          transform.scale = { x: mesh.scale.x, y: mesh.scale.y, z: mesh.scale.z };
          
          const rb = this.entityMgr.world.rigidBodies.get(entity);
          const def = this.entityMgr.world.bodyDefs.get(entity);
          if (rb) {
              this.physics.updateBodyTransform(rb.handle, transform.position, transform.rotation);
              if (def) this.physics.updateBodyScale(rb.handle, def, transform.scale);
          }
      }
  }
}
