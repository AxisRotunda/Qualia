
import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class NatureGeologyService {

  generateRock(): THREE.BufferGeometry {
    let geo: THREE.BufferGeometry = new THREE.IcosahedronGeometry(0.8, 1); 
    const pos = geo.getAttribute('position');
    const vertex = new THREE.Vector3();
    
    for (let i = 0; i < pos.count; i++) {
        vertex.fromBufferAttribute(pos, i);
        const noise = (Math.random() * 0.4) + 0.8; 
        vertex.multiplyScalar(noise);
        vertex.x *= 1.0 + (Math.random() * 0.2);
        vertex.y *= 0.7 + (Math.random() * 0.3); 
        pos.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    geo.computeVertexNormals(); 
    geo = geo.toNonIndexed();
    geo.computeVertexNormals(); 
    return geo;
  }

  generateIceChunk(): THREE.BufferGeometry {
    let geo: THREE.BufferGeometry = new THREE.ConeGeometry(0.6, 2.5, 5, 1);
    geo = geo.toNonIndexed();
    geo.translate(0, 1.25, 0);
    
    const posAttribute = geo.getAttribute('position');
    const vertex = new THREE.Vector3();
    
    for (let i = 0; i < posAttribute.count; i++) {
        vertex.fromBufferAttribute(posAttribute, i);
        if (vertex.y < 0.1) continue; 
        
        const angle = vertex.y * 0.5;
        const x = vertex.x * Math.cos(angle) - vertex.z * Math.sin(angle);
        const z = vertex.x * Math.sin(angle) + vertex.z * Math.cos(angle);
        
        vertex.x = x + (Math.random()-0.5)*0.2;
        vertex.z = z + (Math.random()-0.5)*0.2;
        
        posAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    geo.translate(0, -1.25, 0); 
    geo.computeVertexNormals();
    return geo;
  }

  generateIceSpire(): THREE.BufferGeometry {
      // Tall, jagged shard
      const geo = new THREE.ConeGeometry(4, 25, 5, 4);
      geo.translate(0, 10, 0); // Base at 0
      
      const pos = geo.getAttribute('position');
      const v = new THREE.Vector3();
      for(let i=0; i<pos.count; i++) {
          v.fromBufferAttribute(pos, i);
          if (v.y < 0.5) continue;
          
          v.x += (Math.random()-0.5) * 2;
          v.z += (Math.random()-0.5) * 2;
          
          // Twist
          const angle = v.y * 0.1;
          const tx = v.x * Math.cos(angle) - v.z * Math.sin(angle);
          const tz = v.x * Math.sin(angle) + v.z * Math.cos(angle);
          v.x = tx; v.z = tz;

          pos.setXYZ(i, v.x, v.y, v.z);
      }
      geo.computeVertexNormals();
      return geo;
  }
}
