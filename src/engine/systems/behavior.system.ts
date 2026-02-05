
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { GameSystem } from '../system';
import { EntityStoreService } from '../ecs/entity-store.service';
import { PhysicsService } from '../../services/physics.service';
import { ProceduralUtils } from '../utils/procedural.utils';

/**
 * BehaviorSystem: Simulates biological autonomous intelligence.
 * Implements steering boids logic (Reynolds Wander).
 * Priority 120: Logic phase.
 */
@Injectable({ providedIn: 'root' })
export class BehaviorSystem implements GameSystem {
    readonly priority = 120;

    private entityStore = inject(EntityStoreService);
    private physics = inject(PhysicsService);

    // Scratch Objects (Zero-Alloc)
    private readonly _pos = new THREE.Vector3();
    private readonly _velocity = new THREE.Vector3();
    private readonly _circleCenter = new THREE.Vector3();
    private readonly _displacement = new THREE.Vector3();
    private readonly _qRot = new THREE.Quaternion();
    private readonly _axisY = new THREE.Vector3(0, 1, 0);

    // Wander Settings
    private readonly CIRCLE_DIST = 2.0; // Distance of wander circle from agent
    private readonly CIRCLE_RADIUS = 3.0; // Radius of wander circle
    private readonly ANGLE_CHANGE = 2.0; // Max radians to turn per second

    update(dt: number, totalTime: number): void {
        const world = this.entityStore.world;
        const agents = world.agents;
        const transforms = world.transforms;
        const dtSec = dt / 1000;

        agents.forEach((tx, tz, speed, state, wanderAngle, timer, entity) => {
            if (state === 0) return; // Idle

            transforms.copyPosition(entity, this._pos);

            // 1. Calculate Wander Force (Reynolds Steering)
            // Randomly perturb the wander angle
            const noise = (ProceduralUtils.random(entity * 100 + totalTime * 0.1) - 0.5) * 2; // -1 to 1
            const dAngle = noise * this.ANGLE_CHANGE * dtSec;

            // Update persistent state
            agents.updateWanderState(entity, dAngle, dtSec);
            const currentAngle = wanderAngle + dAngle;

            // 2. Resolve Heading
            // Start with current forward direction
            const currentRot = transforms.get(entity)?.rotation;
            if (currentRot) {
                this._velocity.set(0, 0, 1).applyQuaternion(
                    this._qRot.set(currentRot.x, currentRot.y, currentRot.z, currentRot.w)
                );
            } else {
                this._velocity.set(0, 0, 1);
            }

            // Calculate "Circle Center" ahead of agent
            this._circleCenter.copy(this._velocity).normalize().multiplyScalar(this.CIRCLE_DIST);

            // Calculate displacement on the circle
            this._displacement.set(0, 0, -1).multiplyScalar(this.CIRCLE_RADIUS);
            this._displacement.applyAxisAngle(this._axisY, currentAngle);

            // Wander Force = Center + Displacement
            const wanderForce = this._circleCenter.add(this._displacement);

            // 3. Apply Steering to Velocity
            // Smoothly blend current velocity towards wander target
            this._velocity.add(wanderForce.multiplyScalar(dtSec * 2.0));
            this._velocity.normalize().multiplyScalar(speed);

            // 4. Update Position & Rotation
            this._pos.addScaledVector(this._velocity, dtSec);

            // Update Kinematic Controller
            const controller = world.kinematicControllers.get(entity);
            if (controller) {
                controller.targetPosition.x = this._pos.x;
                controller.targetPosition.z = this._pos.z;

                // Orient toward movement
                if (this._velocity.lengthSq() > 0.01) {
                    const angle = Math.atan2(this._velocity.x, this._velocity.z);
                    this._qRot.setFromAxisAngle(this._axisY, angle);
                    // Slerp for smooth turning
                    const currentQ = new THREE.Quaternion(controller.targetRotation.x, controller.targetRotation.y, controller.targetRotation.z, controller.targetRotation.w);
                    currentQ.slerp(this._qRot, dtSec * 5.0);

                    controller.targetRotation.x = currentQ.x;
                    controller.targetRotation.y = currentQ.y;
                    controller.targetRotation.z = currentQ.z;
                    controller.targetRotation.w = currentQ.w;
                }
            }
        });
    }
}
