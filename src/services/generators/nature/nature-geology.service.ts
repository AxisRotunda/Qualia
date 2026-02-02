
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as BufferUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { Geo } from '../architecture/architecture.utils';

@Injectable({
  providedIn: 'root'
})
export class NatureGeologyService {

  // Deterministic RNG Factory
  private mkRng(seed: number) {
      let s = seed;
      return () => {
          s = (Math.imul(s, 0x41C64E6D) + 12345) & 0x7FFFFFFF;
          return (s >>> 0) / 2147483648.0; // 0..1
      };
  }

  generateGeyserVent(seed: number = 888): THREE.BufferGeometry {
      const nextRnd = this.mkRng(seed);
      const parts: THREE.BufferGeometry[] = [];

      // Base Mound
      const mound = Geo.cone(2.0, 1.0, 8).toNonIndexed().mapVertices(v => {
          v.y *= 0.5; // Flatten
          v.y += (nextRnd()-0.5) * 0.2;
          // Noise radius
          const angle = Math.atan2(v.z, v.x);
          const r = Math.sqrt(v.x*v.x + v.z*v.z);
          const noise = 1.0 + Math.sin(angle * 5) * 0.2;
          v.x *= noise; v.z *= noise;
      }).get();
      parts.push(mound);

      // Central Vent Hole (Inverted Cone subtraction simulated by additive ring)
      // Actually simpler to just not have a hole physically but use material later? 
      // Let's make a ring.
      const rim = Geo.torus(0.5, 0.2, 5, 8).rotateX(Math.PI/2).translate(0, 0.4, 0).toNonIndexed().get();
      parts.push(rim);

      return BufferUtils.mergeGeometries(parts);
  }

  generateRock(type: 'granite' | 'sedimentary' = 'granite', complexity: number = 1.0, seed: number = 12345): THREE.BufferGeometry {
    const nextRnd = this.mkRng(seed);

    // 1. Base Topology
    const detail = complexity > 0.8 ? 1 : 0;
    
    // Create Dodecahedron via Builder
    const builder = Geo.dodecahedron(1.0, detail).toNonIndexed();
    
    // 2. Base Deformation & Strata
    const strataFreq = 8.0;
    const strataAmp = 0.1;

    builder.mapVertices((v) => {
        // General noise for irregularity
        const noise = 1.0 + (nextRnd() - 0.5) * 0.2;
        v.multiplyScalar(noise);

        // Anisotropy (Flatten slightly)
        v.y *= 0.8; 

        // Strata (Sedimentary Layering)
        if (type === 'sedimentary') {
            const layers = Math.sin(v.y * strataFreq) * strataAmp;
            v.x += layers;
            v.z += layers;
        }

        // Surface Grain
        if (complexity > 0.5) {
            v.x += (nextRnd() - 0.5) * 0.05;
            v.y += (nextRnd() - 0.5) * 0.05;
            v.z += (nextRnd() - 0.5) * 0.05;
        }
    }).computeVertexNormals();

    // 3. Planar Chiseling (Fracture Simulation)
    let numPlanes = type === 'sedimentary' ? 3 : 6;
    if (complexity < 0.5) numPlanes = Math.max(1, Math.floor(numPlanes / 2));
    
    const projected = new THREE.Vector3();

    for (let p = 0; p < numPlanes; p++) {
        // Random plane definition
        const planeNormal = new THREE.Vector3(nextRnd()-0.5, nextRnd()-0.5, nextRnd()-0.5).normalize();
        
        // Bias planes for sedimentary
        if (type === 'sedimentary') {
            planeNormal.y *= 0.2;
            planeNormal.normalize();
        }

        const distFromCenter = 0.5 + nextRnd() * 0.4;
        const pointOnPlane = planeNormal.clone().multiplyScalar(distFromCenter);
        const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(planeNormal, pointOnPlane);

        // Flatten vertices 'above' the plane
        builder.mapVertices((v) => {
            if (plane.distanceToPoint(v) > 0) {
                plane.projectPoint(v, projected);
                v.copy(projected);
            }
        });
    }

    // 4. Finalize
    // Merge vertices to ensure watertight mesh for Physics Convex Hull
    builder.mergeVertices(0.001)
           .computeVertexNormals()
           .scale(0.8, 0.8, 0.8);
    
    return builder.get();
  }

