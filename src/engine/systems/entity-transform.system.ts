
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

    /**
   * Steps Physics -> ECS only.
   * Decoupled from visual meshes to allow interpolation in RenderSystem.
   */
    syncPhysicsToEcs(mode: 'edit' | 'play', isDragging: boolean) {
        const transforms = this.entityStore.world.transforms;
        const selected = this.entityStore.selectedEntity();

        this.physics.world.syncActiveBodies((entity, x, y, z, qx, qy, qz, qw) => {
            if (isDragging && selected === entity) return;
            transforms.setPose(entity, x, y, z, qx, qy, qz, qw);
        });
    }

    /**
   * Industry Standard: Visual Interpolation.
   * Snaps meshes to a point between the previous and current physics state.
   */
    interpolateVisuals(alpha: number) {
        const world = this.entityStore.world;
        const meshes = world.meshes;
        const isDragging = this.scene.isDraggingGizmo();
        const selected = this.entityStore.selectedEntity();

        world.transforms.forEachInterpolated(alpha, (x, y, z, qx, qy, qz, qw, entity) => {
            // If user is manually moving the object, visual is driven by Gizmo, not Interpolation
            if (isDragging && selected === entity) return;

            const meshRef = meshes.get(entity);
            if (meshRef) {
                meshRef.mesh.position.set(x, y, z);
                meshRef.mesh.quaternion.set(qx, qy, qz, qw);
            }
        });
    }

    updateSingleEntityFromVisual(entity: Entity) {
        const meshRef = this.entityStore.world.meshes.get(entity);
        if (meshRef) {
            const mesh = meshRef.mesh;
            this.entityStore.world.transforms.setPosition(entity, mesh.position.x, mesh.position.y, mesh.position.z);
            this.entityStore.world.transforms.setRotation(entity, mesh.quaternion.x, mesh.quaternion.y, mesh.quaternion.z, mesh.quaternion.w);
            this.entityStore.world.transforms.setScale(entity, mesh.scale.x, mesh.scale.y, mesh.scale.z);

            const rb = this.entityStore.world.rigidBodies.get(entity);
            const def = this.entityStore.world.bodyDefs.get(entity);
            if (rb) {
                this.physics.world.updateBodyTransform(rb.handle, mesh.position, mesh.quaternion);
                if (def) this.physics.shapes.updateBodyScale(rb.handle, def, mesh.scale);
            }
        }
    }
}
