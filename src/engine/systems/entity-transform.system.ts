
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
    this.entityMgr.world.rigidBodies.forEach((rb, entity) => {
      // If dragging ANY entity (Edit, Walk, or Fly modes), don't overwrite with physics
      // We prioritize user interaction over simulation
      if (isDragging && this.entityMgr.selectedEntity() === entity) return;

      const pose = this.physics.getBodyPose(rb.handle);
      if (pose) {
        const transform = this.entityMgr.world.transforms.get(entity);
        const meshRef = this.entityMgr.world.meshes.get(entity);
        
        if (transform) {
            transform.position = pose.p;
            transform.rotation = pose.q;

            if (meshRef) {
                meshRef.mesh.position.set(pose.p.x, pose.p.y, pose.p.z);
                meshRef.mesh.quaternion.set(pose.q.x, pose.q.y, pose.q.z, pose.q.w);
                meshRef.mesh.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);
            }
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
