
import { Injectable, inject, OnDestroy } from '@angular/core';
import { EngineStateService } from '../engine-state.service';
import { EntityStoreService } from '../ecs/entity-store.service';
import { SceneService } from '../../services/scene.service';
import { TransformLogicService } from '../logic/transform-logic.service';
import { PhysicsService } from '../../services/physics.service';
import { GameInputService } from '../../services/game-input.service';
import { A11yService } from '../../services/ui/a11y.service';
import { SceneLifecycleService } from '../level/scene-lifecycle.service';
import { EntityLifecycleService } from '../ecs/entity-lifecycle.service';
import { Subscription } from 'rxjs';
import * as THREE from 'three';

/**
 * ObjectManipulationService: Translates user intent into spatial transformations.
 * Refactored for RUN_INDUSTRY: Implements "Slide/Lift" dynamics and distance-retaining grabs.
 * Updated V3.0: Concurrent Multi-Axis control (Slide + Lift + Turn).
 */
@Injectable({
    providedIn: 'root'
})
export class ObjectManipulationService implements OnDestroy {
    private state = inject(EngineStateService);
    private entityStore = inject(EntityStoreService);
    private scene = inject(SceneService);
    private transformLogic = inject(TransformLogicService);
    private physics = inject(PhysicsService);
    private gameInput = inject(GameInputService);
    private a11y = inject(A11yService);
    private lifecycle = inject(SceneLifecycleService);
    private entityLifecycle = inject(EntityLifecycleService);

    // Input State
    move = { x: 0, y: 0 };
    rotLift = { x: 0, y: 0 };

    // RUN_INDUSTRY: Calibration constants
    private readonly MOVE_SPEED = 20.0; // Increased for better large-scale translation
    private readonly ROT_SPEED = 5.5;   // Faster orbital rotation
    private readonly SCALE_SPEED = 2.5;
    private readonly MAX_REACH = 35.0;  // Extended reach
    private readonly MIN_REACH = 1.5;   // Prevent objects clipping through camera

    // Interaction State
    private isGrabbing = false;
    private grabbedEntity: number | null = null;
    private grabTargetPos = new THREE.Vector3();
    private smoothedHandPos = new THREE.Vector3();

    // Visuals (Tether Line)
    private tetherLine: THREE.Line | null = null;

    // Optimization: Scratch Vectors (Zero-Alloc)
    private readonly _dPos = new THREE.Vector3();
    private readonly _inputVec = { x: 0, y: 0, z: 0 };
    private readonly _currentPos = new THREE.Vector3();
    private readonly _cameraPos = new THREE.Vector3();
    private readonly _cameraFwd = new THREE.Vector3();

    private sub: Subscription;

    constructor() {
        this.initTether();

        this.sub = this.lifecycle.onWorldCleared.subscribe(() => {
            this.resetState();
        });

        this.sub.add(this.entityLifecycle.onEntityDestroyed.subscribe((evt) => {
            if (this.isGrabbing && this.grabbedEntity === evt.entity) {
                this.endGrab();
            }
        }));
    }

    private initTether() {
        const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
        const mat = new THREE.LineBasicMaterial({
            color: 0x22d3ee,
            transparent: true,
            opacity: 0.6,
            depthTest: false
        });
        this.tetherLine = new THREE.Line(geo, mat);
        this.tetherLine.frustumCulled = false;
        this.tetherLine.visible = false;
        this.scene.getScene().add(this.tetherLine);
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
        if (this.tetherLine) {
            this.scene.getScene().remove(this.tetherLine);
            this.tetherLine.geometry.dispose();
            (this.tetherLine.material as THREE.Material).dispose();
        }
    }

    private resetState() {
        if (this.isGrabbing) this.endGrab();
        this.grabbedEntity = null;
        this.move = { x: 0, y: 0 };
        this.rotLift = { x: 0, y: 0 };
        if (this.tetherLine) this.tetherLine.visible = false;
    }

    setInput(move: {x: number, y: number}, rotLift: {x: number, y: number}) {
        this.move.x = move.x; this.move.y = move.y;
        this.rotLift.x = rotLift.x; this.rotLift.y = rotLift.y;
    }

