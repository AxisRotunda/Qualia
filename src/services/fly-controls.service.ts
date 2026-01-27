
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
  
  // Configuration
  speed = 10;
  sensitivity = 0.002;

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
  }

  update(dt: number) {
    if (!this.enabled) return;

    const moveSpeed = this.speed * (dt / 1000); 
    
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
    const up = new THREE.Vector3(0, 1, 0); 

    const dir = new THREE.Vector3();

    if (this.moveState.forward) dir.add(forward);
    if (this.moveState.backward) dir.sub(forward);
    
    if (this.moveState.right) dir.add(right);
    if (this.moveState.left) dir.sub(right);
    
    if (this.moveState.up) dir.add(up);
    if (this.moveState.down) dir.sub(up);

    if (dir.lengthSq() > 0) {
        dir.normalize().multiplyScalar(moveSpeed);
        this.camera.position.add(dir);
    }
  }

  private onMouseMove(e: MouseEvent) {
    if (!this.enabled || document.pointerLockElement !== this.domElement) return;

    this.rotation.yaw -= e.movementX * this.sensitivity;
    this.rotation.pitch -= e.movementY * this.sensitivity;

    // Clamp pitch
    this.rotation.pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, this.rotation.pitch));

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
    