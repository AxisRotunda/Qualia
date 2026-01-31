
import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class CameraManagerService {
  private camera!: THREE.PerspectiveCamera;

  constructor() {
    // Default Camera Setup - Wide FOV for immersion, Low Near Plane for scale detail
    this.camera = new THREE.PerspectiveCamera(
      75, window.innerWidth / window.innerHeight, 0.05, 500
    );
    this.camera.position.set(0, 10, 20);
    this.camera.lookAt(0, 0, 0);
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  resize(width: number, height: number) {
    if (!this.camera) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  resetPosition() {
      this.camera.position.set(0, 10, 20);
      this.camera.lookAt(0, 0, 0);
  }
}
