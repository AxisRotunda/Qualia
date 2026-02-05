
import { Injectable, inject, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { GameSystem } from '../system';
import { EntityStoreService } from '../ecs/entity-store.service';
import { EntityAssemblerService } from '../ecs/entity-assembler.service';
import { PhysicsService } from '../../services/physics.service';
import { PhysicsWorldService, CollisionEvent } from '../../physics/world.service';
import { VfxService } from '../features/vfx/vfx.service';
import { GameInputService } from '../../services/game-input.service';
import { Entity } from '../core';
import { Subscription } from 'rxjs';
import { EngineStateService } from '../engine-state.service';
import { WeaponType } from '../features/combat/combat.config';
import { WeaponService } from '../features/combat/weapon.service';

@Injectable({
    providedIn: 'root'
})
export class CombatSystem implements GameSystem, OnDestroy {
    readonly priority = 195;

    private entityStore = inject(EntityStoreService);
    private assembler = inject(EntityAssemblerService);
    private physicsWorld = inject(PhysicsWorldService);
    private physics = inject(PhysicsService);
    private vfx = inject(VfxService);
    private state = inject(EngineStateService);
    private gameInput = inject(GameInputService);
    private weaponService = inject(WeaponService);

    private collisionSub: Subscription;
    private expired: number[] = [];

    private readonly _pos = new THREE.Vector3();
    private readonly _vel = new THREE.Vector3();
    private readonly _force = new THREE.Vector3();
    private readonly _normal = new THREE.Vector3(0, 1, 0);
    private readonly _forward = new THREE.Vector3(0, 0, 1);

    // RUN_INDUSTRY: Standard Atmospheric Drag Coefficient
    // Formula: F = -0.5 * rho * v^2 * Cd * A
    // Simplified here as: F = -k * v^2
    private readonly DRAG_COEFFICIENT = 0.005;

    constructor() {
        this.collisionSub = this.physicsWorld.collision$.subscribe(evt => this.onCollision(evt));
    }

    update(dt: number, totalTime: number): void {
        const scale = this.state.timeScale();
        const dtSec = (dt / 1000) * scale;
        const projectiles = this.entityStore.world.projectiles;
        const rWorld = this.physics.rWorld;

        this.expired.length = 0;

        projectiles.forEach((damage, life, owner, entity) => {
            if (life <= 0) {
                this.expired.push(entity);
            } else {
                projectiles.updateLife(entity, dtSec);

                const rbHandle = this.entityStore.world.rigidBodies.getHandle(entity);
                if (rbHandle !== undefined && rWorld) {
                    const body = rWorld.getRigidBody(rbHandle);
                    if (body && body.isDynamic()) {
                        const v = body.linvel();
                        const vSq = v.x * v.x + v.y * v.y + v.z * v.z;

                        // Apply Drag Force (Air Resistance)
                        if (vSq > 0.01) {
                            // F = -kv^2 * dir
                            const dragMag = this.DRAG_COEFFICIENT * vSq;
                            this._force.set(-v.x, -v.y, -v.z).normalize().multiplyScalar(dragMag);

                            // Apply impulse (Force * time)
                            body.applyImpulse(this._force.multiplyScalar(dtSec), true);
                        } else {
                            // Projectile stalled - expire it
                            this.expired.push(entity);
                        }
                    }
                }
            }
        });

        if (this.expired.length > 0) {
            for (let i = 0; i < this.expired.length; i++) {
                this.assembler.destroyEntity(this.expired[i]);
            }
        }
    }

    private onCollision(evt: CollisionEvent) {
        if (!evt.started) return;
        const projectiles = this.entityStore.world.projectiles;

        const isA = projectiles.has(evt.entityA);
        const isB = projectiles.has(evt.entityB);

        if (isA && !isB) this.handleImpact(evt.entityA, evt.entityB);
        else if (isB && !isA) this.handleImpact(evt.entityB, evt.entityA);
    }

    private handleImpact(projectile: Entity, target: Entity) {
        const projData = this.entityStore.world.projectiles.get(projectile);
        // Prevent self-damage
        if (projData && projData.ownerId === target) return;

        const t = this.entityStore.world.transforms.get(projectile);
        const rbProj = this.entityStore.world.rigidBodies.get(projectile);
        const rbTarget = this.entityStore.world.rigidBodies.get(target);

        if (t && rbProj) {
            this._pos.set(t.position.x, t.position.y, t.position.z);
            const props = this.entityStore.world.physicsProps.get(target);
            this.vfx.emitImpact(this._pos, this._normal, props?.materialType, 0x0ea5e9);

            if (this.entityStore.world.integrity.has(target)) {
                this.gameInput.vibrate(25);
                this.state.triggerHitMarker();
            }

            // Resolve Projectile Velocity for Momentum Transfer
            const pBody = this.physics.rWorld?.getRigidBody(rbProj.handle);
            if (pBody) {
                const v = pBody.linvel();
                this._vel.set(v.x, v.y, v.z);
            } else {
                this._vel.set(0, 0, 0);
            }

            // Damage + Impact metadata registration
            const damage = this.entityStore.world.projectiles.getDamage(projectile);
            const impulseMag = this.entityStore.world.projectiles.getImpulse(projectile);

            this.entityStore.world.integrity.applyDamage(target, damage, this._pos, this._vel);

            if (rbTarget) {
                const tBody = this.physics.rWorld?.getRigidBody(rbTarget.handle);
                if (tBody && tBody.isDynamic()) {
                    tBody.wakeUp();
                    // Apply kinetic energy transfer
                    this._force.copy(this._vel).normalize().multiplyScalar(impulseMag);
                    tBody.applyImpulseAtPoint(this._force, this._pos, true);
                }
            }
        }

        this.assembler.destroyEntity(projectile);
    }

    ngOnDestroy() { this.collisionSub.unsubscribe(); }
}
