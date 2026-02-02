
import { Injectable, inject } from '@angular/core';
import { PhysicsMaterialsService } from '../physics-materials.service';

export interface MassData {
    mass: number;
    friction: number;
    restitution: number;
    volume: number;
    density: number;
}

@Injectable({
  providedIn: 'root'
})
export class MassCalculator {
  private materials = inject(PhysicsMaterialsService);

  resolve(
      geometryType: 'box' | 'sphere' | 'cylinder' | 'cone' | 'convex-hull' | 'trimesh' | 'heightfield' | 'capsule', 
      dims: { w?: number, h?: number, d?: number, r?: number, vertices?: Float32Array }, 
      massOverride?: number, 
      materialType?: string
  ): MassData {
      
      const mat = this.materials.getMaterialData(materialType || 'default');
      let volume = 0;

      // 1. Primitive Volume Calculation
      if (geometryType === 'box') {
          volume = (dims.w || 1) * (dims.h || 1) * (dims.d || 1);
      } else if (geometryType === 'sphere') {
          volume = (4/3) * Math.PI * Math.pow(dims.r || 0.5, 3);
      } else if (geometryType === 'cylinder' || geometryType === 'capsule') {
          volume = Math.PI * Math.pow(dims.r || 0.5, 2) * (dims.h || 1);
      } else if (geometryType === 'cone') {
          volume = (1/3) * Math.PI * Math.pow(dims.r || 0.5, 2) * (dims.h || 1);
      } 
      // 2. Complex Mesh Volume Estimation (AABB Heuristic)
      else if (dims.vertices) {
          let minX = Infinity, minY = Infinity, minZ = Infinity;
          let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
          
          for (let i = 0; i < dims.vertices.length; i += 3) {
              const x = dims.vertices[i];
              const y = dims.vertices[i+1];
              const z = dims.vertices[i+2];
              if (x < minX) minX = x; if (x > maxX) maxX = x;
              if (y < minY) minY = y; if (y > maxY) maxY = y;
              if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
          }

          const w = maxX - minX;
          const h = maxY - minY;
          const d = maxZ - minZ;
          const aabbVol = w * h * d;

          // Fill factor heuristics
          if (geometryType === 'convex-hull') volume = aabbVol * 0.65;
          else if (geometryType === 'trimesh') volume = aabbVol * 0.4; // Usually hollow or thin
          else volume = aabbVol;
      } else {
          // Fallback
          volume = 1.0;
      }

      // Final Mass Calculation
      if (massOverride !== undefined && massOverride !== -1) {
          if (massOverride === 0) return { mass: 0, friction: mat.friction, restitution: mat.restitution, volume, density: 0 };
          const derivedDensity = volume > 0 ? massOverride / volume : mat.density;
          return { mass: massOverride, friction: mat.friction, restitution: mat.restitution, volume, density: derivedDensity };
      }

      const calculatedMass = volume * mat.density;
      return { 
          mass: calculatedMass, 
          friction: mat.friction, 
          restitution: mat.restitution,
          volume,
          density: mat.density
      };
  }
  
  resolveMaterialOnly(materialType?: string) {
      const mat = this.materials.getMaterialData(materialType || 'default');
      return { friction: mat.friction, restitution: mat.restitution, density: mat.density };
  }
}
