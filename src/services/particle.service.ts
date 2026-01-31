
import { Injectable } from '@angular/core';
import * as THREE from 'three';

export type WeatherType = 'clear' | 'snow' | 'rain' | 'ash';

@Injectable({
  providedIn: 'root'
})
export class ParticleService {
  private system: THREE.Points | null = null;
  private currentType: WeatherType = 'clear';
  private scene: THREE.Scene | null = null;
  
  // Weather State
  private velocityBase = new THREE.Vector3(0, -0.2, 0);
  private wind = new THREE.Vector3(0, 0, 0);
  private turbulence = 0;
  private range = 100;

  setWeather(type: WeatherType, scene: THREE.Scene) {
      this.currentType = type;
      this.scene = scene;
      
      // Cleanup old
      if (this.system) {
          scene.remove(this.system);
          this.system.geometry.dispose();
          (this.system.material as THREE.Material).dispose();
          this.system = null;
      }

      if (type === 'clear') return;

      const isMobile = window.innerWidth < 800;
      
      let count = 0;
      let color = 0xffffff;
      let size = 0.1;
      let opacity = 0.8;

      if (type === 'snow') {
          // Reduced snow count for mobile to prevent overdraw
          count = isMobile ? 3000 : 15000;
          color = 0xffffff;
          size = 0.15;
          opacity = 0.8;
          this.velocityBase.set(0, -2.5, 0); // Fast fall for blizzard
          this.wind.set(2.0, -0.5, 0.5); // Strong lateral wind
          this.turbulence = 0.1;
          this.range = 100;
      } else if (type === 'rain') {
          count = isMobile ? 4000 : 10000;
          color = 0xaaccff;
          size = 0.1;
          opacity = 0.6;
          this.velocityBase.set(0, -20, 0);
          this.wind.set(0, 0, 0);
      }

      this.createSystem(count, color, size, opacity);
  }

  private createSystem(count: number, color: number, size: number, opacity: number) {
      if (!this.scene) return;

      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      const vel = new Float32Array(count * 3);
      
      for (let i = 0; i < count; i++) {
        pos[i*3] = (Math.random() - 0.5) * this.range * 2;
        pos[i*3+1] = Math.random() * 60;
        pos[i*3+2] = (Math.random() - 0.5) * this.range * 2;
        
        // Random variance in fall speed
        const variance = 1.0 + (Math.random() * 0.5);
        vel[i*3] = this.velocityBase.x * variance;
        vel[i*3+1] = this.velocityBase.y * variance;
        vel[i*3+2] = this.velocityBase.z * variance;
      }
      
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('velocity', new THREE.BufferAttribute(vel, 3));
      
      const mat = new THREE.PointsMaterial({ 
          color: color, 
          size: size, 
          transparent: true, 
          opacity: opacity,
          sizeAttenuation: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false
      });
      
      this.system = new THREE.Points(geo, mat);
      this.system.frustumCulled = false;
      this.scene.add(this.system);
  }
  
  update(dtMs: number, camPos: THREE.Vector3) {
    if (!this.system || !this.scene) return;
    
    const dt = dtMs / 1000;
    const positions = this.system.geometry.attributes['position'].array as Float32Array;
    const velocities = this.system.geometry.attributes['velocity'].array as Float32Array;
    
    for (let i = 0; i < positions.length; i += 3) {
      // Base velocity + Wind
      let vx = velocities[i] + this.wind.x;
      let vy = velocities[i+1] + this.wind.y;
      let vz = velocities[i+2] + this.wind.z;
      
      // Turbulence (Simplified for perf)
      if (this.turbulence > 0) {
          vx += (Math.random() - 0.5) * this.turbulence;
          vz += (Math.random() - 0.5) * this.turbulence;
      }

      positions[i] += vx * dt;
      positions[i+1] += vy * dt;
      positions[i+2] += vz * dt;
      
      // Wrap around logic relative to camera to create infinite field illusion
      const bounds = this.range;
      
      // Y Wrap
      if (positions[i+1] < -5) {
        positions[i+1] = 60;
        // Respawn near camera x/z but randomized
        positions[i] = camPos.x + (Math.random() - 0.5) * bounds * 2;
        positions[i+2] = camPos.z + (Math.random() - 0.5) * bounds * 2;
      }
      
      // X/Z Wrap if too far from camera
      if (Math.abs(positions[i] - camPos.x) > bounds) {
          positions[i] += (positions[i] < camPos.x) ? bounds * 2 : -bounds * 2;
      }
      if (Math.abs(positions[i+2] - camPos.z) > bounds) {
          positions[i+2] += (positions[i+2] < camPos.z) ? bounds * 2 : -bounds * 2;
      }
    }
    
    this.system.geometry.attributes['position'].needsUpdate = true;
  }
}