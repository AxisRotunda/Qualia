
import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class ParticleService {
  private system: THREE.Points | null = null;
  
  init(scene: THREE.Scene, count = 500) {
    if (this.system) {
        scene.remove(this.system);
    }

    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      pos[i*3] = (Math.random() - 0.5) * 200;
      pos[i*3+1] = Math.random() * 60;
      pos[i*3+2] = (Math.random() - 0.5) * 200;
      
      vel[i*3] = (Math.random() - 0.5) * 0.2;
      vel[i*3+1] = -0.05 - Math.random() * 0.1; // Slow fall
      vel[i*3+2] = (Math.random() - 0.5) * 0.2;
    }
    
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('velocity', new THREE.BufferAttribute(vel, 3));
    
    // Simple square texture capability or just points
    const mat = new THREE.PointsMaterial({ 
        color: 0x94a3b8, 
        size: 0.4, 
        transparent: true, 
        opacity: 0.6,
        sizeAttenuation: true 
    });
    
    this.system = new THREE.Points(geo, mat);
    this.system.frustumCulled = false; // Always render
    scene.add(this.system);
  }
  
  update(dt: number) {
    if (!this.system) return;

    const positions = this.system.geometry.attributes['position'].array as Float32Array;
    const velocities = this.system.geometry.attributes['velocity'].array as Float32Array;
    
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += velocities[i] * (dt/16); // Scale by frame time roughly
      positions[i+1] += velocities[i+1] * (dt/16);
      positions[i+2] += velocities[i+2] * (dt/16);
      
      // Reset if too low
      if (positions[i+1] < -5) {
        positions[i+1] = 60;
        positions[i] = (Math.random() - 0.5) * 200;
        positions[i+2] = (Math.random() - 0.5) * 200;
      }
    }
    
    this.system.geometry.attributes['position'].needsUpdate = true;
  }
}
    