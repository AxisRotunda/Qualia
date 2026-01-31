
import { Injectable, inject } from '@angular/core';
import RAPIER from '@dimforge/rapier3d-compat';
import { Subject } from 'rxjs';
import { PhysicsRegistryService } from './physics-registry.service';

export interface CollisionEvent {
  entityA: number;
  entityB: number;
  started: boolean;
}

@Injectable({ providedIn: 'root' })
export class PhysicsWorldService {
  private registry = inject(PhysicsRegistryService);

  world: RAPIER.World | null = null;
  eventQueue: RAPIER.EventQueue | null = null;
  private initialized = false;

  public collision$ = new Subject<CollisionEvent>();

  // Fixed Timestep Logic (60Hz)
  private accumulator = 0;
  private readonly stepSize = 1 / 60; 
  private readonly maxFrameTime = 0.1; 
  
  get rWorld(): RAPIER.World | null {
    return this.world;
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    await RAPIER.init();
    
    this.world = new RAPIER.World({ x: 0.0, y: -9.81, z: 0.0 });
    this.eventQueue = new RAPIER.EventQueue(true);

    // Ground (Physics Plane)
    const groundBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(0.0, -0.1, 0.0);
    const groundBody = this.world.createRigidBody(groundBodyDesc);
    
    const groundColliderDesc = RAPIER.ColliderDesc.cuboid(250, 0.1, 250)
        .setFriction(1.0)
        .setRestitution(0.1);
    this.world.createCollider(groundColliderDesc, groundBody);

    this.initialized = true;
  }

  getAlpha(): number {
      return this.accumulator / this.stepSize;
  }

  step(dtMs: number): void {
    if (!this.world || !this.eventQueue) return;
    
    let dtSec = dtMs / 1000;
    if (dtSec > this.maxFrameTime) {
        dtSec = this.maxFrameTime;
    }

    this.accumulator += dtSec;
    
    let steps = 0;
    const MAX_STEPS = 5;

    while (this.accumulator >= this.stepSize) {
      this.world.step(this.eventQueue);
      this.drainEvents();
      
      this.accumulator -= this.stepSize;
      steps++;
      
      if (steps >= MAX_STEPS) {
          this.accumulator = 0;
          break;
      }
    }
  }

  syncActiveBodies(callback: (entityId: number, pos: RAPIER.Vector, rot: RAPIER.Rotation) => void) {
      if (!this.world) return;
      
      // Buffer updates to avoid "recursive use of an object" error in WASM.
      // Iterating active bodies locks the body list; calling external logic inside 
      // the loop might trigger other Rapier calls (even indirectly), causing a crash.
      const updates: { id: number, p: RAPIER.Vector, q: RAPIER.Rotation }[] = [];

      this.world.forEachActiveRigidBody((body) => {
          const entityId = this.registry.getEntityId(body.handle);
          if (entityId !== undefined) {
              updates.push({ 
                  id: entityId, 
                  p: body.translation(), 
                  q: body.rotation() 
              });
          }
      });

      // Apply updates after lock is released
      for (const u of updates) {
          callback(u.id, u.p, u.q);
      }
  }

  private drainEvents() {
      if (!this.eventQueue || !this.world) return;
      
      const bufferedEvents: CollisionEvent[] = [];
      
      try {
          this.eventQueue.drainCollisionEvents((h1, h2, started) => {
              const e1 = this.registry.getEntityId(h1);
              const e2 = this.registry.getEntityId(h2);
              
              if (e1 !== undefined && e2 !== undefined) {
                  bufferedEvents.push({ entityA: e1, entityB: e2, started });
              }
          });
      } catch (e) {
          console.warn('Failed to drain collision events', e);
      }

      for (const event of bufferedEvents) {
          this.collision$.next(event);
      }
  }

  setGravity(y: number) {
    if (!this.world) return;
    this.world.gravity = { x: 0, y, z: 0 };
    this.world.forEachRigidBody(body => body.wakeUp());
  }

  resetWorld() {
    if (!this.world) return;
    
    const bodies: RAPIER.RigidBody[] = [];
    this.world.forEachRigidBody(body => {
      if (!body.isFixed()) {
        bodies.push(body);
      }
    });
    
    bodies.forEach(b => {
        if(this.world && this.world.bodies.contains(b.handle)) {
            this.world.removeRigidBody(b);
        }
    });
    
    this.registry.clear();
    this.accumulator = 0;
  }

  getBodyPose(handle: number): { p: RAPIER.Vector, q: RAPIER.Rotation } | null {
    if (!this.world) return null;
    if (!this.world.bodies.contains(handle)) return null;
    
    const body = this.world.getRigidBody(handle);
    if (!body) return null;
    return {
      p: body.translation(),
      q: body.rotation()
    };
  }

  updateBodyTransform(handle: number, position: { x: number, y: number, z: number }, rotation?: { x: number, y: number, z: number, w: number }) {
    if (!this.world) return;
    if (!this.world.bodies.contains(handle)) return;

    const body = this.world.getRigidBody(handle);
    if (!body) return;

    body.setTranslation(position, true);
    if (rotation) {
      body.setRotation(rotation, true);
    }
    body.resetForces(true);
    body.resetTorques(true);
    body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    body.setAngvel({ x: 0, y: 0, z: 0 }, true);
  }

  removeBody(handle: number) {
    if (!this.world) return;
    if (!this.world.bodies.contains(handle)) return;

    const body = this.world.getRigidBody(handle);
    if (body) {
      this.world.removeRigidBody(body);
      this.registry.unregister(handle);
    }
  }

  getDebugBuffers(): { vertices: Float32Array, colors: Float32Array } | null {
      if (!this.world) return null;
      try {
        return this.world.debugRender();
      } catch (e) {
        return null;
      }
  }
}
