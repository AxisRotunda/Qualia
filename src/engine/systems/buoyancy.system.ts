
import { Injectable, inject } from '@angular/core';
import { PhysicsService } from '../../services/physics.service';

@Injectable({
  providedIn: 'root'
})
export class BuoyancySystem {
  private physicsService = inject(PhysicsService);

  // CPU Wave Calculation (Must match GLSL in MaterialService exactly)
  getWaveHeight(x: number, z: number, time: number): number {
      let y = 0.0;
      // Wave 1 (Large Swell)
      y += Math.sin(x * 0.05 + time * 0.5) * Math.sin(z * 0.04 + time * 0.6) * 1.0;
      // Wave 2 (Medium Chop)
      y += Math.sin(x * 0.2 + time * 1.2) * 0.25;
      // Wave 3 (Cross Chop)
      y += Math.cos(z * 0.15 + time * 1.1) * 0.25;
      return y;
  }

  update(baseWaterLevel: number, time: number) {
      const world = this.physicsService.rWorld;
      if (!world) return;
      
      world.forEachRigidBody(body => {
          if (body.isFixed() || body.isKinematic()) return;

          const pos = body.translation();
          
          // Calculate realistic water height at this X/Z
          const waveHeight = this.getWaveHeight(pos.x, pos.z, time);
          const currentWaterLevel = baseWaterLevel + waveHeight;

          // Simple Buoyancy Model
          if (pos.y < currentWaterLevel) {
              const depth = currentWaterLevel - pos.y;
              
              // Archimedes approx: Upward force increases with depth
              // Cap depth effect so objects don't rocket out
              const forceY = (Math.min(depth, 2.0) * body.mass() * 15.0); 
              
              // Apply Force
              body.applyImpulse({ x: 0, y: forceY * 0.016, z: 0 }, true);

              // Apply Drag (Water resistance)
              const vel = body.linvel();
              const dragCoeff = 0.05;
              body.applyImpulse({ 
                  x: -vel.x * dragCoeff * body.mass(), 
                  y: -vel.y * dragCoeff * body.mass(), 
                  z: -vel.z * dragCoeff * body.mass() 
              }, true);
              
              // Angular Drag
              const ang = body.angvel();
              body.applyTorqueImpulse({
                  x: -ang.x * 0.05,
                  y: -ang.y * 0.05,
                  z: -ang.z * 0.05
              }, true);
          }
      });
  }
}
