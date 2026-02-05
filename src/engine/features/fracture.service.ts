
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { EntityStoreService } from '../ecs/entity-store.service';
import { EntityAssemblerService } from '../ecs/entity-assembler.service';
import { PhysicsService } from '../../services/physics.service';
import { TemplateFactoryService } from '../../services/factories/template-factory.service';
import { EntityLibraryService } from '../../services/entity-library.service';
import { Entity } from '../core';

export interface ImpactContext {
    point: { x: number, y: number, z: number };
    velocity: { x: number, y: number, z: number };
}

@Injectable({
    providedIn: 'root'
})
export class FractureService {
    private store = inject(EntityStoreService);
    private assembler = inject(EntityAssemblerService);
    private physics = inject(PhysicsService);
    private entityLib = inject(EntityLibraryService);
    private factory = inject(TemplateFactoryService);

    // Scratch objects
    private readonly _pos = new THREE.Vector3();
    private readonly _scale = new THREE.Vector3();
    private readonly _vel = { x: 0, y: 0, z: 0 };
    private readonly _angVel = { x: 0, y: 0, z: 0 };
    private readonly _impactDir = new THREE.Vector3();

    fracture(entity: Entity, context?: ImpactContext) {
        const world = this.store.world;
        const t = world.transforms.get(entity);
        const rb = world.rigidBodies.get(entity);

        const matInfo = this.resolveMaterialInfo(entity);

        if (!t || !rb) {
            this.assembler.destroyEntity(entity);
            return;
        }

        // 1. Capture Original State
        this._pos.set(t.position.x, t.position.y, t.position.z);
        this._scale.set(t.scale.x, t.scale.y, t.scale.z);

        const body = this.physics.rWorld?.getRigidBody(rb.handle);
        if (body) {
            const v = body.linvel();
            const av = body.angvel();
            this._vel.x = v.x; this._vel.y = v.y; this._vel.z = v.z;
            this._angVel.x = av.x; this._angVel.y = av.y; this._angVel.z = av.z;
        }

        // 2. Resolve Fracture Origin (Impact Point or Center)
        const origin = context ? new THREE.Vector3(context.point.x, context.point.y, context.point.z) : this._pos.clone();
        const impactVelocity = context ? new THREE.Vector3(context.velocity.x, context.velocity.y, context.velocity.z) : new THREE.Vector3();
        this._impactDir.copy(impactVelocity).normalize();

        // 3. Destroy Original
        this.assembler.destroyEntity(entity);

        // 4. Spawn Shards
        const volume = (this._scale.x * this._scale.y * this._scale.z);
        const count = Math.min(20, Math.max(6, Math.floor(volume * 6.0)));

        // RUN_DESTRUCTION: Resolve material-specific shard template
        const shardTplId = this.getShardTemplateForMaterial(matInfo.type);
        const shardTemplate = this.entityLib.getTemplate(shardTplId);

        if (!shardTemplate) {
            console.warn(`[Fracture] Shard template '${shardTplId}' not found, aborting.`);
            return;
        }

        for (let i = 0; i < count; i++) {
            const spread = new THREE.Vector3(
                (Math.random() - 0.5),
                (Math.random() - 0.5),
                (Math.random() - 0.5)
            ).normalize().multiplyScalar(Math.random() * 0.8);

            const shardPos = origin.clone().add(spread);
            const shardScale = 0.2 + Math.random() * 0.5;

            // B. Velocity Synthesis (Kinetic Transfer)
            const burstSpeed = 4.0 + Math.random() * 8.0;
            const transferFactor = 0.25;

            const sVelX = this._vel.x + (spread.x * burstSpeed) + (impactVelocity.x * transferFactor);
            const sVelY = this._vel.y + (spread.y * burstSpeed) + (impactVelocity.y * transferFactor);
            const sVelZ = this._vel.z + (spread.z * burstSpeed) + (impactVelocity.z * transferFactor);

            // Shard inherits parent material visual for seamless break
            const tempTpl = { ...shardTemplate, materialId: matInfo.id || shardTemplate.materialId };

            const shardId = this.factory.spawn(this.store, tempTpl, shardPos, new THREE.Quaternion().random(), { scale: shardScale });

            const shardRb = world.rigidBodies.get(shardId);
            if (shardRb) {
                const b = this.physics.rWorld?.getRigidBody(shardRb.handle);
                if (b) {
                    b.setLinvel({ x: sVelX, y: sVelY, z: sVelZ }, true);
                    b.setAngvel({
                        x: this._angVel.x + (Math.random() - 0.5) * 60,
                        y: this._angVel.y + (Math.random() - 0.5) * 60,
                        z: this._angVel.z + (Math.random() - 0.5) * 60
                    }, true);
                }
            }
        }
    }

    private resolveMaterialInfo(e: Entity): { id?: string, type?: string } {
        const meshRef = this.store.world.meshes.get(e);
        if (!meshRef) return {};

        const mat = Array.isArray(meshRef.mesh.material) ? meshRef.mesh.material[0] : meshRef.mesh.material;
        const matId = mat?.userData?.mapId;

        // Determine physical material type from ID or props
        const props = this.store.world.physicsProps.get(e);
        return { id: matId, type: props?.materialType };
    }

    private getShardTemplateForMaterial(type: string | undefined): string {
        if (!type) return 'prop-cinderblock';

        switch (type) {
            case 'glass':
            case 'ice':
                return 'prop-shard-glass';
            case 'wood':
                return 'prop-shard-wood';
            case 'metal':
            case 'titanium':
                return 'prop-shard-metal';
            case 'rock':
            case 'concrete':
            default:
                return 'prop-cinderblock';
        }
    }
}
