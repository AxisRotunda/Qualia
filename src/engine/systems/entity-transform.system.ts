
import { Injectable, inject } from '@angular/core';
import { EntityStoreService } from '../ecs/entity-store.service';
import { PhysicsService } from '../../services/physics.service';
import { SceneService } from '../../services/scene.service';
import { SpatialHashService } from '../physics/spatial-hash.service';
import { Entity } from '../core';

@Injectable({
  providedIn: 'root'
})
export class EntityTransformSystem {
  private entityStore = inject(EntityStoreService);
  private physics = inject(PhysicsService);
  private scene = inject(SceneService); 
  private spatialHash = inject(SpatialHashService);

  // ECS <-> Physics Sync
  syncPhysicsTransforms(mode: 'edit' | 'play', isDragging: boolean) {
    // Optimization: Iterate ACTIVE bodies from Physics engine directly.
    this.physics.world.syncActiveBodies((entity, p, q) => {
        
        // If dragging this specific entity in Edit mode, visual overrides physics
        if (isDragging && this.entityStore.selectedEntity() === entity) return;

        const transform = this.entityStore.world.transforms.get(entity);
        const meshRef = this.entityStore.world.meshes.get(entity);
        
        if (transform) {
            // Update ECS Data
            transform.position.x = p.x;
            transform.position.y = p.y;
            transform.position.z = p.z;
            
            transform.rotation.x = q.x;
            transform.rotation.y = q.y;
            transform.rotation.z = q.z;
            transform.rotation.w = q.w;

            // Update Visuals Directly (Skip change detection overhead)
            if (meshRef) {
                meshRef.mesh.position.set(p.x, p.y, p.z);
                meshRef.mesh.quaternion.set(q.x, q.y, q.z, q.w);
                // Scale is controlled by ECS, not Physics, but we ensure it matches
                meshRef.mesh.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);
            }

            // Update Spatial Hash for active entities
            this.spatialHash.update(entity, p.x, p.y, p.z);
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
          
          // Update Spatial Hash for manipulated entity
          this.spatialHash.update(entity, transform.position.x, transform.position.y, transform.position.z);
      }
  }
}
