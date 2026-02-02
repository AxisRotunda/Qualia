
import { Injectable, inject, OnDestroy } from '@angular/core';
import { GameSystem } from '../system';
import { EntityStoreService } from '../ecs/entity-store.service';
import { PhysicsService } from '../../services/physics.service';
import { FractureService, ImpactContext } from '../features/fracture.service';
import { Entity } from '../schema';
import { EntityLifecycleService } from '../ecs/entity-lifecycle.service';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DestructionSystem implements GameSystem, OnDestroy {
  readonly priority = 205; 

  private store = inject(EntityStoreService);
  private physics = inject(PhysicsService);
  private fracture = inject(FractureService);
  private lifecycle = inject(EntityLifecycleService);

  private lastVelSq = new Float32Array(10000); 
  private destroyedQueue: { e: Entity, ctx?: ImpactContext }[] = [];
  
  private spawnGuard = new Set<Entity>();
  private sub: Subscription;

  constructor() {
      this.sub = this.lifecycle.onEntityDestroyed.subscribe(evt => {
          this.spawnGuard.delete(evt.entity);
          this.lastVelSq[evt.entity] = 0;
      });
      this.sub.add(this.lifecycle.onWorldReset.subscribe(() => {
          this.spawnGuard.clear();
          this.lastVelSq.fill(0);
      }));
  }

  update(dt: number): void {
      const world = this.store.world;
      const rWorld = this.physics.rWorld;
      if (!rWorld) return;

      if (this.lastVelSq.length <= world.entities.size * 2) {
          const newBuff = new Float32Array(this.lastVelSq.length * 2);
          newBuff.set(this.lastVelSq);
          this.lastVelSq = newBuff;
      }

      this.destroyedQueue.length = 0;

      world.integrity.forEach((health, maxHealth, threshold, entity) => {
          const rbHandle = world.rigidBodies.getHandle(entity);
          if (rbHandle === undefined) return;

          const body = rWorld.getRigidBody(rbHandle);
          if (!body || !body.isDynamic()) return;

          const vel = body.linvel();
          const currentVelSq = vel.x*vel.x + vel.y*vel.y + vel.z*vel.z;
          
          if (!this.spawnGuard.has(entity)) {
              this.spawnGuard.add(entity);
              this.lastVelSq[entity] = currentVelSq;
              return;
          }

          const prevVelSq = this.lastVelSq[entity] || 0;
          const deltaV = Math.abs(Math.sqrt(currentVelSq) - Math.sqrt(prevVelSq));
          const impact = deltaV * body.mass();

          if (impact > threshold) {
              const damage = (impact - threshold) * 0.1;
              if (damage > 0) {
                  // Deceleration-based damage (hitting walls) doesn't have a single impact velocity like a bullet
                  world.integrity.applyDamage(entity, damage);
              }
          }

          this.lastVelSq[entity] = currentVelSq;

          if (world.integrity.getHealth(entity) <= 0) {
              const integ = world.integrity.get(entity);
              this.destroyedQueue.push({ 
                  e: entity, 
                  ctx: (integ?.lastImpactVel && (integ.lastImpactVel.x !== 0 || integ.lastImpactVel.z !== 0)) 
                    ? { point: integ.lastImpactPoint!, velocity: integ.lastImpactVel! } 
                    : undefined 
              });
          }
      });

      for(const item of this.destroyedQueue) {
          this.fracture.fracture(item.e, item.ctx);
      }
  }

  ngOnDestroy() {
      this.sub.unsubscribe();
  }
}
