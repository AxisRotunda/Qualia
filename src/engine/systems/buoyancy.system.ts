
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

  // Optimization: Scratch objects for Rapier impulse/torque
  // Rapier takes {x: number, y: number, z: number}, so we reuse these containers
  private readonly _impulse = { x: 0, y: 0, z: 0 };
  private readonly _torque = { x: 0, y: 0, z: 0 };

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

      // Substep config for stability
      const substeps = 3;
      const dtSub = dt / substeps;

      // Optimization: Iterate ONLY entities marked as 'buoyant'
      this.entityStore.world.buoyant.forEach((isBuoyant, entity) => {
          if (!isBuoyant) return;

          const rbRef = this.entityStore.world.rigidBodies.get(entity);
          if (!rbRef) return;

          const body = world.getRigidBody(rbRef.handle);
          if (!body || body.isFixed() || body.isKinematic()) return;

          // Prediction Loop
          const pos = body.translation();
          const vel = body.linvel();
          let totalBuoyantForceY = 0;
          
          const mass = body.mass();
          const props = this.entityStore.world.physicsProps.get(entity);
          const objectDensity = props?.density || 500;
          const volumeTotal = mass / objectDensity;
          const characteristicLength = Math.pow(volumeTotal, 0.33); // approx height

          // Integrate force over multiple predicted substeps
          for (let i = 0; i < substeps; i++) {
              const tOffset = i * dtSub;
              const predY = pos.y + (vel.y * tOffset);
              const predTime = time + tOffset;

              const waveHeight = this.getWaveHeight(pos.x, pos.z, predTime);
              const currentWaterLevel = baseWaterLevel + waveHeight;

              if (predY < currentWaterLevel) {
                  const depth = currentWaterLevel - predY;
                  // Submerged ratio 0..1
                  const submergedRatio = Math.min(Math.max(depth / characteristicLength, 0), 1.0);
                  const volumeDisplaced = volumeTotal * submergedRatio;
                  
                  // F = rho * V * g
                  const force = fluidDensity * volumeDisplaced * gravity;
                  totalBuoyantForceY += force;
              }
          }

          // Apply average impulse
          const avgForce = totalBuoyantForceY / substeps;
          if (avgForce > 0) {
              const impulse = avgForce * dt;
              
              this._impulse.x = 0;
              this._impulse.y = impulse;
              this._impulse.z = 0;
              body.applyImpulse(this._impulse, true);

              // Hydrodynamic Drag (Simplistic linear drag based on current velocity)
              // Only apply drag if submerged (avgForce > 0 implies at least partially submerged)
              const speedSq = vel.x*vel.x + vel.y*vel.y + vel.z*vel.z;
              if (speedSq > 0.001) {
                  const speed = Math.sqrt(speedSq);
                  const area = Math.pow(volumeTotal, 0.66); 
                  const dragFactor = (linearDrag * speed + quadraticDrag * speedSq) * area * fluidDensity * dt; 
                  
                  this._impulse.x = -vel.x / speed * dragFactor;
                  this._impulse.y = -vel.y / speed * dragFactor;
                  this._impulse.z = -vel.z / speed * dragFactor;
                  
                  body.applyImpulse(this._impulse, true);
              }
              
              // Angular Drag
              const ang = body.angvel();
              const factor = 0.02 * mass * (dt * 60);
              
              this._torque.x = -ang.x * factor;
              this._torque.y = -ang.y * factor;
              this._torque.z = -ang.z * factor;
              
              body.applyTorqueImpulse(this._torque, true);
          }
      });
  }
}
