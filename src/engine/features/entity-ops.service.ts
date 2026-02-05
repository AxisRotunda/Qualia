
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { EntityStoreService } from '../ecs/entity-store.service';
import { EntityAssemblerService, EntityMetadata } from '../ecs/entity-assembler.service';
import { PhysicsService } from '../../services/physics.service';
import { PhysicsFactoryService } from '../../services/factories/physics-factory.service';
import { EntityLibraryService } from './entity-library.service';
import { Entity } from '../core';
import { NullShield } from '../utils/string.utils';

@Injectable({
    providedIn: 'root'
})
export class EntityOpsService {
    private store = inject(EntityStoreService);
    private assembler = inject(EntityAssemblerService);
    private physics = inject(PhysicsService);
    private physicsFactory = inject(PhysicsFactoryService);
    private entityLib = inject(EntityLibraryService);

    private static readonly _scratchPos = { x: 0, y: 0, z: 0 };

    deleteEntity(e: Entity) {
        this.store.locked.delete(e);
        this.store.hidden.delete(e);
        this.assembler.destroyEntity(e);
    }

    duplicateEntity(e: Entity) {
        const world = this.store.world;
        const t = world.transforms.get(e);
        const oldDef = world.bodyDefs.get(e);
        const meshRef = world.meshes.get(e);
        const tplId = world.templateIds.get(e);

        if (!t || !oldDef || !meshRef) {
            console.warn(`[OPS] Duplication failed for entity ${e}: Missing required components.`);
            return;
        }

        const safeName = this.getEntityName(e);
        const newPos = EntityOpsService._scratchPos;
        newPos.x = t.position.x + 1.0;
        newPos.y = t.position.y;
        newPos.z = t.position.z;

        const bodyDef = this.physicsFactory.recreateBody(oldDef, newPos.x, newPos.y, newPos.z);
        this.physics.shapes.updateBodyScale(bodyDef.handle, bodyDef, t.scale);
        bodyDef.rotation = { ...t.rotation };
        this.physics.world.updateBodyTransform(bodyDef.handle, newPos, t.rotation);

        const mat = (meshRef.mesh as any).material;
        const visualOpts = {
            color: mat?.color?.getHex(),
            materialId: mat?.userData ? mat.userData.mapId : undefined,
            meshId: tplId ? this.entityLib.getTemplate(tplId)?.meshId : undefined
        };

        const tpl = tplId ? this.entityLib.getTemplate(tplId) : null;
        const meta: EntityMetadata = {
            name: `${safeName}_copy`,
            templateId: tplId,
            tags: tpl ? [...tpl.tags] : ['prop'],
            category: tpl ? tpl.category : 'prop',
            isStatic: true
        };

        if (tpl) {
            if (tpl.mass > 0 || tpl.tags.includes('dynamic')) meta.isStatic = false;
        } else if (bodyDef.mass && bodyDef.mass > 0) {
            meta.isStatic = false;
        }

        const newEntity = this.assembler.createEntityFromDef(bodyDef, visualOpts, meta);
        world.transforms.setScale(newEntity, t.scale.x, t.scale.y, t.scale.z);

        const oldProps = world.physicsProps.get(e);
        if (oldProps) {
            world.physicsProps.add(newEntity, { ...oldProps });
            this.physics.materials.updateBodyMaterial(bodyDef.handle, oldProps);
        }
    }

    getEntityName(e: Entity): string {
        return NullShield.entityName(e, this.store.world.names.get(e));
    }

    setEntityName(e: Entity, name: string | null | undefined) {
        if (!this.store.world.entities.has(e)) return;
        this.store.world.names.add(e, NullShield.entityName(e, name));
    }

    undo(): void {
        // TODO: Implement undo functionality
        console.warn('[OPS] Undo not yet implemented');
    }

    updateEntityPhysics(e: Entity, props: { friction: number, restitution: number }) {
        const current = this.store.world.physicsProps.get(e);
        const safe = {
            friction: Math.max(0, Math.min(props.friction, 5)),
            restitution: Math.max(0, Math.min(props.restitution, 2)),
            density: current?.density || 1000
        };
        const rb = this.store.world.rigidBodies.get(e);
        if (rb) this.physics.materials.updateBodyMaterial(rb.handle, safe);
        this.store.world.physicsProps.add(e, safe);
    }

    toggleLock(e: Entity) {
        if (this.store.locked.has(e)) {
            this.store.locked.delete(e);
        } else {
            this.store.locked.add(e);
            if (this.store.selectedEntity() === e) {
                this.store.selectedEntity.set(null);
            }
        }
    }

    toggleVisibility(e: Entity) {
        const isHidden = this.store.hidden.has(e);
        if (isHidden) {
            this.store.hidden.delete(e);
        } else {
            this.store.hidden.add(e);
        }

        const meshRef = this.store.world.meshes.get(e);
        if (meshRef) {
            meshRef.mesh.visible = isHidden;
        }
    }
}
