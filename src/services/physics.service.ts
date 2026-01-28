
import { Injectable } from '@angular/core';
import RAPIER from '@dimforge/rapier3d-compat';

export interface PhysicsBodyDef {
  handle: number;
  type: 'box' | 'sphere' | 'cylinder' | 'capsule';
  position: { x: number, y: number, z: number };
  rotation: { x: number, y: number, z: number, w: number };
  // Dimensions (Full Size)
  size?: { w: number, h: number, d: number };
  radius?: number;
  height?: number; // for cylinder/capsule
  mass?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PhysicsService {
  private world: RAPIER.World | null = null;
  private initialized = false;

  get rWorld(): RAPIER.World | null {
      return this.world;
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    await RAPIER.init();
    
    // Earth gravity
    const gravity = { x: 0.0, y: -9.81, z: 0.0 };
    this.world = new RAPIER.World(gravity);

    // Ground
    const groundBodyDesc = RAPIER.RigidBodyDesc.fixed();
    const groundBody = this.world.createRigidBody(groundBodyDesc);
    // Ground collider: 200x200 plane roughly (100 half-extent)
    const groundColliderDesc = RAPIER.ColliderDesc.cuboid(100, 0.1, 100);
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

  // --- Standard Physics Methods ---

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

    const n = body.numColliders();
    const collidersToRemove: RAPIER.Collider[] = [];
    for(let i=0; i<n; i++) collidersToRemove.push(body.collider(i));
    collidersToRemove.forEach(c => this.world!.removeCollider(c, false));

    let colliderDesc: RAPIER.ColliderDesc | null = null;

    if (def.type === 'box' && def.size) {
        const hx = (def.size.w / 2) * scale.x;
        const hy = (def.size.h / 2) * scale.y;
        const hz = (def.size.d / 2) * scale.z;
        colliderDesc = RAPIER.ColliderDesc.cuboid(Math.abs(hx), Math.abs(hy), Math.abs(hz));
    } else if (def.type === 'sphere' && def.radius) {
        const s = Math.max(scale.x, Math.max(scale.y, scale.z));
        colliderDesc = RAPIER.ColliderDesc.ball(def.radius * s);
    } else if (def.type === 'cylinder' && def.height && def.radius) {
        const h = (def.height / 2) * scale.y;
        const r = def.radius * Math.max(scale.x, scale.z);
        colliderDesc = RAPIER.ColliderDesc.cylinder(Math.abs(h), Math.abs(r));
    } else {
        return; 
    }

    if (colliderDesc) {
        colliderDesc.setRestitution(0.7).setFriction(0.5);
        if (def.mass && def.mass > 0) {
            colliderDesc.setMass(def.mass);
        } else if (def.mass !== 0) {
            colliderDesc.setDensity(1.0);
        }
        this.world.createCollider(colliderDesc, body);
    }
  }

  removeBody(handle: number) {
    if (!this.world) return;
    if (this.world.getRigidBody(handle)) {
      this.world.removeRigidBody(this.world.getRigidBody(handle)!);
    }
  }
}
