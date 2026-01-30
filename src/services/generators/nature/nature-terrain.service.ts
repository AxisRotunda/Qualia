
import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class NatureTerrainService {
  
  generateIceTerrain(size = 128): THREE.BufferGeometry {
      const segments = 64;
      const geo = new THREE.PlaneGeometry(size, size, segments, segments);
      geo.rotateX(-Math.PI / 2);

      const pos = geo.getAttribute('position');
      const v = new THREE.Vector3();

      for (let i = 0; i < pos.count; i++) {
          v.fromBufferAttribute(pos, i);
          
          // Simple noise combo
          const nx = v.x * 0.05;
          const nz = v.z * 0.05;
          let h = Math.sin(nx) * Math.cos(nz) * 2;
          h += Math.sin(nx * 2.5 + nz) * 0.5;
          h += Math.random() * 0.1; // roughness

          // Central flattening
          const dist = Math.sqrt(v.x*v.x + v.z*v.z);
          if (dist < 20) {
              h *= (dist / 20); // Flatten center for station
          }

          // Raise edges for mountains
          if (dist > 40) {
              h += (dist - 40) * 0.5 * (Math.sin(nx*0.5)+1.5);
          }

          pos.setY(i, h);
      }

      geo.computeVertexNormals();
      return geo;
  }
}
