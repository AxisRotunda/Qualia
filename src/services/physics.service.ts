
import { Injectable } from '@angular/core';
import RAPIER from '@dimforge/rapier3d-compat';

export interface PhysicsBodyDef {
  handle: number;
  type: 'box' | 'sphere';
  position: { x: number, y: number, z: number };
  rotation: { x: number, y: number, z: number, w: number };
  // Original dimensions before scaling
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
    bodies.forEach(b => this.world!.removeRigidBody(b));
  }

  createBox(x: number, y: number, z: number): PhysicsBodyDef {
    if (!this.world) throw new Error('Physics not initialized');

    const size = 0.5 + Math.random() * 0.5;
    
    const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(x, y, z);
    const rigidBody = this.world.createRigidBody(rigidBodyDesc);
    
    const colliderDesc = RAPIER.ColliderDesc.cuboid(size / 2, size / 2, size / 2)
        .setRestitution(0.7)
        .setFriction(0.5);
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
        .setRestitution(0.8)
        .setFriction(0.5);
    this.world.createCollider(colliderDesc, rigidBody);

    return {
      handle: rigidBody.handle,
      type: 'sphere',
      position: { x, y, z },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      radius
    };
  }

  getBodyPose(handle: number): { p: RAPIER.Vector, q: RAPIER.Rotation } | null {
    if (!this.world) return null;
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

  updateBodyMaterial(handle: number, props: { friction: number, restitution: number }) {
    if (!this.world) return;
    const body = this.world.getRigidBody(handle);
    if (!body) return;

    // Iterate colliders (usually 1)
    for (let i = 0; i < body.numColliders(); i++) {
        const collider = body.collider(i);
        collider.setFriction(props.friction);
        collider.setRestitution(props.restitution);
    }
  }

  updateBodyScale(handle: number, def: PhysicsBodyDef, scale: { x: number, y: number, z: number }) {
    if (!this.world) return;
    const body = this.world.getRigidBody(handle);
    if (!body) return;

    // Rapier doesn't support scaling existing colliders easily, we recreate the collider
    // Remove existing colliders
    const n = body.numColliders();
    const collidersToRemove: RAPIER.Collider[] = [];
    for(let i=0; i<n; i++) collidersToRemove.push(body.collider(i));
    collidersToRemove.forEach(c => this.world!.removeCollider(c, false));

    // Create new collider with scaled dimensions
    let colliderDesc: RAPIER.ColliderDesc;

    if (def.type === 'box' && def.size) {
        // Box extent is half-size
        const hx = (def.size.w / 2) * scale.x;
        const hy = (def.size.h / 2) * scale.y;
        const hz = (def.size.d / 2) * scale.z;
        colliderDesc = RAPIER.ColliderDesc.cuboid(Math.abs(hx), Math.abs(hy), Math.abs(hz));
    } else if (def.type === 'sphere' && def.radius) {
        // Uniform scale approximation for sphere
        const s = Math.max(scale.x, Math.max(scale.y, scale.z));
        colliderDesc = RAPIER.ColliderDesc.ball(def.radius * s);
    } else {
        return; // Unknown
    }

    // Retain material props? We should probably pass them in, but for now defaults
    // In a real app we'd read them from the old collider before destroying
    colliderDesc.setRestitution(0.7).setFriction(0.5);

    this.world.createCollider(colliderDesc, body);
  }

  removeBody(handle: number) {
    if (!this.world) return;
    if (this.world.getRigidBody(handle)) {
      this.world.removeRigidBody(this.world.getRigidBody(handle)!);
    }
  }
}
