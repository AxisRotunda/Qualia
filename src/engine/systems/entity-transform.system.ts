
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
  
  // ECS <-> Physics Sync
  syncPhysicsTransforms(mode: 'edit' | 'play', isDragging: boolean) {
    const transforms = this.entityStore.world.transforms;
    const meshes = this.entityStore.world.meshes;

    // Optimization: Zero-allocation callback.
    // We receive raw scalars to avoid creating temporary Objects per entity per frame.
    this.physics.world.syncActiveBodies((entity, x, y, z, qx, qy, qz, qw) => {
        
        // If dragging this specific entity in Edit mode, visual overrides physics
        if (isDragging && this.entityStore.selectedEntity() === entity) return;

        // Optimization: Removed redundant 'has' check. 
        // setPosition/setRotation perform their own sparse check internally.
        // This saves 1 lookup per entity per frame.
        transforms.setPosition(entity, x, y, z);
        transforms.setRotation(entity, qx, qy, qz, qw);

        // Update Visuals Directly
        const meshRef = meshes.get(entity);
        if (meshRef) {
            meshRef.mesh.position.set(x, y, z);
            meshRef.mesh.quaternion.set(qx, qy, qz, qw);
        }
    });
  }

  // Update specific entity from visual transform (Gizmo)
  updateSingleEntityFromVisual(entity: Entity) {
      const meshRef = this.entityStore.world.meshes.get(entity);
      
      if (meshRef) {
          const mesh = meshRef.mesh;
          
          // Update ECS
          this.entityStore.world.transforms.setPosition(entity, mesh.position.x, mesh.position.y, mesh.position.z);
          this.entityStore.world.transforms.setRotation(entity, mesh.quaternion.x, mesh.quaternion.y, mesh.quaternion.z, mesh.quaternion.w);
          this.entityStore.world.transforms.setScale(entity, mesh.scale.x, mesh.scale.y, mesh.scale.z);
          
          // Update Physics
          const rb = this.entityStore.world.rigidBodies.get(entity);
          const def = this.entityStore.world.bodyDefs.get(entity);
          if (rb) {
              this.physics.world.updateBodyTransform(rb.handle, mesh.position, mesh.quaternion);
              if (def) this.physics.shapes.updateBodyScale(rb.handle, def, mesh.scale);
          }
      }
  }
}
