
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export type CameraViewPreset = 'top' | 'front' | 'side';

@Injectable({
  providedIn: 'root'
})
export class CameraControlService {
  private camera: THREE.PerspectiveCamera | null = null;
  private controls: OrbitControls | null = null;
  
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
    if (this.controls) {
        this.controls.update();
    }
  }

  setEnabled(enabled: boolean) {
      if (this.controls) {
          this.controls.enabled = enabled;
      }
  }

  focusOn(target: THREE.Vector3) {
    if (!this.controls || !this.camera) return;

    // Smooth transition could be added here with Tweening
    // For now, instant focus
    this.controls.target.copy(target);
    
    // Offset camera slightly if it's too far/close
    const offset = new THREE.Vector3().subVectors(this.camera.position, this.controls.target).normalize().multiplyScalar(10);
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
  }
}