
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

export interface CharacterContext {
    controller: RAPIER.KinematicCharacterController;
    bodyHandle: number;
    colliderHandle: number;
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

  createBox(x: number, y: number, z: number, w?: number, h?: number, d?: number, mass?: number): PhysicsBodyDef {
    if (!this.world) throw new Error('Physics not initialized');

    const width = w ?? (0.5 + Math.random() * 0.5);
    const height = h ?? width;
    const depth = d ?? width;
    
    // Use dynamic unless mass is explicitly 0 (static)
    const rigidBodyDesc = (mass === 0) ? RAPIER.RigidBodyDesc.fixed() : RAPIER.RigidBodyDesc.dynamic();
    rigidBodyDesc.setTranslation(x, y, z);
    
    const rigidBody = this.world.createRigidBody(rigidBodyDesc);
    
    // Rapier expects half-extents
    const colliderDesc = RAPIER.ColliderDesc.cuboid(width / 2, height / 2, depth / 2)
        .setRestitution(0.7)
        .setFriction(0.5);
    
    if (mass && mass > 0) {
        colliderDesc.setMass(mass);
    } else if (mass !== 0) {
        colliderDesc.setDensity(1.0);
    }

    this.world.createCollider(colliderDesc, rigidBody);

    return {
      handle: rigidBody.handle,
      type: 'box',
      position: { x, y, z },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      size: { w: width, h: height, d: depth },
      mass
    };
  }

  createSphere(x: number, y: number, z: number, r?: number, mass?: number): PhysicsBodyDef {
    if (!this.world) throw new Error('Physics not initialized');

    const radius = r ?? (0.3 + Math.random() * 0.4);

    const rigidBodyDesc = (mass === 0) ? RAPIER.RigidBodyDesc.fixed() : RAPIER.RigidBodyDesc.dynamic();
    rigidBodyDesc.setTranslation(x, y, z);

    const rigidBody = this.world.createRigidBody(rigidBodyDesc);

    const colliderDesc = RAPIER.ColliderDesc.ball(radius)
        .setRestitution(0.8)
        .setFriction(0.5);

    if (mass && mass > 0) {
        colliderDesc.setMass(mass);
    } else if (mass !== 0) {
        colliderDesc.setDensity(1.0);
    }

    this.world.createCollider(colliderDesc, rigidBody);

    return {
      handle: rigidBody.handle,
      type: 'sphere',
      position: { x, y, z },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      radius,
      mass
    };
  }

  createCylinder(x: number, y: number, z: number, height: number, radius: number, mass: number = 1): PhysicsBodyDef {
      if (!this.world) throw new Error('Physics not initialized');
      
      const rigidBodyDesc = (mass === 0) ? RAPIER.RigidBodyDesc.fixed() : RAPIER.RigidBodyDesc.dynamic();
      rigidBodyDesc.setTranslation(x, y, z);
      
      const rigidBody = this.world.createRigidBody(rigidBodyDesc);
      
      // Rapier cylinder is defined by half-height and radius
      const colliderDesc = RAPIER.ColliderDesc.cylinder(height / 2, radius)
        .setRestitution(0.5)
        .setFriction(0.5);
      
      if (mass && mass > 0) {
        colliderDesc.setMass(mass);
      } else if (mass !== 0) {
        colliderDesc.setDensity(1.0);
      }
      
      this.world.createCollider(colliderDesc, rigidBody);

      return {
          handle: rigidBody.handle,
          type: 'cylinder',
          position: { x, y, z },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          height,
          radius,
          mass
      };
  }

  // --- Character Controller Support ---

  createCharacter(x: number, y: number, z: number, radius: number, height: number): CharacterContext {
      if (!this.world) throw new Error('Physics not initialized');

      // 1. Create Kinematic Rigid Body (Position Based)
      const bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased()
          .setTranslation(x, y, z);
      const rigidBody = this.world.createRigidBody(bodyDesc);

      // 2. Create Capsule Collider
      // Rapier Capsule is Half-Height (segment half length) + Radius
      // Total height = 2 * halfHeight + 2 * radius
      // We want Total Height = height.
      // 2 * hh = height - 2 * radius  => hh = (height/2) - radius
      const halfHeight = (height / 2) - radius;
      const colliderDesc = RAPIER.ColliderDesc.capsule(halfHeight, radius)
          .setFriction(0.0) // Character usually handles friction manually or via controller
          .setRestitution(0.0);
      
      const collider = this.world.createCollider(colliderDesc, rigidBody);

      // 3. Create Controller
      const offset = 0.05; // Gap for collision detection
      const controller = this.world.createCharacterController(offset);
      
      // Default settings
      controller.setUp({ x: 0.0, y: 1.0, z: 0.0 });
      controller.setMaxSlopeClimbAngle(45 * Math.PI / 180);
      controller.setMinSlopeSlideAngle(30 * Math.PI / 180);
      controller.enableAutostep(0.3, 0.2, true);
      controller.enableSnapToGround(0.3);

      return {
          controller,
          bodyHandle: rigidBody.handle,
          colliderHandle: collider.handle
      };
  }

  moveCharacter(ctx: CharacterContext, translation: {x:number, y:number, z:number}, dt: number) {
      if (!this.world) return;
      
      const collider = this.world.getCollider(ctx.colliderHandle);
      const body = this.world.getRigidBody(ctx.bodyHandle);
      
      if (!collider || !body) return;

      // Compute collision-aware movement
      ctx.controller.computeColliderMovement(
          collider, 
          translation
      );

      // Get corrected movement
      const corrected = ctx.controller.computedMovement();
      
      // Apply to body
      const currentPos = body.translation();
      const newPos = {
          x: currentPos.x + corrected.x,
          y: currentPos.y + corrected.y,
          z: currentPos.z + corrected.z
      };
      
      body.setNextKinematicTranslation(newPos);
  }

  isCharacterGrounded(ctx: CharacterContext): boolean {
      return ctx.controller.computedGrounded();
  }

  destroyCharacter(ctx: CharacterContext) {
      if (!this.world) return;
      const body = this.world.getRigidBody(ctx.bodyHandle);
      if (body) {
        this.world.removeRigidBody(body);
      }
      this.world.removeCharacterController(ctx.controller);
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
