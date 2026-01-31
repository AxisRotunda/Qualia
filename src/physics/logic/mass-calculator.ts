
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
      geometryType: 'box' | 'sphere' | 'cylinder' | 'cone', 
      dims: { w?: number, h?: number, d?: number, r?: number }, 
      massOverride?: number, 
      materialType?: string
  ): MassData {
      
      const mat = this.materials.getMaterialData(materialType || 'default');
      let volume = 0;

      // Calculate Volume
      if (geometryType === 'box') {
          volume = (dims.w || 1) * (dims.h || 1) * (dims.d || 1);
      } else if (geometryType === 'sphere') {
          volume = (4/3) * Math.PI * Math.pow(dims.r || 0.5, 3);
      } else if (geometryType === 'cylinder') {
          volume = Math.PI * Math.pow(dims.r || 0.5, 2) * (dims.h || 1);
      } else if (geometryType === 'cone') {
          volume = (1/3) * Math.PI * Math.pow(dims.r || 0.5, 2) * (dims.h || 1);
      }

      // 1. Explicit Mass Override
      if (massOverride !== undefined) {
          if (massOverride === 0) return { mass: 0, friction: 0.5, restitution: 0.5, volume, density: 0 };
          
          // Reverse calculate density if explicit mass given
          const derivedDensity = volume > 0 ? massOverride / volume : mat.density;
          
          if (materialType) {
              return { mass: massOverride, friction: mat.friction, restitution: mat.restitution, volume, density: derivedDensity };
          }
          return { mass: massOverride, friction: 0.5, restitution: 0.5, volume, density: derivedDensity };
      }

      // 2. Derive from Material Density
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
