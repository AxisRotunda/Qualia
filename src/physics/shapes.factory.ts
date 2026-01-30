
import { Injectable, inject } from '@angular/core';
import RAPIER from '@dimforge/rapier3d-compat';
import { PhysicsWorldService } from './world.service';
import { PhysicsBodyDef } from '../services/physics.service'; 

@Injectable({ providedIn: 'root' })
export class ShapesFactory {
  private worldService = inject(PhysicsWorldService);

  private get world() {
    return this.worldService.world;
  }

  // --- Realism Configuration ---
  private readonly DEFAULT_LINEAR_DAMPING = 0.02;
  private readonly DEFAULT_ANGULAR_DAMPING = 0.05;
  
  private readonly DEFAULT_RESTITUTION = 0.3; 
  private readonly DEFAULT_FRICTION = 0.6;    

  private configureDynamicBody(desc: RAPIER.RigidBodyDesc, lockRotation?: boolean) {
      desc.setLinearDamping(this.DEFAULT_LINEAR_DAMPING)
          .setAngularDamping(this.DEFAULT_ANGULAR_DAMPING)
          .setCcdEnabled(true) // Prevent tunneling
          .setCanSleep(true);  // Optimization
          
      if (lockRotation) {
          desc.lockRotations();
      }
  }

  createBox(x: number, y: number, z: number, w?: number, h?: number, d?: number, mass?: number): PhysicsBodyDef {
    if (!this.world) throw new Error('Physics not initialized');

    const width = w ?? (0.5 + Math.random() * 0.5);
    const height = h ?? width;
    const depth = d ?? width;
    
    // Check if locked (passed as param? No, passed via context usually, but for primitives we default false unless updated later)
    // Actually, createBox is called by factories. We should allow locking in the Def return, 
    // but the Body is created HERE.
    // Ideally create methods should take an options object.
    // For now, we assume simple creation, and EntityLibrary/PhysicsFactory can update props later if needed?
    // No, rotation locking must be set on creation or via method.
    // Rapier bodies can be locked after creation.
    
    const rigidBodyDesc = (mass === 0) ? RAPIER.RigidBodyDesc.fixed() : RAPIER.RigidBodyDesc.dynamic();
    rigidBodyDesc.setTranslation(x, y, z);
    
    if (mass !== 0) this.configureDynamicBody(rigidBodyDesc);

    const rigidBody = this.world.createRigidBody(rigidBodyDesc);
    const colliderDesc = RAPIER.ColliderDesc.cuboid(width / 2, height / 2, depth / 2)
        .setRestitution(this.DEFAULT_RESTITUTION)
        .setFriction(this.DEFAULT_FRICTION);
    
    this.applyMass(colliderDesc, mass);
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

    if (mass !== 0) this.configureDynamicBody(rigidBodyDesc);

    const rigidBody = this.world.createRigidBody(rigidBodyDesc);
    const colliderDesc = RAPIER.ColliderDesc.ball(radius)
        .setRestitution(0.7) 
        .setFriction(this.DEFAULT_FRICTION);

    this.applyMass(colliderDesc, mass);
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
      
      if (mass !== 0) this.configureDynamicBody(rigidBodyDesc);

      const rigidBody = this.world.createRigidBody(rigidBodyDesc);
      const colliderDesc = RAPIER.ColliderDesc.cylinder(height / 2, radius)
        .setRestitution(this.DEFAULT_RESTITUTION)
        .setFriction(this.DEFAULT_FRICTION);
      
      this.applyMass(colliderDesc, mass);
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

  createCone(x: number, y: number, z: number, height: number, radius: number, mass: number = 1): PhysicsBodyDef {
      if (!this.world) throw new Error('Physics not initialized');

      const rigidBodyDesc = (mass === 0) ? RAPIER.RigidBodyDesc.fixed() : RAPIER.RigidBodyDesc.dynamic();
      rigidBodyDesc.setTranslation(x, y, z);
      
      if (mass !== 0) this.configureDynamicBody(rigidBodyDesc);

      const rigidBody = this.world.createRigidBody(rigidBodyDesc);
      const colliderDesc = RAPIER.ColliderDesc.cone(height / 2, radius)
        .setRestitution(this.DEFAULT_RESTITUTION)
        .setFriction(this.DEFAULT_FRICTION);

      this.applyMass(colliderDesc, mass);
      this.world.createCollider(colliderDesc, rigidBody);

      return {
          handle: rigidBody.handle,
          type: 'cone', 
          position: { x, y, z },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          height,
          radius,
          mass
      };
  }

  createTrimesh(x: number, y: number, z: number, vertices: Float32Array, indices: Uint32Array): PhysicsBodyDef {
      if (!this.world) throw new Error('Physics not initialized');

      // Trimeshes MUST be fixed (static) 
      const rigidBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z);
      const rigidBody = this.world.createRigidBody(rigidBodyDesc);

      const colliderDesc = RAPIER.ColliderDesc.trimesh(vertices, indices)
          .setRestitution(0.1)
          .setFriction(0.8);
      
      this.world.createCollider(colliderDesc, rigidBody);

      return {
          handle: rigidBody.handle,
          type: 'trimesh',
          position: { x, y, z },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          mass: 0
      };
  }

  createConvexHull(x: number, y: number, z: number, vertices: Float32Array, mass: number = 1): PhysicsBodyDef {
      if (!this.world) throw new Error('Physics not initialized');

      const rigidBodyDesc = (mass === 0) ? RAPIER.RigidBodyDesc.fixed() : RAPIER.RigidBodyDesc.dynamic();
      rigidBodyDesc.setTranslation(x, y, z);
      
      if (mass !== 0) this.configureDynamicBody(rigidBodyDesc);

      const rigidBody = this.world.createRigidBody(rigidBodyDesc);
      
      const colliderDesc = RAPIER.ColliderDesc.convexHull(vertices);
      if (!colliderDesc) {
          console.error("Failed to generate convex hull. Falling back to box.");
          return this.createBox(x, y, z, 1, 1, 1, mass);
      }

      colliderDesc.setRestitution(this.DEFAULT_RESTITUTION).setFriction(this.DEFAULT_FRICTION);
      this.applyMass(colliderDesc, mass);
      
      this.world.createCollider(colliderDesc, rigidBody);

      return {
          handle: rigidBody.handle,
          type: 'convex-hull',
          position: { x, y, z },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          mass
      };
  }

  updateBodyScale(handle: number, def: PhysicsBodyDef, scale: { x: number, y: number, z: number }) {
    if (!this.world) return;
    const body = this.world.getRigidBody(handle);
    if (!body) return;

    // Remove existing colliders
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
    } else if (def.type === 'cone' && def.height && def.radius) {
        const h = (def.height / 2) * scale.y;
        const r = def.radius * Math.max(scale.x, scale.z);
        colliderDesc = RAPIER.ColliderDesc.cone(Math.abs(h), Math.abs(r));
    }

    if (colliderDesc) {
        colliderDesc.setRestitution(this.DEFAULT_RESTITUTION).setFriction(this.DEFAULT_FRICTION);
        this.applyMass(colliderDesc, def.mass);
        this.world.createCollider(colliderDesc, body);
    }
  }

  // Called manually after creation if needed
  setLockRotation(handle: number, locked: boolean) {
      if (!this.world) return;
      const body = this.world.getRigidBody(handle);
      if (body) body.lockRotations(locked, true);
  }

  private applyMass(desc: RAPIER.ColliderDesc, mass?: number) {
      if (mass && mass > 0) {
          desc.setMass(mass);
      } else if (mass !== 0) {
          desc.setDensity(1.0);
      }
  }
}
