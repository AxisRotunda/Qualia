
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as BufferUtils from 'three/addons/utils/BufferGeometryUtils.js';

@Injectable({
  providedIn: 'root'
})
export class NatureFloraService {
  
  // Recursive Tree Generation with Organic Noise & Complexity Scalar
  generateTree(complexity: number = 1.0): THREE.BufferGeometry | null {
    const branches: THREE.BufferGeometry[] = [];
    const foliage: THREE.BufferGeometry[] = [];

    // Configuration derived from Complexity
    // High complexity = 3 recursion depth, Low = 2
    const maxDepth = complexity > 0.8 ? 3 : 2;
    const trunkRadius = 0.3;
    const trunkLength = 1.8;
    
    // Recursive Branch Function
    const addBranch = (
        startPos: THREE.Vector3, 
        direction: THREE.Vector3, 
        length: number, 
        radius: number, 
        depth: number
    ) => {
        // LOD for segments: High complexity = 8, Low = 5
        const radialSegs = complexity > 0.5 ? 8 : 5;
        
        let geo: THREE.BufferGeometry = new THREE.CylinderGeometry(radius * 0.7, radius, length, radialSegs, 1);
        geo = geo.toNonIndexed(); 
        
        // Pivot to Base
        geo.translate(0, length / 2, 0);
        
        // Apply Organic Noise (Only at high complexity)
        if (complexity > 0.5) {
            const pos = geo.getAttribute('position');
            const v = new THREE.Vector3();
            for(let i=0; i<pos.count; i++) {
                v.fromBufferAttribute(pos, i);
                
                // Skip the very bottom vertices to keep connection clean
                if (v.y > 0.1) {
                    const barkNoise = Math.sin(v.y * 12) * Math.cos(v.x * 12) * 0.03;
                    const swell = Math.sin(v.y * 2) * 0.05;
                    v.x += barkNoise + swell;
                    v.z += barkNoise + swell;
                    v.x += (Math.random()-0.5) * radius * 0.1;
                    v.z += (Math.random()-0.5) * radius * 0.1;
                }
                pos.setXYZ(i, v.x, v.y, v.z);
            }
            geo.computeVertexNormals();
        }

        // Align to direction
        const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
        geo.applyQuaternion(quat);
        geo.translate(startPos.x, startPos.y, startPos.z);
        
        branches.push(geo);

        // Calculate end position for next branches
        const endPos = startPos.clone().add(direction.clone().multiplyScalar(length));

        // Leaf clusters at terminals or high depth
        if (depth >= maxDepth - 1) {
            // Low poly foliage for low complexity
            let leafGeo: THREE.BufferGeometry;
            if (complexity > 0.5) {
                leafGeo = new THREE.DodecahedronGeometry(0.6 + Math.random() * 0.4, 0);
            } else {
                leafGeo = new THREE.BoxGeometry(1, 0.5, 1); // Cheaper box for distance
            }
            leafGeo = leafGeo.toNonIndexed();
            leafGeo.scale(1.2, 0.6, 1.2);
            leafGeo.translate(endPos.x, endPos.y, endPos.z);
            leafGeo.rotateY(Math.random() * Math.PI);
            foliage.push(leafGeo);
        }

        // Recursion
        if (depth < maxDepth) {
            // Branch count reduced at low complexity
            const minB = complexity > 0.5 ? 2 : 1;
            const maxB = complexity > 0.5 ? 2 : 1;
            const numBranches = minB + Math.floor(Math.random() * maxB); 
            
            for (let i = 0; i < numBranches; i++) {
                const angleX = (Math.random() - 0.5) * 1.5; 
                const angleZ = (Math.random() - 0.5) * 1.5;
                
                const nextDir = direction.clone().applyEuler(new THREE.Euler(angleX, Math.random() * Math.PI * 2, angleZ));
                nextDir.normalize();
                nextDir.y += 0.5; // Upward bias
                nextDir.normalize();

                const nextLength = length * 0.7;
                const nextRadius = radius * 0.7;
                
                addBranch(endPos, nextDir, nextLength, nextRadius, depth + 1);
            }
        }
    };

    // Start Generation
    addBranch(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), trunkLength, trunkRadius, 0);

    // Merge Mesh Groups
    const woodGeo = branches.length > 0 ? BufferUtils.mergeGeometries(branches) : null;
    const leafGeo = foliage.length > 0 ? BufferUtils.mergeGeometries(foliage) : null;

    if (!woodGeo || !leafGeo) return null;

    const woodCount = woodGeo.getAttribute('position').count;
    const leafCount = leafGeo.getAttribute('position').count;

    const finalGeo = BufferUtils.mergeGeometries([woodGeo, leafGeo], false);
    
