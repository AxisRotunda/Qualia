import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GameInputService } from '../../services/game-input.service';
import { LayoutService } from '../../services/ui/layout.service';
import { CameraManagerService } from '../graphics/camera-manager.service';

export type CameraViewPreset = 'top' | 'front' | 'side';

/**
 * CameraControlService: Orchestrates Orbit-based camera semantics.
 * Refactored Phase 85.0: Enhanced for Industry Standard Mobile Feel.
 */
@Injectable({
  providedIn: 'root'
})
export class CameraControlService {
  private gameInput = inject(GameInputService);
  private layout = inject(LayoutService);
  private cameraManager = inject(CameraManagerService);

  private camera: THREE.PerspectiveCamera | null = null;
  private controls: OrbitControls | null = null;
  
  private readonly _vRight = new THREE.Vector3();
  private readonly _vUp = new THREE.Vector3();
  private readonly _vOffset = new THREE.Vector3();
  private readonly _spherical = new THREE.Spherical();

  init(camera: THREE.PerspectiveCamera, canvas: HTMLCanvasElement) {
    this.camera = camera;
    if (this.controls) this.controls.dispose();

    this.controls = new OrbitControls(camera, canvas);
    this.controls.enableDamping = true; // Forced for AAA feel
    this.controls.dampingFactor = 0.08;
    this.controls.rotateSpeed = 0.85;
    this.controls.screenSpacePanning = true;
    this.controls.maxPolarAngle = Math.PI / 1.95; 
    this.controls.minDistance = 2;
    this.controls.maxDistance = 150;
    this.reset();
  }
  
  update(dtMs: number) {
    if (!this.controls || !this.camera) return;

    if (this.cameraManager.isMoving) {
        this.controls.target.copy(this.cameraManager.target);
        this.controls.enabled = false;
        this.controls.update();
        return;
    }

    this.controls.enabled = true;
    this.controls.enableDamping = !this.layout.reducedMotion();
    
    // Scale virtual inputs by actual delta time for frame-rate independence
    this.processVirtualInput(dtMs / 1000);
    this.controls.update();
    
    // Sync back target for culling systems
    this.cameraManager.target.copy(this.controls.target);
  }

  private processVirtualInput(dt: number) {
     if (!this.controls || !this.camera || !this.controls.enabled) return;

     const moveDelta = this.gameInput.virtualMove;
     const lookDelta = this.gameInput.virtualLook;

     if (Math.abs(moveDelta.x) < 0.001 && Math.abs(moveDelta.y) < 0.001 && 
         Math.abs(lookDelta.x) < 0.001 && Math.abs(lookDelta.y) < 0.001) return;

     // Calibration: 1.0 Stick Tilt = 35m/s pan at standard zoom
     const panSpeed = 35.0 * dt; 
     // Calibration: 1.0 Stick Tilt = 4.5 rad/s orbit (Smooth but fast)
     const rotateSpeed = 4.5 * dt;

     // 1. Dual-Axis Pan (Left Stick)
     if (Math.abs(moveDelta.x) > 0.01 || Math.abs(moveDelta.y) > 0.01) {
         this._vOffset.set(0, 0, 0);
         this._vRight.set(1, 0, 0).applyQuaternion(this.camera.quaternion);
         this._vUp.set(0, 1, 0).applyQuaternion(this.camera.quaternion);
         
         this._vOffset.addScaledVector(this._vRight, moveDelta.x * panSpeed);
         this._vOffset.addScaledVector(this._vUp, moveDelta.y * panSpeed);
         
         this.camera.position.add(this._vOffset);
         this.controls.target.add(this._vOffset);
     }

     // 2. Spherical Orbit (Right Stick)
     if (Math.abs(lookDelta.x) > 0.01 || Math.abs(lookDelta.y) > 0.01) {
         this._vOffset.subVectors(this.camera.position, this.controls.target);
         this._spherical.setFromVector3(this._vOffset);
         
         // INDUSTRY: Cartesian standard orbit
         this._spherical.theta += lookDelta.x * rotateSpeed;
         this._spherical.phi -= lookDelta.y * rotateSpeed;
         
         this._spherical.makeSafe();
         // Prevent flipping over poles
         this._spherical.phi = Math.max(0.01, Math.min(Math.PI / 1.95, this._spherical.phi)); 
         this._vOffset.setFromSpherical(this._spherical);
         
         this.camera.position.copy(this.controls.target).add(this._vOffset);
         this.camera.lookAt(this.controls.target);
     }
  }

  setEnabled(enabled: boolean) {
      if (this.controls) this.controls.enabled = enabled;
  }

  transitionTo(config: { targetPos: THREE.Vector3, lookAt: THREE.Vector3, duration: number }) {
      this.cameraManager.transitionTo({ position: config.targetPos, target: config.lookAt, duration: config.duration });
  }

  focusOn(target: THREE.Vector3, distance: number = 10) {
    if (!this.camera) return;
    this._vOffset.subVectors(this.camera.position, target).normalize();
    if (this._vOffset.lengthSq() < 0.1) this._vOffset.set(0, 0.5, 1).normalize();
    const finalPos = target.clone().add(this._vOffset.multiplyScalar(distance));
    this.transitionTo({ targetPos: finalPos, lookAt: target, duration: 1.0 });
  }

  setPreset(preset: CameraViewPreset) {
    if (!this.controls || !this.camera) return;
    const dist = this.camera.position.distanceTo(this.controls.target);
    const targetPos = new THREE.Vector3();
    const lookAt = new THREE.Vector3(0, 5, 0);
    switch (preset) {
        case 'top': targetPos.set(0, dist, 0); break;
        case 'front': targetPos.set(0, 5, dist); break;
        case 'side': targetPos.set(dist, 5, 0); break;
    }
    this.transitionTo({ targetPos, lookAt, duration: 1.2 });
  }
  
  reset() {
    this.cameraManager.resetPosition();
    if (this.controls) {
        this.controls.target.copy(this.cameraManager.target);
        this.controls.update();
    }
  }
}