
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as BufferUtils from 'three/addons/utils/BufferGeometryUtils.js';

@Injectable({
  providedIn: 'root'
})
export class NatureFloraService {
  
  generateTree(): THREE.BufferGeometry | null {
    let trunkGeo: THREE.BufferGeometry = new THREE.CylinderGeometry(0.2, 0.45, 1.6, 7);
    trunkGeo = trunkGeo.toNonIndexed();
    trunkGeo.translate(0, 0.8, 0); 
    
    const pos = trunkGeo.getAttribute('position');
    const v = new THREE.Vector3();
    for(let i=0; i<pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        if (v.y > 0.2) { 
            v.x += (Math.random()-0.5) * 0.1;
            v.z += (Math.random()-0.5) * 0.1;
        }
        pos.setXYZ(i, v.x, v.y, v.z);
    }
    trunkGeo.computeVertexNormals();

    const createCluster = (y: number, scale: number) => {
        let geo: THREE.BufferGeometry = new THREE.IcosahedronGeometry(scale, 0);
        geo = geo.toNonIndexed();
        geo.translate(0, y, 0);
        geo.rotateY(Math.random() * Math.PI);
        geo.rotateZ((Math.random()-0.5) * 0.2);
        
        const pos = geo.getAttribute('position');
        const vec = new THREE.Vector3();
        for(let i=0; i<pos.count; i++) {
            vec.fromBufferAttribute(pos, i);
            vec.addScalar((Math.random()-0.5)*0.2);
            pos.setXYZ(i, vec.x, vec.y, vec.z);
        }
        geo.computeVertexNormals();
        return geo;
    };

    const leaves1 = createCluster(1.8, 1.0);
    const leaves2 = createCluster(2.8, 0.85);
    const leaves3 = createCluster(3.6, 0.5);

    const foliageGeo = BufferUtils.mergeGeometries([leaves1, leaves2, leaves3], false);

    if (!foliageGeo || !trunkGeo) return null;

    const trunkVertCount = trunkGeo.getAttribute('position').count;
    const foliageVertCount = foliageGeo.getAttribute('position').count;

    const finalGeo = BufferUtils.mergeGeometries([trunkGeo, foliageGeo], false);
    
    if (finalGeo) {
        finalGeo.clearGroups();
        finalGeo.addGroup(0, trunkVertCount, 0); 
        finalGeo.addGroup(trunkVertCount, foliageVertCount, 1);
        
        // Total Height ~ 4.5. Center at ~2.25.
        // Currently base at 0.
        finalGeo.translate(0, -2.25, 0); 
        return finalGeo;
    }
    return null;
  }

  generateLog(): THREE.BufferGeometry {
      let geo: THREE.BufferGeometry = new THREE.CylinderGeometry(0.25, 0.3, 3, 6);
      geo = geo.toNonIndexed();
      // Already centered around Y axis roughly
      
      const posAttribute = geo.getAttribute('position');
      const vertex = new THREE.Vector3();
      for (let i = 0; i < posAttribute.count; i++) {
          vertex.fromBufferAttribute(posAttribute, i);
          if (Math.abs(vertex.y) < 1.4) {
             vertex.x += (Math.random() - 0.5) * 0.1;
             vertex.z += (Math.random() - 0.5) * 0.1;
          }
          posAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
      }
      
      geo.computeVertexNormals();
      return geo;
  }
}
