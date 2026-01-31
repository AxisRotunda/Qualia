
import { Injectable, inject } from '@angular/core';
import { PhysicsService } from '../../services/physics.service';
import { EntityStoreService } from '../ecs/entity-store.service';
import { WATER_CONFIG } from '../../config/water.config';

@Injectable({
  providedIn: 'root'
})
export class BuoyancySystem {
  private physicsService = inject(PhysicsService);
  private entityStore = inject(EntityStoreService);

  // CPU Wave Calculation using Shared Config
  getWaveHeight(x: number, z: number, time: number): number {
      const c = WATER_CONFIG;
      let y = 0.0;
      
      // Wave 1 (Directional Swell)
      const phase1 = (x * c.w1.dirX + z * c.w1.dirZ) * c.w1.freq + time * c.w1.speed;
      y += Math.sin(phase1) * c.w1.amp;

      // Wave 2 (Wind Chop)
      const phase2 = (x * c.w2.dirX + z * c.w2.dirZ) * c.w2.freq + time * c.w2.speed;
      // Peakedness approximation for chop
      const sin2 = Math.sin(phase2);
      y += (sin2 * sin2 * sin2) * c.w2.amp; // Cube it to sharpen

      // Wave 3 (Cross Chop)
      const phase3 = (x * c.w3.dirX + z * c.w3.dirZ) * c.w3.freq + time * c.w3.speed;
      y += Math.cos(phase3) * c.w3.amp;

      return y;
  }

  update(baseWaterLevel: number, time: number, dt: number) {
      const world = this.physicsService.rWorld;
      if (!world) return;
      
      const fluidDensity = 1000.0; // Water density kg/m3
      const gravity = 9.81;
      const linearDrag = 0.05;
      const quadraticDrag = 0.02;

      // Optimization: Iterate ONLY entities marked as 'buoyant'
      this.entityStore.world.buoyant.forEach((isBuoyant, entity) => {
          if (!isBuoyant) return;

          const rbRef = this.entityStore.world.rigidBodies.get(entity);
          if (!rbRef) return;

          const body = world.getRigidBody(rbRef.handle);
          if (!body || body.isFixed() || body.isKinematic()) return;

          const pos = body.translation();
          
          // Calculate realistic water height at this X/Z
          const waveHeight = this.getWaveHeight(pos.x, pos.z, time);
          const currentWaterLevel = baseWaterLevel + waveHeight;

          if (pos.y < currentWaterLevel) {
              const depth = currentWaterLevel - pos.y;
              
              // Get object properties
              const mass = body.mass();
              const props = this.entityStore.world.physicsProps.get(entity);
              const objectDensity = props?.density || 500; // Default to floaty wood/plastic if unknown
              
              // Archimedes Principle: F_buoyancy = rho_fluid * V_displaced * g
              // V_total = mass / objectDensity
              // V_displaced = V_total * submergedRatio
              
              // Approximate submerged ratio based on depth vs approx height (assumed 1.5m characteristic length)
              // Clamped 0..1
              const submergedRatio = Math.min(Math.max(depth / 1.5, 0), 1.0);
              
              const volumeTotal = mass / objectDensity;
              const volumeDisplaced = volumeTotal * submergedRatio;
              
              // Buoyant Force (Upwards)
              // Impulse = Force * dt
              const buoyantForce = fluidDensity * volumeDisplaced * gravity * dt; 
              
              body.applyImpulse({ x: 0, y: buoyantForce, z: 0 }, true);

              // Hydrodynamic Drag
              const vel = body.linvel();
              const speedSq = vel.x*vel.x + vel.y*vel.y + vel.z*vel.z;
              
              if (speedSq > 0.001) {
                  const speed = Math.sqrt(speedSq);
                  
                  // Drag depends on cross-sectional area. A approx V^(2/3)
                  const area = Math.pow(volumeTotal, 0.66); 
                  
                  const dragFactor = (linearDrag * speed + quadraticDrag * speedSq) * area * fluidDensity * dt; 
                  
                  // Drag opposes velocity
                  body.applyImpulse({ 
                      x: -vel.x / speed * dragFactor, 
                      y: -vel.y / speed * dragFactor, 
                      z: -vel.z / speed * dragFactor 
                  }, true);
              }
              
              // Angular Drag
              const ang = body.angvel();
              body.applyTorqueImpulse({
                  x: -ang.x * 0.02 * mass * (dt * 60), // Scale approx to frame rate for consistent damping feel
                  y: -ang.y * 0.02 * mass * (dt * 60),
                  z: -ang.z * 0.02 * mass * (dt * 60)
              }, true);
          }
      });
  }
}