    update(dt: number) {
        const entity = this.entityStore.selectedEntity();
        const mode = this.state.transformMode();
        const camera = this.scene.getCamera();

        // Auto-grab management
        if (entity === null || entity !== this.grabbedEntity) {
            if (this.isGrabbing) this.endGrab();
            this.grabbedEntity = entity;
        }

        if (entity === null || !camera) {
            if (this.tetherLine) this.tetherLine.visible = false;
            return;
        }

        // Check input threshold
        const hasMove = Math.abs(this.move.x) > 0.01 || Math.abs(this.move.y) > 0.01;
        const hasLift = Math.abs(this.rotLift.y) > 0.01;
        const hasRot  = Math.abs(this.rotLift.x) > 0.01;
        const isPaused = this.state.isPaused();

        // --- Scale Mode Override ---
        // If actively in Scale mode, we bypass the Universal Slide/Lift logic
        // and use the inputs strictly for scaling.
        if (mode === 'scale' && (hasMove || hasLift)) {
            // Use Right Stick Y for scale
            this.transformLogic.applyScaleDelta(entity, this.rotLift.y * this.SCALE_SPEED * dt);
            return;
        }

        // --- Universal Mobile Manipulation (Slide + Lift + Turn) ---
        // Default behavior if not explicitly in Scale mode.
        // This allows concurrent movement and rotation.

        const rbHandle = this.entityStore.world.rigidBodies.getHandle(entity);
        const body = rbHandle !== undefined ? this.physics.rWorld?.getRigidBody(rbHandle) : null;
        const isDynamic = body && body.isDynamic();

        // 1. Translation (Slide + Lift) via Physics Hand
        if (!isPaused && isDynamic) {
            if (!this.isGrabbing) this.startGrab(entity, camera);

            if (hasMove || hasLift) {
                // Left Stick: Slide X/Z
                this._inputVec.x = this.move.x * this.MOVE_SPEED * dt;
                this._inputVec.z = this.move.y * this.MOVE_SPEED * dt;

                // Right Stick Y: Lift (Vertical)
                this._inputVec.y = this.rotLift.y * this.MOVE_SPEED * dt;

                this.transformLogic.projectInputToWorld(this._inputVec, camera, this._dPos);
                this.grabTargetPos.add(this._dPos);

                // Reach Guard
                camera.getWorldPosition(this._cameraPos);
                const dist = this.grabTargetPos.distanceTo(this._cameraPos);
                if (dist > this.MAX_REACH) {
                    const dir = this._dPos.copy(this.grabTargetPos).sub(this._cameraPos).normalize();
                    this.grabTargetPos.copy(this._cameraPos).addScaledVector(dir, this.MAX_REACH);
                } else if (dist < this.MIN_REACH) {
                    const dir = this._dPos.copy(this.grabTargetPos).sub(this._cameraPos).normalize();
                    this.grabTargetPos.copy(this._cameraPos).addScaledVector(dir, this.MIN_REACH);
                }
            }

            // Hand smoothing
            this.smoothedHandPos.lerp(this.grabTargetPos, 1.0 - Math.exp(-dt * 18.0));

            if (this.entityStore.world.transforms.has(entity)) {
                this.entityStore.world.transforms.copyPosition(entity, this._currentPos);
                this.updateTether(this.smoothedHandPos, this._currentPos);
            }

            this.physics.interaction.moveHand(this.smoothedHandPos);
        } else if (hasMove || hasLift) {
            // Paused/Static: Direct Transform
            this._inputVec.x = this.move.x * this.MOVE_SPEED * dt;
            this._inputVec.z = this.move.y * this.MOVE_SPEED * dt;
            this._inputVec.y = this.rotLift.y * this.MOVE_SPEED * dt;
            this.transformLogic.applyTransformDelta(entity, this._inputVec, 0, camera);
        }

        // 2. Concurrent Rotation (Yaw)
        if (hasRot) {
            // Right Stick X -> Rotate Y (Yaw)
            // Negative sign for natural "Push Left to Turn Left" feel
            const dRotY = -this.rotLift.x * this.ROT_SPEED * dt;

            if (isDynamic && !isPaused) {
                // Special rotation handling for dynamic objects to avoid killing spring velocity
                this.transformLogic.applyRotationDelta(entity, dRotY);
            } else {
                // Static/Paused fallback
                this.transformLogic.applyTransformDelta(entity, { x: 0, y: 0, z: 0 }, dRotY, camera);
            }
        }
    }

    private updateTether(hand: THREE.Vector3, entity: THREE.Vector3) {
        if (!this.tetherLine) return;
        this.tetherLine.visible = true;
        const posAttr = this.tetherLine.geometry.attributes.position;
        posAttr.setXYZ(0, entity.x, entity.y, entity.z);
        posAttr.setXYZ(1, hand.x, hand.y, hand.z);
        posAttr.needsUpdate = true;

        const dist = hand.distanceTo(entity);
        const mat = this.tetherLine.material as THREE.LineBasicMaterial;

        if (dist > 1.2) {
            const t = Math.min(1.0, (dist - 1.2) / 3.0);
            mat.color.setHSL(0.55 - (t * 0.5), 0.8, 0.5);
            mat.opacity = 0.4 + (t * 0.4);
        } else {
            mat.color.setHex(0x22d3ee);
            mat.opacity = 0.3;
        }
    }

    private startGrab(entity: number, camera: THREE.Camera) {
        if (!this.entityStore.world.transforms.has(entity)) return;
        this.entityStore.world.transforms.copyPosition(entity, this._currentPos);

        const rb = this.entityStore.world.rigidBodies.get(entity);
        if (!rb) return;

        this.isGrabbing = true;
        this.grabbedEntity = entity;

        camera.getWorldPosition(this._cameraPos);
        const distToObj = this._cameraPos.distanceTo(this._currentPos);

        if (distToObj > this.MAX_REACH) {
            camera.getWorldDirection(this._cameraFwd);
            this.grabTargetPos.copy(this._cameraPos).addScaledVector(this._cameraFwd, this.MAX_REACH);
        } else if (distToObj < this.MIN_REACH) {
            camera.getWorldDirection(this._cameraFwd);
            this.grabTargetPos.copy(this._cameraPos).addScaledVector(this._cameraFwd, this.MIN_REACH);
        } else {
            this.grabTargetPos.copy(this._currentPos);
        }

        this.smoothedHandPos.copy(this.grabTargetPos);
        this.physics.interaction.startGrab(rb.handle, this.grabTargetPos);

        this.gameInput.vibrate(20);
        this.a11y.announce('Physical connection established');
    }

    private endGrab() {
        if (this.isGrabbing) {
            this.physics.interaction.endGrab();
            this.isGrabbing = false;
            if (this.tetherLine) this.tetherLine.visible = false;
            this.a11y.announce('Physical connection released');
        }
    }
}
