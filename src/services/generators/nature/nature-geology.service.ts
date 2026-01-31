
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as BufferUtils from 'three/addons/utils/BufferGeometryUtils.js';

@Injectable({
  providedIn: 'root'
})
export class NatureGeologyService {

  generateRock(type: 'granite' | 'sedimentary' = 'granite'): THREE.BufferGeometry {
    // 1. Base Topology: Dodecahedron provides better blocky variation than Icosahedron
    let geo: THREE.BufferGeometry = new THREE.DodecahedronGeometry(1.0, 1); 
    geo = geo.toNonIndexed();
    
    const pos = geo.getAttribute('position');
    const vertex = new THREE.Vector3();
    
    // 2. Base Deformation & Strata
    const strataFreq = 8.0;
    const strataAmp = 0.1;

    for (let i = 0; i < pos.count; i++) {
        vertex.fromBufferAttribute(pos, i);
        
        // General noise for irregularity
        const noise = 1.0 + (Math.random() - 0.5) * 0.2;
        vertex.multiplyScalar(noise);

        // Anisotropy (Flatten slightly)
        vertex.y *= 0.8; 

        // Strata (Sedimentary Layering)
        if (type === 'sedimentary') {
            const layers = Math.sin(vertex.y * strataFreq) * strataAmp;
            vertex.x += layers;
            vertex.z += layers;
        }

        // Surface Grain (High Frequency Noise)
        vertex.x += (Math.random() - 0.5) * 0.05;
        vertex.y += (Math.random() - 0.5) * 0.05;
        vertex.z += (Math.random() - 0.5) * 0.05;

        pos.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    geo.computeVertexNormals();

    // 3. Planar Chiseling (Fracture Simulation)
    // Creates sharp, flat faces typical of hard rock cleavage
    const numPlanes = type === 'sedimentary' ? 3 : 6;
    
    // Optimization: Pre-allocate projection target to avoid N*P allocations
    const projected = new THREE.Vector3();

    for (let p = 0; p < numPlanes; p++) {
        // Random plane definition
        const planeNormal = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
        
        // Bias planes to be more vertical for sedimentary to preserve layers
        if (type === 'sedimentary') {
            planeNormal.y *= 0.2;
            planeNormal.normalize();
        }

        const distFromCenter = 0.5 + Math.random() * 0.4;
        const pointOnPlane = planeNormal.clone().multiplyScalar(distFromCenter);
        const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(planeNormal, pointOnPlane);

        // Flatten vertices 'above' the plane onto the plane
        for (let i = 0; i < pos.count; i++) {
            vertex.fromBufferAttribute(pos, i);
            if (plane.distanceToPoint(vertex) > 0) {
                plane.projectPoint(vertex, projected);
                pos.setXYZ(i, projected.x, projected.y, projected.z);
            }
        }
    }

    // 4. Finalize
    // CRITICAL: Merge vertices to ensure watertight mesh for Physics Convex Hull
    geo = BufferUtils.mergeVertices(geo, 0.001); 
    geo.computeVertexNormals();
    geo.scale(0.8, 0.8, 0.8); // Standardize size to approx 1.5m diameter
    
    return geo;
  }

  generateIceChunk(): THREE.BufferGeometry {
    // Jagged shard logic - Sharp, angular, vertical bias
    const height = 2.5;
    const segments = 5; // Low poly for sharp edges
    let geo: THREE.BufferGeometry = new THREE.ConeGeometry(0.7, height, segments, 1);
    geo = geo.toNonIndexed();
    geo.translate(0, height/2, 0); 
    
    const pos = geo.getAttribute('position');
    const vertex = new THREE.Vector3();
    
    for (let i = 0; i < pos.count; i++) {
        vertex.fromBufferAttribute(pos, i);
        if (vertex.y < 0.1) continue; // Base
        
        // Crystalline Twist
        const angle = vertex.y * 0.4;
        const tx = vertex.x * Math.cos(angle) - vertex.z * Math.sin(angle);
        const tz = vertex.x * Math.sin(angle) + vertex.z * Math.cos(angle);
        
        // Sharp Displacement
        vertex.x = tx + (Math.random()-0.5)*0.4;
        vertex.z = tz + (Math.random()-0.5)*0.4;
        
        // Height variation
        if (vertex.y > height * 0.9) vertex.y += (Math.random()-0.5) * 0.5;

        pos.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    geo.translate(0, -height/2, 0); 
    geo.computeVertexNormals();
    return geo;
  }

  generateIceSpire(): THREE.BufferGeometry {
      // Stacked jagged cylinders for more complex silhouette
      const height = 25;
      const baseRadius = 3;
      const segments = 7;
      
      const geo = new THREE.CylinderGeometry(0.1, baseRadius, height, segments, 8);
      geo.translate(0, height/2, 0);
      geo.toNonIndexed();
      
      const pos = geo.getAttribute('position');
      const v = new THREE.Vector3();
      const center = new THREE.Vector3();
      
      for(let i=0; i<pos.count; i++) {
          v.fromBufferAttribute(pos, i);
          
          // Clamp yFactor to avoid floating point errors > 1.0 causing NaN in Math.pow with negative base
          let yFactor = v.y / height; // 0 at bottom, 1 at top
          yFactor = Math.max(0, Math.min(1, yFactor));
          
          // Taper curve - S-curve taper
          const taper = Math.pow(1.0 - yFactor, 0.8);
          v.x *= taper;
          v.z *= taper;

          // Glacial erosion (Step displacement)
          if (v.y > 0.5) {
              const noise = Math.sin(v.y * 0.8) * 1.5;
              v.x += noise;
              v.z += noise;
              
              // Shear twist
              const angle = v.y * 0.15;
              const tx = v.x * Math.cos(angle) - v.z * Math.sin(angle);
              const tz = v.x * Math.sin(angle) + v.z * Math.cos(angle);
              v.x = tx; 
              v.z = tz;
              
              // Spikes (Radial noise)
              const radialAngle = Math.atan2(v.z, v.x);
              const spike = Math.sin(radialAngle * 3 + v.y * 0.5) * (1.0 - yFactor);
              v.x += Math.cos(radialAngle) * spike;
              v.z += Math.sin(radialAngle) * spike;
          }

          pos.setXYZ(i, v.x, v.y, v.z);
      }
      
      geo.computeVertexNormals();
      return geo;
  }

  generateCinderBlock(): THREE.BufferGeometry | null {
      // Standard CMU: 0.4m W x 0.2m H x 0.2m D
      const w = 0.4;
      const h = 0.2;
      const d = 0.2;
      const thick = 0.04; 

      const parts: THREE.BufferGeometry[] = [];

      // Outer Shell
      const side1 = new THREE.BoxGeometry(w, h, thick);
      side1.translate(0, 0, -d/2 + thick/2);
      parts.push(side1);

      const side2 = new THREE.BoxGeometry(w, h, thick);
      side2.translate(0, 0, d/2 - thick/2);
      parts.push(side2);

      // Webs
      const webEnd1 = new THREE.BoxGeometry(thick, h, d - thick*2);
      webEnd1.translate(-w/2 + thick/2, 0, 0);
      parts.push(webEnd1);

      const webEnd2 = new THREE.BoxGeometry(thick, h, d - thick*2);
      webEnd2.translate(w/2 - thick/2, 0, 0);
      parts.push(webEnd2);

      const webCenter = new THREE.BoxGeometry(thick, h, d - thick*2);
      webCenter.translate(0, 0, 0);
      parts.push(webCenter);

      const merged = BufferUtils.mergeGeometries(parts, false);
      
      // Concrete Noise pass
      if (merged) {
          const pos = merged.getAttribute('position');
          const v = new THREE.Vector3();
          for(let i=0; i<pos.count; i++) {
              v.fromBufferAttribute(pos, i);
              v.x += (Math.random()-0.5) * 0.008;
              v.y += (Math.random()-0.5) * 0.008;
              v.z += (Math.random()-0.5) * 0.008;
              pos.setXYZ(i, v.x, v.y, v.z);
          }
          merged.computeVertexNormals();
      }

      return merged;
  }
}
