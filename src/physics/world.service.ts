
import { Injectable, inject } from '@angular/core';
import RAPIER from '@dimforge/rapier3d-compat';
import { Subject } from 'rxjs';
import { PhysicsRegistryService } from './physics-registry.service';
import { PhysicsStepService } from './physics-step.service';
import { CollisionEvent } from '../engine/events/game-events';

export type { CollisionEvent } from '../engine/events/game-events';

@Injectable({ providedIn: 'root' })
export class PhysicsWorldService {
  private registry = inject(PhysicsRegistryService);
  private stepper = inject(PhysicsStepService);

  world: RAPIER.World | null = null;
  eventQueue: RAPIER.EventQueue | null = null;
  private initialized = false;
  
  // Cache gravity to restore it after world recreation
  private currentGravity = { x: 0.0, y: -9.81, z: 0.0 };

  public collision$ = new Subject<CollisionEvent>();
  
  // RUN_REPAIR: Buffer collisions to avoid recursive borrow of Rapier World
  private collisionBuffer: CollisionEvent[] = [];

  get rWorld(): RAPIER.World | null {
    return this.world;
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    await RAPIER.init();
    
    this.createWorld();
    this.initialized = true;
  }

  private createWorld() {
      // Create fresh world instance with current settings
      this.world = new RAPIER.World(this.currentGravity);
      this.eventQueue = new RAPIER.EventQueue(true);
  }

  step(dtMs: number): void {
    if (!this.world || !this.eventQueue) return;
    
    // Clear buffer for this frame
    this.collisionBuffer.length = 0;

    // Delegate the accumulator logic
    this.stepper.step(this.world, this.eventQueue, dtMs, () => {
        this.collectEvents();
    });

    // Dispatch buffered events AFTER all steps are done and world is unlocked
    if (this.collisionBuffer.length > 0) {
        for (let i = 0; i < this.collisionBuffer.length; i++) {
            this.collision$.next(this.collisionBuffer[i]);
        }
    }
  }

  /**
   * Optimized Sync Loop (Zero-Allocation)
   * Passes raw scalars instead of objects to prevent GC pressure during high-frequency loops.
   */
  syncActiveBodies(callback: (entityId: number, x: number, y: number, z: number, qx: number, qy: number, qz: number, qw: number) => void) {
      if (!this.world) return;
      
      this.world.forEachActiveRigidBody((body) => {
          const entityId = this.registry.getEntityId(body.handle);
          if (entityId !== undefined) {
              const t = body.translation();
              const r = body.rotation();
              callback(entityId, t.x, t.y, t.z, r.x, r.y, r.z, r.w);
          }
      });
  }

  private collectEvents() {
      if (!this.eventQueue || !this.world) return;
      
      try {
          this.eventQueue.drainCollisionEvents((h1, h2, started) => {
              const e1 = this.registry.getEntityId(h1);
              const e2 = this.registry.getEntityId(h2);
              
              if (e1 !== undefined && e2 !== undefined) {
                  this.collisionBuffer.push({ entityA: e1, entityB: e2, started });
              }
          });
      } catch (e) {
          console.warn('Failed to drain collision events', e);
      }
  }

  setGravity(y: number) {
    this.currentGravity.y = y;
    if (this.world) {
        this.world.gravity = this.currentGravity;
        this.world.forEachRigidBody(body => body.wakeUp());
    }
  }

  /**
   * Hard Reset of Physics Simulation.
   * Completely destroys and recreates the Rapier World to ensure zero memory leaks
   * and clean state for new scenes. O(1) JS overhead.
   */
  resetWorld() {
    if (this.world) {
        this.world.free();
        this.world = null;
    }
    
    if (this.eventQueue) {
        // EventQueue doesn't always have a free(), but dropping ref is usually enough in JS-side wrappers
        // calling clear just in case logic persists
        this.eventQueue.clear(); 
        this.eventQueue = null;
    }
    
    this.registry.clear();
    this.stepper.reset();
    
    // Recreate
    this.createWorld();
  }

  getBodyPose(handle: number): { p: RAPIER.Vector, q: RAPIER.Rotation } | null {
    if (!this.world) return null;
    // Guard against stale handles after reset
    if (!this.world.bodies.contains(handle)) return null;
    
    const body = this.world.getRigidBody(handle);
    if (!body) return null;
    return {
      p: body.translation(),
      q: body.rotation()
    };
  }

  /**
   * Optimized: Zero-alloc copy to target object.
   * Returns false if body handle is invalid.
   */
  copyBodyPosition(handle: number, outPos: { x: number, y: number, z: number }): boolean {
    if (!this.world) return false;
    if (!this.world.bodies.contains(handle)) return false;

    const body = this.world.getRigidBody(handle);
    if (!body) return false;
    const t = body.translation();
    outPos.x = t.x; outPos.y = t.y; outPos.z = t.z;
    return true;
  }

  copyBodyLinVel(handle: number, outVel: { x: number, y: number, z: number }): boolean {
    if (!this.world) return false;
    if (!this.world.bodies.contains(handle)) return false;

    const body = this.world.getRigidBody(handle);
    if (!body) return false;
    const v = body.linvel();
    outVel.x = v.x; outVel.y = v.y; outVel.z = v.z;
    return true;
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

  /**
   * Updates only rotation without affecting linear velocity.
   * Crucial for hybrid manipulation (Slide + Rotate).
   */
  setBodyRotation(handle: number, rotation: { x: number, y: number, z: number, w: number }) {
      if (!this.world) return;
      if (!this.world.bodies.contains(handle)) return;

      const body = this.world.getRigidBody(handle);
      if (!body) return;

      body.setRotation(rotation, true);
      body.setAngvel({ x: 0, y: 0, z: 0 }, true);
      // NOTE: Do NOT reset linear velocity here, or the object will stop sliding/lifting
  }

  setNextKinematicTranslation(handle: number, position: { x: number, y: number, z: number }, rotation?: { x: number, y: number, z: number, w: number }) {
      if (!this.world) return;
      if (!this.world.bodies.contains(handle)) return;

      const body = this.world.getRigidBody(handle);
      if (!body) return;

      body.setNextKinematicTranslation(position);
      if (rotation) {
          body.setNextKinematicRotation(rotation);
      }
  }

  removeBody(handle: number) {
    if (!this.world) return;
    if (this.world.bodies.contains(handle)) {
        const body = this.world.getRigidBody(handle);
        if (body) {
            this.world.removeRigidBody(body);
        }
    }
    this.registry.unregister(handle);
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