  generateIceChunk(complexity: number = 1.0, seed: number = 777): THREE.BufferGeometry {
    const nextRnd = this.mkRng(seed);
    const height = 2.5;
    const segments = complexity > 0.5 ? 5 : 3;
    
    return Geo.cone(0.7, height, segments)
        .toNonIndexed()
        .translate(0, height/2, 0)
        .mapVertices((v) => {
            if (v.y < 0.1) return; // Skip Base
            
            // Crystalline Twist
            const angle = v.y * 0.4;
            const tx = v.x * Math.cos(angle) - v.z * Math.sin(angle);
            const tz = v.x * Math.sin(angle) + v.z * Math.cos(angle);
            
            // Sharp Displacement
            v.x = tx + (nextRnd()-0.5)*0.4;
            v.z = tz + (nextRnd()-0.5)*0.4;
            
            // Height variation
            if (v.y > height * 0.9) v.y += (nextRnd()-0.5) * 0.5;
        })
        .translate(0, -height/2, 0)
        .computeVertexNormals()
        .get();
  }

  generateIceSpire(seed: number = 999): THREE.BufferGeometry {
      const nextRnd = this.mkRng(seed);
      const height = 25;
      const baseRadius = 3;
      const segments = 7;
      
      return Geo.cylinder(0.1, baseRadius, height, segments)
          .translate(0, height/2, 0)
          .toNonIndexed()
          .mapVertices((v) => {
              let yFactor = v.y / height;
              yFactor = Math.max(0, Math.min(1, yFactor));
              
              // Taper curve
              const taper = Math.pow(1.0 - yFactor, 0.8);
              v.x *= taper;
              v.z *= taper;

              // Glacial erosion
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
                  
                  // Spikes
                  const radialAngle = Math.atan2(v.z, v.x);
                  const spike = Math.sin(radialAngle * 3 + v.y * 0.5) * (1.0 - yFactor);
                  v.x += Math.cos(radialAngle) * spike;
                  v.z += Math.sin(radialAngle) * spike;
              }
          })
          .computeVertexNormals()
          .get();
  }

  generateIceBlock(size: number, seed: number = 2045): THREE.BufferGeometry {
      const nextRnd = this.mkRng(seed);
      
      // Use segmented box to allow vertex manipulation
      const segs = 6;
      return Geo.box(size, size, size, segs, segs, segs)
          .toNonIndexed()
          .mapVertices((v) => {
              // 1. Melting/Warping
              // Low frequency noise to make sides uneven
              const warp = 0.05 * size;
              v.x += (nextRnd() - 0.5) * warp;
              v.y += (nextRnd() - 0.5) * warp;
              v.z += (nextRnd() - 0.5) * warp;

              // 2. Beveled Corners (Chipping)
              // If point is near a corner, pull it in
              const absX = Math.abs(v.x);
              const absY = Math.abs(v.y);
              const absZ = Math.abs(v.z);
              
              const limit = size / 2;
              const threshold = limit * 0.8;
              
              // Check if near corner (high on all 3 axes)
              if (absX > threshold && absY > threshold && absZ > threshold) {
                  const chip = (nextRnd() * 0.1 + 0.05) * size;
                  // Pull towards center
                  v.multiplyScalar(1.0 - (chip / size));
              }
          })
          .computeVertexNormals()
          .get();
  }

  generateCinderBlock(seed: number = 42): THREE.BufferGeometry | null {
      const nextRnd = this.mkRng(seed);
      const w = 0.4; const h = 0.2; const d = 0.2; const thick = 0.04; 

      const parts: THREE.BufferGeometry[] = [];

      parts.push(
          Geo.box(w, h, thick).toNonIndexed().translate(0, 0, -d/2 + thick/2).get(), // Back
          Geo.box(w, h, thick).toNonIndexed().translate(0, 0, d/2 - thick/2).get(),  // Front
          Geo.box(thick, h, d - thick*2).toNonIndexed().translate(-w/2 + thick/2, 0, 0).get(), // Left
          Geo.box(thick, h, d - thick*2).toNonIndexed().translate(w/2 - thick/2, 0, 0).get(),  // Right
          Geo.box(thick, h, d - thick*2).toNonIndexed().translate(0, 0, 0).get() // Center Web
      );

      const merged = BufferUtils.mergeGeometries(parts, false);
      
      if (merged) {
          // Wrap merged in Geo to apply noise
          new Geo(merged).mapVertices((v) => {
              v.x += (nextRnd()-0.5) * 0.008;
              v.y += (nextRnd()-0.5) * 0.008;
              v.z += (nextRnd()-0.5) * 0.008;
          }).computeVertexNormals();
      }

      return merged;
  }
}
