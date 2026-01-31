
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export type CameraViewPreset = 'top' | 'front' | 'side';

export interface CameraTweenConfig {
    targetPos: THREE.Vector3;
    lookAt: THREE.Vector3;
    duration: number; // seconds
}

@Injectable({
  providedIn: 'root'
})
export class CameraControlService {
  private camera: THREE.PerspectiveCamera | null = null;
  private controls: OrbitControls | null = null;
  
  // Transition State
  private isTransitioning = false;
  private transitionStart = 0;
  private transitionDuration = 0;
  private startPos = new THREE.Vector3();
  private startTarget = new THREE.Vector3();
  private endPos = new THREE.Vector3();
  private endTarget = new THREE.Vector3();

  init(camera: THREE.PerspectiveCamera, canvas: HTMLCanvasElement) {
    this.camera = camera;
    
    // Dispose previous if exists
    if (this.controls) {
        this.controls.dispose();
    }

    this.controls = new OrbitControls(camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = true;
    
    // Limits to prevent going under the floor too easily
    this.controls.maxPolarAngle = Math.PI / 1.95; 
    this.controls.minDistance = 2;
    this.controls.maxDistance = 100;

    this.reset();
  }
  
  update() {
    if (this.isTransitioning && this.camera && this.controls) {
        const now = performance.now();
        const alpha = Math.min(1, (now - this.transitionStart) / (this.transitionDuration * 1000));
        
        // Quadratic Ease In/Out
        const t = alpha < 0.5 ? 2 * alpha * alpha : -1 + (4 - 2 * alpha) * alpha;

        this.camera.position.lerpVectors(this.startPos, this.endPos, t);
        this.controls.target.lerpVectors(this.startTarget, this.endTarget, t);
        
        if (alpha >= 1) {
            this.isTransitioning = false;
            this.controls.enabled = true;
        }
    } else if (this.controls) {
        this.controls.update();
    }
  }

  // Called by InputManager to pipe virtual inputs
  updateInput(moveDelta: {x: number, y: number}, lookDelta: {x: number, y: number}) {
     if (!this.controls || !this.camera || !this.controls.enabled || this.isTransitioning) return;

     // If no input, just return (Damping continues in update)
     if (moveDelta.x === 0 && moveDelta.y === 0 && lookDelta.x === 0 && lookDelta.y === 0) return;

     const dt = 0.016; 
     const panSpeed = 30.0 * dt; 
     const rotateSpeed = 2.0 * dt;

     // 1. Pan (Left Joystick)
     if (Math.abs(moveDelta.x) > 0.01 || Math.abs(moveDelta.y) > 0.01) {
         const offset = new THREE.Vector3();
         
         // Get Camera Basis
         const vRight = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
         const vUp = new THREE.Vector3(0, 1, 0).applyQuaternion(this.camera.quaternion);
         
         // Project to view plane logic for Pan
         offset.addScaledVector(vRight, moveDelta.x * panSpeed);
         
         // Normally Pan Up moves camera Up. 
         // Joy Up (+1) -> moveDelta.y is +1.
         // We want camera to move Up (so world goes down).
         offset.addScaledVector(vUp, moveDelta.y * panSpeed);
         
         this.camera.position.add(offset);
         this.controls.target.add(offset);
     }

     // 2. Orbit (Right Joystick)
     if (Math.abs(lookDelta.x) > 0.01 || Math.abs(lookDelta.y) > 0.01) {
         const offset = new THREE.Vector3().subVectors(this.camera.position, this.controls.target);
         const spherical = new THREE.Spherical().setFromVector3(offset);
         
         spherical.theta -= lookDelta.x * rotateSpeed;
         spherical.phi -= lookDelta.y * rotateSpeed;
         
         spherical.makeSafe();
         
         spherical.phi = Math.max(0, Math.min(Math.PI / 1.95, spherical.phi)); 
         spherical.radius = Math.max(this.controls.minDistance, Math.min(this.controls.maxDistance, spherical.radius));

         offset.setFromSpherical(spherical);
         
         this.camera.position.copy(this.controls.target).add(offset);
         this.camera.lookAt(this.controls.target);
     }
  }

  setEnabled(enabled: boolean) {
      if (this.controls) {
          this.controls.enabled = enabled && !this.isTransitioning;
      }
  }

  transitionTo(config: CameraTweenConfig) {
      if (!this.camera || !this.controls) return;
      
      this.isTransitioning = true;
      this.controls.enabled = false; // Disable input during tween
      
      this.startPos.copy(this.camera.position);
      this.startTarget.copy(this.controls.target);
      
      this.endPos.copy(config.targetPos);
      this.endTarget.copy(config.lookAt);
      
      this.transitionDuration = config.duration;
      this.transitionStart = performance.now();
  }

  focusOn(target: THREE.Vector3, distance: number = 10) {
    if (!this.controls || !this.camera) return;
    
    this.controls.target.copy(target);
    
    const currentOffset = new THREE.Vector3().subVectors(this.camera.position, this.controls.target).normalize();
    if (currentOffset.lengthSq() < 0.1) currentOffset.set(0, 0.5, 1).normalize();
    
    const offset = currentOffset.multiplyScalar(distance);
    this.camera.position.copy(target).add(offset);
    this.camera.lookAt(target);
  }

  setPreset(preset: CameraViewPreset) {
    if (!this.controls || !this.camera) return;

    const dist = this.camera.position.distanceTo(this.controls.target);
    this.controls.target.set(0, 5, 0);

    switch (preset) {
        case 'top':
            this.camera.position.set(0, dist, 0);
            break;
        case 'front':
            this.camera.position.set(0, 5, dist);
            break;
        case 'side':
            this.camera.position.set(dist, 5, 0);
            break;
    }
    this.camera.lookAt(this.controls.target);
  }
  
  reset() {
    if (!this.controls || !this.camera) return;
    this.controls.target.set(0, 5, 0);
    this.camera.position.set(15, 15, 15);
    this.camera.lookAt(0, 5, 0);
    this.isTransitioning = false;
  }
}
