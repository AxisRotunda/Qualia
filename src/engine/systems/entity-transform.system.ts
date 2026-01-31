
import { Injectable, inject } from '@angular/core';
import { EntityStoreService } from '../ecs/entity-store.service';
import { PhysicsService } from '../../services/physics.service';
import { SceneService } from '../../services/scene.service';
import { Entity } from '../core';

@Injectable({
  providedIn: 'root'
})
export class EntityTransformSystem {
  private entityStore = inject(EntityStoreService);
  private physics = inject(PhysicsService);
  private scene = inject(SceneService); 
  
  // SpatialHashService removed from injection as it is currently unused in queries
  // and adds overhead to the sync loop.

  // ECS <-> Physics Sync
  syncPhysicsTransforms(mode: 'edit' | 'play', isDragging: boolean) {
    // Optimization: Zero-allocation callback.
    // We receive raw numbers (x, y, z, qx, qy, qz, qw) to avoid creating temporary Objects per entity per frame.
    this.physics.world.syncActiveBodies((entity, x, y, z, qx, qy, qz, qw) => {
        
        // If dragging this specific entity in Edit mode, visual overrides physics
        if (isDragging && this.entityStore.selectedEntity() === entity) return;

        const transform = this.entityStore.world.transforms.get(entity);
        const meshRef = this.entityStore.world.meshes.get(entity);
        
        if (transform) {
            // Update ECS Data
            transform.position.x = x;
            transform.position.y = y;
            transform.position.z = z;
            
            transform.rotation.x = qx;
            transform.rotation.y = qy;
            transform.rotation.z = qz;
            transform.rotation.w = qw;

            // Update Visuals Directly (Skip change detection overhead)
            if (meshRef) {
                meshRef.mesh.position.set(x, y, z);
                meshRef.mesh.quaternion.set(qx, qy, qz, qw);
                // Scale is controlled by ECS, not Physics, but we ensure it matches
                meshRef.mesh.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);
            }

            // SpatialHash update removed for performance (Dead code elimination)
        }
    });
  }

  // Update specific entity from visual transform (Gizmo)
  updateSingleEntityFromVisual(entity: Entity) {
      const meshRef = this.entityStore.world.meshes.get(entity);
      const transform = this.entityStore.world.transforms.get(entity);
      
      if (meshRef && transform) {
          const mesh = meshRef.mesh;
          transform.position = { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z };
          transform.rotation = { x: mesh.quaternion.x, y: mesh.quaternion.y, z: mesh.quaternion.z, w: mesh.quaternion.w };
          transform.scale = { x: mesh.scale.x, y: mesh.scale.y, z: mesh.scale.z };
          
          const rb = this.entityStore.world.rigidBodies.get(entity);
          const def = this.entityStore.world.bodyDefs.get(entity);
          if (rb) {
              this.physics.world.updateBodyTransform(rb.handle, transform.position, transform.rotation);
              if (def) this.physics.shapes.updateBodyScale(rb.handle, def, transform.scale);
          }
      }
  }
}
