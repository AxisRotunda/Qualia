
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { fromEvent, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FlyControlsService {
  private camera!: THREE.Camera;
  private domElement!: HTMLElement;
  private enabled = false;
  
  private moveState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false
  };
  
  private rotation = { pitch: 0, yaw: 0 };
  private subscriptions: Subscription[] = [];
  
  // Inertia state
  private velocity = new THREE.Vector3();
  
  // Configuration
  speed = 10;
  sensitivity = 0.0015; // Lower sensitivity for weightier feel
  damping = 4.0; // Higher damping = faster stop

  init(camera: THREE.Camera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;
    
    // Capture initial rotation
    const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
    this.rotation.pitch = euler.x;
    this.rotation.yaw = euler.y;
  }

  enable() {
    if (this.enabled) return;
    this.enabled = true;

    const subKey = fromEvent<KeyboardEvent>(window, 'keydown').subscribe(e => this.onKey(e, true));
    const subKeyUp = fromEvent<KeyboardEvent>(window, 'keyup').subscribe(e => this.onKey(e, false));
    const subMove = fromEvent<MouseEvent>(document, 'mousemove').subscribe(e => this.onMouseMove(e));

    this.subscriptions.push(subKey, subKeyUp, subMove);
  }

  disable() {
    if (!this.enabled) return;
    this.enabled = false;
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];
    
    // Reset move state
    Object.keys(this.moveState).forEach(k => (this.moveState as any)[k] = false);
    this.velocity.set(0,0,0);
  }

  update(dt: number) {
    if (!this.enabled) return;

    const delta = dt / 1000;
    
    // 1. Calculate Target Direction
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
    const up = new THREE.Vector3(0, 1, 0); 

    const inputDir = new THREE.Vector3();

    if (this.moveState.forward) inputDir.add(forward);
    if (this.moveState.backward) inputDir.sub(forward);
    if (this.moveState.right) inputDir.add(right);
    if (this.moveState.left) inputDir.sub(right);
    if (this.moveState.up) inputDir.add(up);
    if (this.moveState.down) inputDir.sub(up);

    if (inputDir.lengthSq() > 0) {
        inputDir.normalize();
    }

    // 2. Apply Acceleration / Inertia
    const targetVelocity = inputDir.multiplyScalar(this.speed);
    
    // Lerp towards target velocity for ease-in/out
    const lerpFactor = Math.min(1, this.damping * delta);
    this.velocity.lerp(targetVelocity, lerpFactor);

    // 3. Apply Velocity
    if (this.velocity.lengthSq() > 0.001) {
        const moveVec = this.velocity.clone().multiplyScalar(delta);
        this.camera.position.add(moveVec);
    }
  }

  private onMouseMove(e: MouseEvent) {
    if (!this.enabled || document.pointerLockElement !== this.domElement) return;

    this.rotation.yaw -= e.movementX * this.sensitivity;
    this.rotation.pitch -= e.movementY * this.sensitivity;

    // Clamp pitch to human head range (~60 deg up/down)
    const limit = Math.PI / 3; 
    this.rotation.pitch = Math.max(-limit, Math.min(limit, this.rotation.pitch));

    this.camera.quaternion.setFromEuler(new THREE.Euler(this.rotation.pitch, this.rotation.yaw, 0, 'YXZ'));
  }

  private onKey(e: KeyboardEvent, pressed: boolean) {
      if (document.pointerLockElement !== this.domElement) return;
      
      switch (e.code) {
          case 'KeyW': this.moveState.forward = pressed; break;
          case 'KeyS': this.moveState.backward = pressed; break;
          case 'KeyA': this.moveState.left = pressed; break;
          case 'KeyD': this.moveState.right = pressed; break;
          case 'Space': this.moveState.up = pressed; break;
          case 'ShiftLeft':
          case 'ShiftRight': this.moveState.down = pressed; break;
      }
  }
}
