
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { EntityStoreService } from '../ecs/entity-store.service';
import { PhysicsService } from '../../services/physics.service';
import { SelectionManagerService } from '../graphics/selection-manager.service';
import { Entity } from '../core';

@Injectable({
    providedIn: 'root'
})
export class TransformLogicService {
    private entityStore = inject(EntityStoreService);
    private physics = inject(PhysicsService);
    private selectionManager = inject(SelectionManagerService);

    // RUN_OPT: Persistent Scratch Objects
    private readonly _forward = new THREE.Vector3();
    private readonly _right = new THREE.Vector3();
    private readonly _move = new THREE.Vector3();
    private readonly _pos = new THREE.Vector3(); // ECS Read Buffer
    private readonly _qCurrent = new THREE.Quaternion();
    private readonly _qDelta = new THREE.Quaternion();
    private readonly _axisY = new THREE.Vector3(0, 1, 0);

    /**
   * Translates 2D/3D input space (Joystick/Keys) into 3D World Space
   * based on the provided camera orientation.
   */
    projectInputToWorld(
        input: {x: number, y: number, z: number},
        camera: THREE.Camera,
        out: THREE.Vector3
    ) {
        const quat = camera.quaternion;
        this._forward.set(0, 0, -1).applyQuaternion(quat);
        this._right.set(1, 0, 0).applyQuaternion(quat);

        // RUN_REPAIR: Handle steep angles where forward projection onto XZ plane collapses
        const fLenSq = this._forward.x * this._forward.x + this._forward.z * this._forward.z;
        if (fLenSq < 0.001) {
            // If looking straight up/down, use the camera UP vector projected as "forward"
            this._forward.set(0, 1, 0).applyQuaternion(quat);
        }

        this._forward.y = 0; this._forward.normalize();
        this._right.y = 0; this._right.normalize();

        out.set(0, 0, 0);
        out.addScaledVector(this._right, input.x);
        out.addScaledVector(this._forward, input.z);
        out.y += input.y;
    }

    applyTransformDelta(e: Entity, dPos: {x: number, y: number, z: number}, dRotY: number, camera: THREE.Camera, dRotX: number = 0) {
        // RUN_OPT: Zero-Alloc State Retrieval
        const transforms = this.entityStore.world.transforms;
        if (!transforms.has(e)) return;

        transforms.copyPosition(e, this._pos);
        const t = transforms.get(e)!;

        // 1. Position Projection
        // dPos.z is used for forward/back in this method's signature
        this.projectInputToWorld({ x: dPos.x, y: dPos.y, z: dPos.z }, camera, this._move);

        const newPos = {
            x: this._pos.x + this._move.x,
            y: this._pos.y + this._move.y,
            z: this._pos.z + this._move.z
        };

        // 2. Rotation
        this._qCurrent.set(t.rotation.x, t.rotation.y, t.rotation.z, t.rotation.w);

        // Yaw (World Y Axis)
        if (Math.abs(dRotY) > 0.0001) {
            this._qDelta.setFromAxisAngle(this._axisY, dRotY);
            this._qCurrent.premultiply(this._qDelta);
        }

        // Pitch/Tilt (Camera Right Axis projected)
        if (Math.abs(dRotX) > 0.0001) {
            this._right.set(1, 0, 0).applyQuaternion(camera.quaternion);
            this._right.y = 0; this._right.normalize();
            this._qDelta.setFromAxisAngle(this._right, dRotX);
            this._qCurrent.premultiply(this._qDelta);
        }

        // 3. Apply to ECS
        transforms.setPosition(e, newPos.x, newPos.y, newPos.z);
        transforms.setRotation(e, this._qCurrent.x, this._qCurrent.y, this._qCurrent.z, this._qCurrent.w);

        // 4. Apply to Physics
        const rb = this.entityStore.world.rigidBodies.get(e);
        if (rb) {
            this.physics.world.updateBodyTransform(rb.handle, newPos, this._qCurrent);
        }

        // 5. Apply to Visuals immediately for smoothness
        const meshRef = this.entityStore.world.meshes.get(e);
        if (meshRef) {
            meshRef.mesh.position.copy(newPos as any);
            meshRef.mesh.quaternion.copy(this._qCurrent);
        }

        this.selectionManager.updateHelper();
    }

    /**
   * Applies rotation only, preserving physics velocity.
   * Used for concurrent Slide+Rotate interaction.
   */
    applyRotationDelta(e: Entity, dRotY: number) {
        const transforms = this.entityStore.world.transforms;
        if (!transforms.has(e)) return;

        const t = transforms.get(e)!;
        this._qCurrent.set(t.rotation.x, t.rotation.y, t.rotation.z, t.rotation.w);

        if (Math.abs(dRotY) > 0.0001) {
            this._qDelta.setFromAxisAngle(this._axisY, dRotY);
            this._qCurrent.premultiply(this._qDelta);
        } else {
            return;
        }

        transforms.setRotation(e, this._qCurrent.x, this._qCurrent.y, this._qCurrent.z, this._qCurrent.w);

        const rb = this.entityStore.world.rigidBodies.get(e);
        if (rb) {
            this.physics.world.setBodyRotation(rb.handle, this._qCurrent);
        }

        const meshRef = this.entityStore.world.meshes.get(e);
        if (meshRef) {
            meshRef.mesh.quaternion.copy(this._qCurrent);
        }

        this.selectionManager.updateHelper();
    }

    applyScaleDelta(e: Entity, dScale: number) {
        const t = this.entityStore.world.transforms.get(e);
        if (!t) return;

        const newScale = Math.max(0.1, t.scale.x + dScale);

        this.entityStore.world.transforms.setScale(e, newScale, newScale, newScale);

        const meshRef = this.entityStore.world.meshes.get(e);
        if (meshRef) {
            meshRef.mesh.scale.set(newScale, newScale, newScale);
        }

        const rb = this.entityStore.world.rigidBodies.get(e);
        const def = this.entityStore.world.bodyDefs.get(e);
        if (rb && def) {
            this.physics.shapes.updateBodyScale(rb.handle, def, { x: newScale, y: newScale, z: newScale });
        }

        this.selectionManager.updateHelper();
    }

    setEntityTransform(e: Entity, pos?: {x: number, y: number, z: number}, rot?: {x: number, y: number, z: number, w: number}, scale?: {x: number, y: number, z: number}) {
        const t = this.entityStore.world.transforms.get(e);
        if (!t) return;

        if (pos) this.entityStore.world.transforms.setPosition(e, pos.x, pos.y, pos.z);
        if (rot) this.entityStore.world.transforms.setRotation(e, rot.x, rot.y, rot.z, rot.w);
        if (scale) this.entityStore.world.transforms.setScale(e, scale.x, scale.y, scale.z);

        const updated = this.entityStore.world.transforms.get(e)!;

        const rb = this.entityStore.world.rigidBodies.get(e);
        const def = this.entityStore.world.bodyDefs.get(e);

        if (rb) {
            if (pos || rot) {
                this.physics.world.updateBodyTransform(rb.handle, updated.position, updated.rotation);
            }
            if (scale && def) {
                this.physics.shapes.updateBodyScale(rb.handle, def, updated.scale);
            }
        }

        const meshRef = this.entityStore.world.meshes.get(e);
        if (meshRef) {
            if (pos) meshRef.mesh.position.set(pos.x, pos.y, pos.z);
            if (rot) meshRef.mesh.quaternion.set(rot.x, rot.y, rot.z, rot.w);
            if (scale) meshRef.mesh.scale.set(scale.x, scale.y, scale.z);
        }

        this.selectionManager.updateHelper();
    }
}
