
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { EntityStoreService } from './entity-store.service';
import { PhysicsService, PhysicsBodyDef } from '../../services/physics.service';
import { VisualsFactoryService, VisualContext } from '../graphics/visuals-factory.service';
import { EntityLifecycleService } from './entity-lifecycle.service';
import { Entity } from '../core';

export interface EntityMetadata {
    name: string;
    templateId?: string;
    category?: string;
    tags: string[];
    isStatic: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class EntityAssemblerService {
    private store = inject(EntityStoreService);
    private physics = inject(PhysicsService);
    private visualsFactory = inject(VisualsFactoryService);
    private lifecycle = inject(EntityLifecycleService);

    createEntityFromDef(
        bodyDef: PhysicsBodyDef,
        visualOpts: { color?: number, materialId?: string, meshId?: string },
        meta: EntityMetadata
    ): Entity {
        const world = this.store.world;
        const entity = world.createEntity();
        const isStatic = meta.isStatic;

        let visualContext: VisualContext | undefined;
        if (meta.templateId && meta.category) {
            visualContext = {
                entity,
                templateId: meta.templateId,
                category: meta.category,
                tags: meta.tags
            };
        }

        const mesh = this.visualsFactory.createMesh(bodyDef, visualOpts, visualContext);

        // CRITICAL FIX: Pass raw handle (number) to SoA store, not object wrapper.
        // Passing { handle: id } into Int32Array was causing WASM panics (unreachable).
        world.rigidBodies.add(entity, bodyDef.handle);
        world.meshes.add(entity, { mesh: mesh as THREE.Mesh });

        world.transforms.add(entity, {
            position: { ...bodyDef.position },
            rotation: { ...bodyDef.rotation },
            scale: { x: 1, y: 1, z: 1 }
        });

        world.bodyDefs.add(entity, bodyDef);

        const initialProps = { friction: 0.5, restitution: 0.5, density: 1000 };
        world.physicsProps.add(entity, initialProps);
        world.names.add(entity, meta.name);

        if (meta.templateId) {
            world.templateIds.add(entity, meta.templateId);
        }

        if (meta.tags.includes('destructible')) {
            const mass = bodyDef.mass || 1.0;
            const health = meta.tags.includes('fragile') ? 1.0 : (mass * 0.5 + 50);
            const threshold = meta.tags.includes('fragile') ? 10 : (mass * 2.0 + 150);
            world.integrity.add(entity, health, threshold);
        }

        if (meta.tags.includes('dynamic') || meta.tags.includes('prop') || meta.tags.includes('debris') || meta.tags.includes('hero')) {
            world.buoyant.add(entity, true);
        }

        this.physics.registry.register(bodyDef.handle, entity);
        this.lifecycle.onEntityCreated.next({ entity, isStatic, tags: meta.tags });
        this.store.objectCount.update(c => c + 1);

        return entity;
    }

    destroyEntity(e: Entity) {
        if (this.store.selectedEntity() === e) this.store.selectedEntity.set(null);
        const handle = this.store.world.rigidBodies.getHandle(e);
        if (handle !== undefined) this.physics.world.removeBody(handle);
        const meshRef = this.store.world.meshes.get(e);
        if (meshRef) this.visualsFactory.deleteVisuals(e, meshRef.mesh, this.store.world.templateIds.get(e));
        this.lifecycle.onEntityDestroyed.next({ entity: e });
        this.store.world.destroyEntity(e);
        this.store.objectCount.update(c => c - 1);
    }
}
