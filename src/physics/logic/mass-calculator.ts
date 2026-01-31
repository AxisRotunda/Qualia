
import { Injectable, inject } from '@angular/core';
import { PhysicsMaterialsService } from '../physics-materials.service';

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
  ): { mass: number, friction: number, restitution: number } {
      
      // 1. If explicit mass is provided (and not 0 for static), use it.
      // 0 mass means static/fixed, so we return 0.
      if (massOverride !== undefined) {
          if (massOverride === 0) return { mass: 0, friction: 0.5, restitution: 0.5 };
          
          // If mass is explicit but we have a material, use material friction/restitution
          if (materialType) {
              const mat = this.materials.getMaterialData(materialType);
              return { mass: massOverride, friction: mat.friction, restitution: mat.restitution };
          }
          return { mass: massOverride, friction: 0.5, restitution: 0.5 };
      }

      // 2. Derive from Material Density
      const mat = this.materials.getMaterialData(materialType || 'default');
      let volume = 0;

      if (geometryType === 'box') {
          volume = (dims.w || 1) * (dims.h || 1) * (dims.d || 1);
      } else if (geometryType === 'sphere') {
          volume = (4/3) * Math.PI * Math.pow(dims.r || 0.5, 3);
      } else if (geometryType === 'cylinder') {
          volume = Math.PI * Math.pow(dims.r || 0.5, 2) * (dims.h || 1);
      } else if (geometryType === 'cone') {
          volume = (1/3) * Math.PI * Math.pow(dims.r || 0.5, 2) * (dims.h || 1);
      }

      const calculatedMass = volume * mat.density;
      return { mass: calculatedMass, friction: mat.friction, restitution: mat.restitution };
  }
  
  resolveMaterialOnly(materialType?: string) {
      const mat = this.materials.getMaterialData(materialType || 'default');
      return { friction: mat.friction, restitution: mat.restitution, density: mat.density };
  }
}
