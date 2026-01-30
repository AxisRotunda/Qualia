
import { Injectable } from '@angular/core';
import RAPIER from '@dimforge/rapier3d-compat';
import { Subject } from 'rxjs';

export interface CollisionEvent {
  entityA: number;
  entityB: number;
  started: boolean;
}

@Injectable({ providedIn: 'root' })
export class PhysicsWorldService {
  world: RAPIER.World | null = null;
  eventQueue: RAPIER.EventQueue | null = null;
  private initialized = false;

  // Collision System
  private handleToEntity = new Map<number, number>();
  public collision$ = new Subject<CollisionEvent>();

  // Fixed Timestep Logic (60Hz)
  private accumulator = 0;
  private readonly stepSize = 1 / 60; 
  private readonly maxFrameTime = 0.1; // Cap to prevent spiral of death

  get rWorld(): RAPIER.World | null {
    return this.world;
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    await RAPIER.init();
    
    // Earth gravity default
    this.world = new RAPIER.World({ x: 0.0, y: -9.81, z: 0.0 });
    this.eventQueue = new RAPIER.EventQueue(true);

    // Ground
    const groundBodyDesc = RAPIER.RigidBodyDesc.fixed();
    const groundBody = this.world.createRigidBody(groundBodyDesc);
    const groundColliderDesc = RAPIER.ColliderDesc.cuboid(100, 0.1, 100)
        .setFriction(1.0)
        .setRestitution(0.1);
    this.world.createCollider(groundColliderDesc, groundBody);

    this.initialized = true;
  }

  registerEntity(handle: number, entityId: number) {
      this.handleToEntity.set(handle, entityId);
  }

  unregisterEntity(handle: number) {
      this.handleToEntity.delete(handle);
  }

  getEntityId(handle: number): number | undefined {
      return this.handleToEntity.get(handle);
  }

  step(dtMs: number): void {
    if (!this.world || !this.eventQueue) return;
    
    // Convert ms to seconds
    const dtSec = dtMs / 1000;
    
    this.accumulator += dtSec;
    
    // Safety cap to prevent spiral of death on lag spikes
    if (this.accumulator > this.maxFrameTime) {
        this.accumulator = this.maxFrameTime;
    }

    // Drain accumulator with fixed steps
    while (this.accumulator >= this.stepSize) {
      this.world.step(this.eventQueue);
      
      // Critical: Wrap callback in try-catch. If an error occurs in a subscriber,
      // it must be caught here to allow Rapier to release its internal locks/borrows.
      this.eventQueue.drainCollisionEvents((h1, h2, started) => {
          try {
            const e1 = this.handleToEntity.get(h1);
            const e2 = this.handleToEntity.get(h2);
            
            if (e1 !== undefined && e2 !== undefined) {
                this.collision$.next({ entityA: e1, entityB: e2, started });
            }
          } catch (err) {
            console.warn('Physics collision error:', err);
          }
      });

      this.accumulator -= this.stepSize;
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
      // Don't remove the original Ground
      if (!body.isFixed()) {
        bodies.push(body);
      }
    });
    
    bodies.forEach(b => this.world!.removeRigidBody(b));
    this.handleToEntity.clear();
    this.accumulator = 0;
  }

  getBodyPose(handle: number): { p: RAPIER.Vector, q: RAPIER.Rotation } | null {
    if (!this.world) return null;
    // Check if body exists to prevent panic
    if (!this.world.getRigidBody(handle)) return null;
    
    const body = this.world.getRigidBody(handle);
    if (!body) return null;
    return {
      p: body.translation(),
      q: body.rotation()
    };
  }

  updateBodyTransform(handle: number, position: { x: number, y: number, z: number }, rotation?: { x: number, y: number, z: number, w: number }) {
    if (!this.world) return;
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
    
    const body = this.world.getRigidBody(handle);
    if (body) {
      this.world.removeRigidBody(body);
      this.unregisterEntity(handle);
    }
  }

  getDebugBuffers(): { vertices: Float32Array, colors: Float32Array } | null {
      if (!this.world) return null;
      try {
        return this.world.debugRender();
      } catch (e) {
        console.warn('Debug render failed', e);
        return null;
      }
  }
}
