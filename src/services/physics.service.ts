
import { Injectable, signal } from '@angular/core';
import RAPIER from '@dimforge/rapier3d-compat';

export interface BodyData {
  handle: number;
  type: 'box' | 'sphere';
  position: { x: number, y: number, z: number };
  rotation: { x: number, y: number, z: number, w: number };
  size?: { w: number, h: number, d: number }; // for box
  radius?: number; // for sphere
  color: number;
}

@Injectable({
  providedIn: 'root'
})
export class PhysicsService {
  private world: RAPIER.World | null = null;
  private initialized = false;

  // Use a simple map to track active bodies for debugging/counting
  private activeHandles = new Set<number>();

  async init(): Promise<void> {
    if (this.initialized) return;

    // Initialize the WASM module
    await RAPIER.init();
    
    // Create World with Earth gravity
    const gravity = { x: 0.0, y: -9.81, z: 0.0 };
    this.world = new RAPIER.World(gravity);

    // Create Ground
    const groundBodyDesc = RAPIER.RigidBodyDesc.fixed();
    const groundBody = this.world.createRigidBody(groundBodyDesc);
    const groundColliderDesc = RAPIER.ColliderDesc.cuboid(50, 0.1, 50);
    this.world.createCollider(groundColliderDesc, groundBody);

    this.initialized = true;
  }

  step(): void {
    if (!this.world) return;
    this.world.step();
  }

  setGravity(y: number) {
    if (!this.world) return;
    this.world.gravity = { x: 0, y: y, z: 0 };
  }

  reset() {
    if (!this.world) return;
    
    // Remove all bodies except ground (assuming ground is handle 0 or 1 usually, but safe way is to track dynamic ones)
    // For simplicity in this demo, we will recreate the world or remove explicitly tracked bodies.
    this.activeHandles.forEach(handle => {
        try {
            const body = this.world!.getRigidBody(handle);
            if (body) this.world!.removeRigidBody(body);
        } catch (e) {
            console.warn("Failed to remove body", handle);
        }
    });
    this.activeHandles.clear();
  }

  createBox(x: number, y: number, z: number, color: number): BodyData {
    if (!this.world) throw new Error('Physics not initialized');

    const size = 0.5 + Math.random() * 0.5; // Random size 0.5 to 1.0
    
    const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(x, y, z);
    const rigidBody = this.world.createRigidBody(rigidBodyDesc);
    
    const colliderDesc = RAPIER.ColliderDesc.cuboid(size / 2, size / 2, size / 2)
        .setRestitution(0.7); // Bouncy
    this.world.createCollider(colliderDesc, rigidBody);

    this.activeHandles.add(rigidBody.handle);

    return {
      handle: rigidBody.handle,
      type: 'box',
      position: { x, y, z },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      size: { w: size, h: size, d: size },
      color
    };
  }

  createSphere(x: number, y: number, z: number, color: number): BodyData {
    if (!this.world) throw new Error('Physics not initialized');

    const radius = 0.3 + Math.random() * 0.4;

    const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(x, y, z);
    const rigidBody = this.world.createRigidBody(rigidBodyDesc);

    const colliderDesc = RAPIER.ColliderDesc.ball(radius)
        .setRestitution(0.8); // Very bouncy
    this.world.createCollider(colliderDesc, rigidBody);

    this.activeHandles.add(rigidBody.handle);

    return {
      handle: rigidBody.handle,
      type: 'sphere',
      position: { x, y, z },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      radius,
      color
    };
  }

  getActiveBodyCount(): number {
    return this.activeHandles.size;
  }

  // Efficiently retrieve positions for all dynamic bodies
  // We return a generator or simply let the SceneService query via getBody
  // For performance, we'll return a raw sync function pattern in a real app, 
  // but here we will expose a method to get transforms by handle.
  getTransform(handle: number): { p: {x:number, y:number, z:number}, q: {x:number, y:number, z:number, w:number} } | null {
    if (!this.world) return null;
    const body = this.world.getRigidBody(handle);
    if (!body) return null;
    return {
      p: body.translation(),
      q: body.rotation()
    };
  }
}
