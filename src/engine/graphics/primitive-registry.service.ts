
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { PhysicsBodyDef } from '../../engine/schema';

@Injectable({
  providedIn: 'root'
})
export class PrimitiveRegistryService {
  private cache = new Map<string, THREE.BufferGeometry>();

  /**
   * Retrieves geometry with support for Level of Detail (LOD).
   * @param data Physics definition
   * @param lod Level of Detail (0 = High, 1 = Med, 2 = Low)
   */
  getGeometry(data: PhysicsBodyDef, lod: number = 0): THREE.BufferGeometry {
    const key = this.getCacheKey(data, lod);
    
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const geometry = this.generateGeometry(data, lod);
    this.cache.set(key, geometry);
    return geometry;
  }

  getGhostGeometry(type: 'box'|'cylinder'|'cone'|'sphere', size: THREE.Vector3): THREE.BufferGeometry {
      const key = `ghost_${type}_${size.x}_${size.y}_${size.z}`;
      if (this.cache.has(key)) return this.cache.get(key)!;

      let geo: THREE.BufferGeometry;
      // Ghosts are always low poly (LOD 2 equivalent)
      if (type === 'box') geo = new THREE.BoxGeometry(size.x, size.y, size.z);
      else if (type === 'cylinder') geo = new THREE.CylinderGeometry(size.x, size.x, size.y, 16);
      else if (type === 'cone') geo = new THREE.ConeGeometry(size.x, size.y, 16);
      else geo = new THREE.SphereGeometry(size.x, 16, 16);

      this.cache.set(key, geo);
      return geo;
  }

  private generateGeometry(data: PhysicsBodyDef, lod: number): THREE.BufferGeometry {
    // LOD Heuristics (Self-Learning from Protocol)
    // LOD 0: 32 segments
    // LOD 1: 16 segments
    // LOD 2: 8 segments
    const radialSegs = lod === 0 ? 32 : (lod === 1 ? 16 : 8);
    const heightSegs = lod === 0 ? 1 : 1; 

    switch (data.type) {
      case 'box':
        // Boxes don't really have LODs unless we bevel them (not implemented yet)
        return new THREE.BoxGeometry(data.size!.w, data.size!.h, data.size!.d);
      case 'cylinder':
        return new THREE.CylinderGeometry(data.radius, data.radius, data.height, radialSegs, heightSegs);
      case 'cone':
        return new THREE.ConeGeometry(data.radius, data.height, radialSegs, heightSegs);
      case 'sphere':
      default:
        // Spheres degrade to 16x16 or 8x8
        return new THREE.SphereGeometry(data.radius!, radialSegs, Math.max(8, radialSegs / 2));
    }
  }

  private getCacheKey(data: PhysicsBodyDef, lod: number): string {
    const base = this.getBaseKey(data);
    return `${base}_lod${lod}`;
  }

  private getBaseKey(data: PhysicsBodyDef): string {
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
