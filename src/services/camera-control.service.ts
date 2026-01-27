
import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class CameraControlService {
  private camera: THREE.PerspectiveCamera | null = null;
  private spherical = new THREE.Spherical(20, Math.PI / 4, 0);
  private target = new THREE.Vector3(0, 5, 0);
  private velocity = { theta: 0, phi: 0 }; 
  
  setCamera(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.update();
  }
  
  onMouseDrag(dx: number, dy: number) {
    this.velocity.phi -= dx * 0.005;   // Azimuth sensitivity
    this.velocity.theta -= dy * 0.005; // Polar sensitivity
  }

  onZoom(delta: number) {
    this.spherical.radius = Math.max(5, Math.min(50, this.spherical.radius + delta * 0.05));
  }
  
  update() {
    if (!this.camera) return;

    // Apply velocity with exponential decay
    this.spherical.phi += this.velocity.phi;
    this.spherical.theta = Math.max(0.1, Math.min(Math.PI - 0.1, 
      this.spherical.theta + this.velocity.theta));
    
    this.velocity.phi *= 0.92;  // Damping
    this.velocity.theta *= 0.92;
    
    this.camera.position.setFromSpherical(this.spherical).add(this.target);
    this.camera.lookAt(this.target);
  }
}
