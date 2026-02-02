import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { LayoutService } from '../../services/ui/layout.service';

export interface CameraTransitionConfig {
    position: THREE.Vector3;
    target: THREE.Vector3;
    duration: number;
}

/**
 * CameraManagerService: Master controller for the render-primary viewport.
 * Refactored Phase 85.0: Implements damped FOV springs and trauma-weighted shake.
 */
@Injectable({
  providedIn: 'root'
})
export class CameraManagerService {
  private layout = inject(LayoutService);

  private camera!: THREE.PerspectiveCamera;
  
  // Transition State
  private isTransitioning = false;
  private transitionStart = 0;
  private transitionDuration = 0;
  
  private startPos = new THREE.Vector3();
  private startTarget = new THREE.Vector3();
  private endPos = new THREE.Vector3();
  private endTarget = new THREE.Vector3();

  // Primary world look-at target (Read by OrbitControls)
  public readonly target = new THREE.Vector3(0, 5, 0);

  // Optical Dynamics
  private readonly BASE_FOV = 75;
  private currentFov = 75;
  private targetFovOffset = 0;
  private fovVel = 0; // Spring velocity

  // Trauma (Shake) State
  private shakeIntensity = 0; 
  private readonly _shakeOffset = new THREE.Vector3();
  private _proceduralRoll = 0; 

  constructor() {
    this.camera = new THREE.PerspectiveCamera(
      this.BASE_FOV, window.innerWidth / window.innerHeight, 0.05, 1000
    );
    this.camera.position.set(25, 25, 25);
    this.camera.lookAt(this.target);
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  resize(width: number, height: number) {
    if (!this.camera) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  transitionTo(config: CameraTransitionConfig) {
      if (this.layout.reducedMotion()) {
          this.camera.position.copy(config.position);
          this.target.copy(config.target);
          this.camera.lookAt(this.target);
          return;
      }

      this.isTransitioning = true;
      this.transitionStart = performance.now();
      this.transitionDuration = config.duration * 1000;

      this.startPos.copy(this.camera.position);
      this.startTarget.copy(this.target);

      this.endPos.copy(config.position);
      this.endTarget.copy(config.target);
  }

  /**
   * Applies trauma to the camera for impact effects.
   * Logic: Trauma is squared for exponential falloff (AAA Juice).
   */
  shake(intensity: number) {
      if (this.layout.reducedMotion()) return;
      this.shakeIntensity = Math.min(1.0, this.shakeIntensity + intensity);
  }

  setRoll(rad: number) {
      this._proceduralRoll = rad;
  }

  setFovOffset(offset: number) {
      if (this.layout.reducedMotion()) {
          this.targetFovOffset = 0;
          return;
      }
      this.targetFovOffset = offset;
  }

  update(dtMs: number) {
      const dt = dtMs / 1000;

      // 1. Interpolation Layer (Cinema Transitions)
      if (this.isTransitioning) {
          const now = performance.now();
          const elapsed = now - this.transitionStart;
          const alpha = Math.min(1, elapsed / this.transitionDuration);
          const t = 1.0 - Math.pow(1.0 - alpha, 3);

          this.camera.position.lerpVectors(this.startPos, this.endPos, t);
          this.target.lerpVectors(this.startTarget, this.endTarget, t);
          this.camera.lookAt(this.target);

          if (alpha >= 1) this.isTransitioning = false;
      }

      // 2. Kinetic Layer (Shake & Trauma)
      if (this.shakeIntensity > 0) {
          const trauma = this.shakeIntensity * this.shakeIntensity;
          const mag = 0.6 * trauma; 
          
          this._shakeOffset.set(
              (Math.random() - 0.5) * mag,
              (Math.random() - 0.5) * mag,
              (Math.random() - 0.5) * mag
          );
          
          this.camera.position.add(this._shakeOffset);
          const decayRate = 1.2 + this.shakeIntensity * 2.0;
          this.shakeIntensity = Math.max(0, this.shakeIntensity - (decayRate * dt));
      }

      // 3. Composition Layer (Procedural Roll)
      if (Math.abs(this._proceduralRoll) > 0.001) {
          this.camera.rotateZ(this._proceduralRoll);
      }

      // 4. Optical Layer (Spring-Damped FOV)
      const targetFov = this.BASE_FOV + this.targetFovOffset;
      if (Math.abs(this.currentFov - targetFov) > 0.01) {
          const springK = 180.0;
          const springD = 18.0;
          
          const force = (targetFov - this.currentFov) * springK;
          const damping = this.fovVel * springD;
          const accel = force - damping;
          
          this.fovVel += accel * dt;
          this.currentFov += this.fovVel * dt;
          
          this.camera.fov = this.currentFov;
          this.camera.updateProjectionMatrix();
      } else {
          this.fovVel = 0;
      }
  }

  get isMoving() { return this.isTransitioning; }

  resetPosition() {
      this.target.set(0, 5, 0);
      this.camera.position.set(25, 25, 25);
      this.camera.lookAt(this.target);
      this.currentFov = this.BASE_FOV;
      this.camera.fov = this.BASE_FOV;
      this.camera.updateProjectionMatrix();
      this.shakeIntensity = 0;
      this._proceduralRoll = 0;
      this.fovVel = 0;
  }
}