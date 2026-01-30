
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { GameInputService } from '../../services/game-input.service';

@Injectable({
  providedIn: 'root'
})
export class FlyControlsService {
  private input = inject(GameInputService);
  
  private camera!: THREE.Camera;
  private domElement!: HTMLElement;
  private enabled = false;
  
  private rotation = { pitch: 0, yaw: 0 };
  
  // Inertia state
  private velocity = new THREE.Vector3();
  
  // Configuration
  speed = 10;
  sensitivity = 0.0015; 
  damping = 4.0; 

  init(camera: THREE.Camera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;
    
    // Capture initial rotation
    const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
    this.rotation.pitch = euler.x;
    this.rotation.yaw = euler.y;
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
    this.velocity.set(0,0,0);
  }

  update(dt: number) {
    if (!this.enabled || !this.camera) return;

    const delta = dt / 1000;

    // 1. Look
    const look = this.input.getLookDelta();
    
    this.rotation.yaw -= look.x * this.sensitivity;
    this.rotation.pitch += look.y * this.sensitivity;

    // Clamp pitch
    const limit = Math.PI / 2 - 0.1; 
    this.rotation.pitch = Math.max(-limit, Math.min(limit, this.rotation.pitch));

    this.camera.quaternion.setFromEuler(new THREE.Euler(this.rotation.pitch, this.rotation.yaw, 0, 'YXZ'));
    
    // 2. Move
    const moveDir = this.input.getMoveDir(); // x: Right, y: Forward
    const vertical = this.input.getAscend(); // +1 Up, -1 Down
    
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
    const up = new THREE.Vector3(0, 1, 0); 

    const inputDir = new THREE.Vector3();

    if (Math.abs(moveDir.y) > 0.01) inputDir.addScaledVector(forward, moveDir.y);
    if (Math.abs(moveDir.x) > 0.01) inputDir.addScaledVector(right, moveDir.x);
    if (Math.abs(vertical) > 0.01) inputDir.addScaledVector(up, vertical);

    if (inputDir.lengthSq() > 1) {
        inputDir.normalize();
    }

    // 3. Apply Acceleration / Inertia
    const targetVelocity = inputDir.multiplyScalar(this.speed);
    
    const lerpFactor = Math.min(1, this.damping * delta);
    this.velocity.lerp(targetVelocity, lerpFactor);

    // 4. Apply Velocity
    if (this.velocity.lengthSq() > 0.001) {
        const moveVec = this.velocity.clone().multiplyScalar(delta);
        this.camera.position.add(moveVec);
    }
  }
}
