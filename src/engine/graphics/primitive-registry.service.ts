
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { PhysicsBodyDef } from '../../engine/schema';

@Injectable({
  providedIn: 'root'
})
export class PrimitiveRegistryService {
  private cache = new Map<string, THREE.BufferGeometry>();

  getGeometry(data: PhysicsBodyDef): THREE.BufferGeometry {
    const key = this.getCacheKey(data);
    
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const geometry = this.generateGeometry(data);
    this.cache.set(key, geometry);
    return geometry;
  }

  getGhostGeometry(type: 'box'|'cylinder'|'cone'|'sphere', size: THREE.Vector3): THREE.BufferGeometry {
      const key = `ghost_${type}_${size.x}_${size.y}_${size.z}`;
      if (this.cache.has(key)) return this.cache.get(key)!;

      let geo: THREE.BufferGeometry;
      if (type === 'box') geo = new THREE.BoxGeometry(size.x, size.y, size.z);
      else if (type === 'cylinder') geo = new THREE.CylinderGeometry(size.x, size.x, size.y, 16);
      else if (type === 'cone') geo = new THREE.ConeGeometry(size.x, size.y, 16);
      else geo = new THREE.SphereGeometry(size.x, 16, 16);

      this.cache.set(key, geo);
      return geo;
  }

  private generateGeometry(data: PhysicsBodyDef): THREE.BufferGeometry {
    switch (data.type) {
      case 'box':
        return new THREE.BoxGeometry(data.size!.w, data.size!.h, data.size!.d);
      case 'cylinder':
        return new THREE.CylinderGeometry(data.radius, data.radius, data.height, 32);
      case 'cone':
        return new THREE.ConeGeometry(data.radius, data.height, 32);
      case 'sphere':
      default:
        return new THREE.SphereGeometry(data.radius!, 32, 32);
    }
  }

  private getCacheKey(data: PhysicsBodyDef): string {
    if (data.type === 'box') return `box_${data.size?.w}_${data.size?.h}_${data.size?.d}`;
    if (data.type === 'cylinder') return `cyl_${data.radius}_${data.height}`;
    if (data.type === 'cone') return `cone_${data.radius}_${data.height}`;
    if (data.type === 'sphere') return `sph_${data.radius}`;
    return 'unknown';
  }

  dispose() {
    this.cache.forEach(geo => geo.dispose());
    this.cache.clear();
  }
}