    if (finalGeo) {
        finalGeo.clearGroups();
        finalGeo.addGroup(0, woodCount, 0); // Material 0: Bark
        finalGeo.addGroup(woodCount, leafCount, 1); // Material 1: Leaf
        
        finalGeo.computeBoundingBox();
        const center = new THREE.Vector3();
        finalGeo.boundingBox?.getCenter(center);
        
        // Align Geometry Center to (0,0,0) to match Physics Center of Mass
        finalGeo.translate(-center.x, -center.y, -center.z);
        
        return finalGeo;
    }
    return null;
  }

  generateLog(): THREE.BufferGeometry {
      let geo: THREE.BufferGeometry = new THREE.CylinderGeometry(0.25, 0.3, 3, 10);
      geo = geo.toNonIndexed();
      
      const posAttribute = geo.getAttribute('position');
      const vertex = new THREE.Vector3();
      
      for (let i = 0; i < posAttribute.count; i++) {
          vertex.fromBufferAttribute(posAttribute, i);
          
          // Noise Displacement for rough bark look
          const noise = Math.sin(vertex.y * 10) * 0.02 + Math.cos(vertex.x * 20) * 0.01;
          
          if (Math.abs(vertex.y) < 1.4) {
             vertex.x += noise;
             vertex.z += noise;
          }
          posAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
      }
      
      geo.computeVertexNormals();
      return geo;
  }

  generatePalmTree(complexity: number = 1.0): THREE.BufferGeometry | null {
      const trunkParts: THREE.BufferGeometry[] = [];
      const leafParts: THREE.BufferGeometry[] = [];

      // Scale detail based on complexity
      const segments = Math.max(3, Math.floor(8 * complexity));
      const frondCount = Math.max(5, Math.floor(12 * complexity));
      const frondDetail = complexity > 0.5 ? 5 : 2;

      const totalH = 6;
      const segH = totalH / segments;
      const baseR = 0.4;
      const topR = 0.25;
      
      // Curve Function
      const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0.5, totalH * 0.3, 0),
          new THREE.Vector3(1.5, totalH * 0.7, 0),
          new THREE.Vector3(2.5, totalH, 0)
      ]);

      const points = curve.getPoints(segments);
      const frames = curve.computeFrenetFrames(segments, false);

      for(let i=0; i<segments; i++) {
          const r1 = baseR - ((baseR - topR) * (i/segments));
          const r2 = baseR - ((baseR - topR) * ((i+1)/segments));
          
          const seg = new THREE.CylinderGeometry(r2, r1, segH, 7, 1);
          seg.toNonIndexed();
          
          // Align segment to curve tangent
          const p1 = points[i];
          const p2 = points[i+1];
          const mid = p1.clone().add(p2).multiplyScalar(0.5);
          const tangent = frames.tangents[i];
          
          const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), tangent);
          seg.applyQuaternion(quat);
          seg.translate(mid.x, mid.y, mid.z);
          
          // Roughness
          const pos = seg.getAttribute('position');
          const v = new THREE.Vector3();
          for(let k=0; k<pos.count; k++) {
              v.fromBufferAttribute(pos, k);
              // Rough bark
              v.x += (Math.random()-0.5)*0.05;
              v.z += (Math.random()-0.5)*0.05;
              pos.setXYZ(k, v.x, v.y, v.z);
          }
          seg.computeVertexNormals();
          
          trunkParts.push(seg);
      }

      // 2. Fronds
      const topPos = points[segments];
      
      for(let i=0; i<frondCount; i++) {
          const frondLen = 2.5 + Math.random();
          // Plane bent into arch
          const frond = new THREE.PlaneGeometry(0.6, frondLen, 3, frondDetail);
          frond.toNonIndexed();
          
          const pos = frond.getAttribute('position');
          const v = new THREE.Vector3();
          
          for(let k=0; k<pos.count; k++) {
              v.fromBufferAttribute(pos, k);
              // Bend down along Y based on Y (length)
              const bend = Math.pow((v.y + frondLen/2) / frondLen, 2) * 2.0; 
              v.z += bend; // Bend 'back'
              
              // Taper width at tip
              const widthFactor = 1.0 - Math.pow((v.y + frondLen/2)/frondLen, 2);
              v.x *= widthFactor;
              
              pos.setXYZ(k, v.x, v.y, v.z);
          }
          frond.computeVertexNormals();
          
          // Orient
          frond.rotateX(-Math.PI/2); // Lie flat
          frond.translate(0, 0, frondLen/2); // Pivot at start
          frond.rotateX(-Math.PI/6); // Angle up slightly
          
          // Rotate around trunk
          const angle = (i / frondCount) * Math.PI * 2 + (Math.random()*0.5);
          frond.rotateY(angle);
          frond.translate(topPos.x, topPos.y, topPos.z);
          
          leafParts.push(frond);
      }

      const mergedTrunk = BufferUtils.mergeGeometries(trunkParts);
      const mergedLeaves = BufferUtils.mergeGeometries(leafParts);
      
      if (!mergedTrunk || !mergedLeaves) return null;
      
      const trunkCount = mergedTrunk.getAttribute('position').count;
      const leafCount = mergedLeaves.getAttribute('position').count;
      
      const final = BufferUtils.mergeGeometries([mergedTrunk, mergedLeaves], false);
      if (final) {
          final.clearGroups();
          final.addGroup(0, trunkCount, 0); // Bark
          final.addGroup(trunkCount, leafCount, 1); // Leaf
          
          // Center at base
          final.translate(-points[0].x, -points[0].y, -points[0].z);
      }
      return final;
  }
}
