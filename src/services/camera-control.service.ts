
import { Injectable } from '@angular/core';
import * as THREE from 'three';

export type CameraViewPreset = 'top' | 'front' | 'side';

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

  focusOn(target: THREE.Vector3) {
    // Animate target? For now, snap
    this.target.copy(target);
    this.spherical.radius = 10; // Zoom in reasonable amount
    this.update();
  }

  setPreset(preset: CameraViewPreset) {
    this.target.set(0, 5, 0); // Reset target to center or keep? Resetting feels more "preset" like.
    
    switch (preset) {
        case 'top':
            this.spherical.set(20, 0.1, 0); // Close to 0 but not exactly to avoid Gimbal lock issues in some controllers
            break;
        case 'front':
            this.spherical.set(20, Math.PI / 2, 0);
            break;
        case 'side':
            this.spherical.set(20, Math.PI / 2, Math.PI / 2);
            break;
    }
    this.update();
  }
  
  reset() {
    this.spherical.set(20, Math.PI / 4, 0);
    this.target.set(0, 5, 0);
    this.velocity = { theta: 0, phi: 0 };
    this.update();
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
