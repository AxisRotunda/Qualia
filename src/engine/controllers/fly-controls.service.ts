
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { GameInputService } from '../../services/game-input.service';
import { CameraManagerService } from '../graphics/camera-manager.service';

@Injectable({
    providedIn: 'root'
})
export class FlyControlsService {
    private gameInput = inject(GameInputService);
    private cameraManager = inject(CameraManagerService);

    private camera!: THREE.Camera;
    private enabled = false;

    private rotation = { pitch: 0, yaw: 0 };
    private velocity = new THREE.Vector3();

    // Configuration
    speed = 15;
    sensitivity = 0.002;
    damping = 6.0;

    // RUN_OPT: Scratch objects
    private readonly _vecInput = new THREE.Vector3();
    private readonly _vecFwd = new THREE.Vector3();
    private readonly _vecRgt = new THREE.Vector3();
    private readonly _vecUp = new THREE.Vector3(0, 1, 0);
    private readonly _euler = new THREE.Euler(0, 0, 0, 'YXZ');

    init(camera: THREE.Camera, domElement: HTMLElement) {
        this.camera = camera;
        const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
        this.rotation.pitch = euler.x;
        this.rotation.yaw = euler.y;
    }

    enable() {
        this.enabled = true;
        this.velocity.set(0, 0, 0);
    }

    disable() {
        this.enabled = false;
        // Reset FOV when exiting mode
        this.cameraManager.setFovOffset(0);
    }

    update(dt: number) {
        if (!this.enabled || !this.camera) return;

        const delta = dt / 1000;
        const look = this.gameInput.getLookDelta(delta);

        this.rotation.yaw -= look.x * this.sensitivity;

        // RUN_FIX: Inverted Pitch Logic (Standard Look)
        // Up Input (Negative Delta) -> Pitch Increase (Look Up)
        this.rotation.pitch -= look.y * this.sensitivity;

        const limit = Math.PI / 2 - 0.1;
        this.rotation.pitch = Math.max(-limit, Math.min(limit, this.rotation.pitch));

        this._euler.set(this.rotation.pitch, this.rotation.yaw, 0, 'YXZ');
        this.camera.quaternion.setFromEuler(this._euler);

        const moveInput = this.gameInput.getMoveDir();
        const ascendInput = this.gameInput.getAscend();

        // RUN_INDUSTRY: Sprint / Turbo Mode
        const isSprinting = this.gameInput.getRun();
        const currentSpeed = isSprinting ? this.speed * 2.5 : this.speed;

        this._vecFwd.set(0, 0, -1).applyQuaternion(this.camera.quaternion);
        this._vecRgt.set(1, 0, 0).applyQuaternion(this.camera.quaternion);

        this._vecInput.set(0, 0, 0);
        if (Math.abs(moveInput.y) > 0.01) this._vecInput.addScaledVector(this._vecFwd, moveInput.y);
        if (Math.abs(moveInput.x) > 0.01) this._vecInput.addScaledVector(this._vecRgt, moveInput.x);
        if (Math.abs(ascendInput) > 0.01) this._vecInput.addScaledVector(this._vecUp, ascendInput);

        if (this._vecInput.lengthSq() > 1) this._vecInput.normalize();

        this._vecInput.multiplyScalar(currentSpeed);
        const lerpAlpha = Math.min(1.0, this.damping * delta);
        this.velocity.lerp(this._vecInput, lerpAlpha);

        const speedSq = this.velocity.lengthSq();
        if (speedSq > 0.0001) {
            this.camera.position.addScaledVector(this.velocity, delta);
        }

        // RUN_INDUSTRY: FOV Effect based on speed ratio
        // Target FOV increases by up to 10 degrees at max turbo speed
        const maxSpeedSq = (this.speed * 2.5) ** 2;
        const speedRatio = Math.min(1.0, speedSq / maxSpeedSq);
        this.cameraManager.setFovOffset(speedRatio * 12.0);
    }
}
