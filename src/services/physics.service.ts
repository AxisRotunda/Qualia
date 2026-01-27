
import { Injectable } from '@angular/core';
import RAPIER from '@dimforge/rapier3d-compat';

export interface PhysicsBodyDef {
  handle: number;
  type: 'box' | 'sphere';
  position: { x: number, y: number, z: number };
  rotation: { x: number, y: number, z: number, w: number };
  size?: { w: number, h: number, d: number };
  radius?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PhysicsService {
  private world: RAPIER.World | null = null;
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    await RAPIER.init();
    
    // Earth gravity
    const gravity = { x: 0.0, y: -9.81, z: 0.0 };
    this.world = new RAPIER.World(gravity);

    // Ground
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

  resetWorld() {
    if (!this.world) return;
    // Rapier specific cleanup could go here, 
    // but for this demo we rely on creating a new world or manual cleanup by caller.
    // To be safe and fast:
    const bodies: RAPIER.RigidBody[] = [];
    this.world.forEachRigidBody(body => {
      if (!body.isFixed()) {
        bodies.push(body);
      }
    });
    bodies.forEach(b => this.world!.removeRigidBody(b));
  }

  createBox(x: number, y: number, z: number): PhysicsBodyDef {
    if (!this.world) throw new Error('Physics not initialized');

    const size = 0.5 + Math.random() * 0.5;
    
    const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(x, y, z);
    const rigidBody = this.world.createRigidBody(rigidBodyDesc);
    
    const colliderDesc = RAPIER.ColliderDesc.cuboid(size / 2, size / 2, size / 2)
        .setRestitution(0.7);
    this.world.createCollider(colliderDesc, rigidBody);

    return {
      handle: rigidBody.handle,
      type: 'box',
      position: { x, y, z },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      size: { w: size, h: size, d: size }
    };
  }

  createSphere(x: number, y: number, z: number): PhysicsBodyDef {
    if (!this.world) throw new Error('Physics not initialized');

    const radius = 0.3 + Math.random() * 0.4;

    const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(x, y, z);
    const rigidBody = this.world.createRigidBody(rigidBodyDesc);

    const colliderDesc = RAPIER.ColliderDesc.ball(radius)
        .setRestitution(0.8);
    this.world.createCollider(colliderDesc, rigidBody);

    return {
      handle: rigidBody.handle,
      type: 'sphere',
      position: { x, y, z },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      radius
    };
  }

  // Purely for retrieving data by handle during sync
  getBodyPose(handle: number): { p: RAPIER.Vector, q: RAPIER.Rotation } | null {
    if (!this.world) return null;
    const body = this.world.getRigidBody(handle);
    if (!body) return null;
    return {
      p: body.translation(),
      q: body.rotation()
    };
  }

  removeBody(handle: number) {
    if (!this.world) return;
    const body = this.world.getRigidBody(handle);
    if (body) {
      this.world.removeRigidBody(body);
    }
  }
}
