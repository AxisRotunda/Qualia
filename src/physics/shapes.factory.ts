
import { Injectable, inject } from '@angular/core';
import RAPIER from '@dimforge/rapier3d-compat';
import { PhysicsWorldService } from './world.service';
import { PhysicsBodyDef } from '../engine/schema'; 
import { MassCalculator } from './logic/mass-calculator';
import { PhysicsOptimizerService } from './optimization/physics-optimizer.service';

@Injectable({ providedIn: 'root' })
export class ShapesFactory {
  private worldService = inject(PhysicsWorldService);
  private massCalc = inject(MassCalculator);
  private optimizer = inject(PhysicsOptimizerService);

  private get world() {
    return this.worldService.world;
  }

  // --- Realism Configuration ---
  private readonly DEFAULT_LINEAR_DAMPING = 0.08; 
  private readonly DEFAULT_ANGULAR_DAMPING = 0.2;
  
  private configureDynamicBody(desc: RAPIER.RigidBodyDesc, lockRotation?: boolean) {
      desc.setLinearDamping(this.DEFAULT_LINEAR_DAMPING)
          .setAngularDamping(this.DEFAULT_ANGULAR_DAMPING)
          .setCcdEnabled(true) // Prevent tunneling
          .setCanSleep(true);  // Optimization
          
      if (lockRotation) {
          desc.lockRotations();
      }
  }

  createBox(x: number, y: number, z: number, w?: number, h?: number, d?: number, mass?: number, material?: string): PhysicsBodyDef {
    if (!this.world) throw new Error('Physics not initialized');

    const width = w ?? 1;
    const height = h ?? 1;
    const depth = d ?? 1;
    
    const props = this.massCalc.resolve('box', { w: width, h: height, d: depth }, mass, material);
    const isStatic = props.mass === 0;

    const rigidBodyDesc = isStatic ? RAPIER.RigidBodyDesc.fixed() : RAPIER.RigidBodyDesc.dynamic();
    rigidBodyDesc.setTranslation(x, y, z);
    
    if (!isStatic) this.configureDynamicBody(rigidBodyDesc);

    const rigidBody = this.world.createRigidBody(rigidBodyDesc);
    (rigidBody as any).userData = { baseMass: props.mass, baseVolume: props.volume };

    const colliderDesc = RAPIER.ColliderDesc.cuboid(width / 2, height / 2, depth / 2)
        .setRestitution(props.restitution)
        .setFriction(props.friction);
    
    if (props.mass > 0) colliderDesc.setMass(props.mass);
    
    // Apply Optimization
    this.optimizer.applyTo(colliderDesc, ['primitive'], isStatic);
    
    this.world.createCollider(colliderDesc, rigidBody);

    return {
      handle: rigidBody.handle,
      type: 'box',
      position: { x, y, z },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      size: { w: width, h: height, d: depth },
      mass: props.mass
    };
  }

  createSphere(x: number, y: number, z: number, r?: number, mass?: number, material?: string): PhysicsBodyDef {
    if (!this.world) throw new Error('Physics not initialized');

    const radius = r ?? 0.5;
    const props = this.massCalc.resolve('sphere', { r: radius }, mass, material);
    const isStatic = props.mass === 0;

    const rigidBodyDesc = isStatic ? RAPIER.RigidBodyDesc.fixed() : RAPIER.RigidBodyDesc.dynamic();
    rigidBodyDesc.setTranslation(x, y, z);

    if (!isStatic) this.configureDynamicBody(rigidBodyDesc);

    const rigidBody = this.world.createRigidBody(rigidBodyDesc);
    (rigidBody as any).userData = { baseMass: props.mass, baseVolume: props.volume };

    const colliderDesc = RAPIER.ColliderDesc.ball(radius)
        .setRestitution(props.restitution)
        .setFriction(props.friction);

    if (props.mass > 0) colliderDesc.setMass(props.mass);
    this.optimizer.applyTo(colliderDesc, ['primitive'], isStatic);

    this.world.createCollider(colliderDesc, rigidBody);

    return {
      handle: rigidBody.handle,
      type: 'sphere',
      position: { x, y, z },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      radius,
      mass: props.mass
    };
  }

  createCylinder(x: number, y: number, z: number, height: number, radius: number, mass: number = 1, material?: string): PhysicsBodyDef {
      if (!this.world) throw new Error('Physics not initialized');
      
      const props = this.massCalc.resolve('cylinder', { r: radius, h: height }, mass, material);
      const isStatic = props.mass === 0;

      const rigidBodyDesc = isStatic ? RAPIER.RigidBodyDesc.fixed() : RAPIER.RigidBodyDesc.dynamic();
      rigidBodyDesc.setTranslation(x, y, z);
      
      if (!isStatic) this.configureDynamicBody(rigidBodyDesc);

      const rigidBody = this.world.createRigidBody(rigidBodyDesc);
      (rigidBody as any).userData = { baseMass: props.mass, baseVolume: props.volume };

      const colliderDesc = RAPIER.ColliderDesc.cylinder(height / 2, radius)
        .setRestitution(props.restitution)
        .setFriction(props.friction);
      
      if (props.mass > 0) colliderDesc.setMass(props.mass);
      this.optimizer.applyTo(colliderDesc, ['primitive'], isStatic);

      this.world.createCollider(colliderDesc, rigidBody);

      return {
          handle: rigidBody.handle,
          type: 'cylinder',
          position: { x, y, z },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          height,
          radius,
          mass: props.mass
      };
  }

  createCone(x: number, y: number, z: number, height: number, radius: number, mass: number = 1, material?: string): PhysicsBodyDef {
      if (!this.world) throw new Error('Physics not initialized');

      const props = this.massCalc.resolve('cone', { r: radius, h: height }, mass, material);
      const isStatic = props.mass === 0;

      const rigidBodyDesc = isStatic ? RAPIER.RigidBodyDesc.fixed() : RAPIER.RigidBodyDesc.dynamic();
      rigidBodyDesc.setTranslation(x, y, z);
      
      if (!isStatic) this.configureDynamicBody(rigidBodyDesc);

      const rigidBody = this.world.createRigidBody(rigidBodyDesc);
      (rigidBody as any).userData = { baseMass: props.mass, baseVolume: props.volume };

      const colliderDesc = RAPIER.ColliderDesc.cone(height / 2, radius)
        .setRestitution(props.restitution)
        .setFriction(props.friction);

      if (props.mass > 0) colliderDesc.setMass(props.mass);
      this.optimizer.applyTo(colliderDesc, ['primitive'], isStatic);

      this.world.createCollider(colliderDesc, rigidBody);

      return {
          handle: rigidBody.handle,
          type: 'cone', 
          position: { x, y, z },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          height,
          radius,
          mass: props.mass
      };
  }

  createTrimesh(x: number, y: number, z: number, vertices: Float32Array, indices: Uint32Array): PhysicsBodyDef {
      if (!this.world) throw new Error('Physics not initialized');

      if (vertices.length < 9 || indices.length < 3) {
          return this.createBox(x, y, z, 1, 1, 1, 0);
      }

      const rigidBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z);
      const rigidBody = this.world.createRigidBody(rigidBodyDesc);

      const colliderDesc = RAPIER.ColliderDesc.trimesh(vertices, indices)
          .setRestitution(0.1)
          .setFriction(0.8);
      
      this.optimizer.applyTo(colliderDesc, ['static', 'mesh'], true);
      this.world.createCollider(colliderDesc, rigidBody);

      return {
          handle: rigidBody.handle,
          type: 'trimesh',
          position: { x, y, z },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          mass: 0
      };
  }

  createConvexHull(x: number, y: number, z: number, vertices: Float32Array, mass: number = 1, material?: string): PhysicsBodyDef {
      if (!this.world) throw new Error('Physics not initialized');

      let finalMass = mass;
      const matData = this.massCalc.resolveMaterialOnly(material);
      const isStatic = finalMass === 0;
      
      const rigidBodyDesc = isStatic ? RAPIER.RigidBodyDesc.fixed() : RAPIER.RigidBodyDesc.dynamic();
      rigidBodyDesc.setTranslation(x, y, z);
      
      if (!isStatic) this.configureDynamicBody(rigidBodyDesc);

      const rigidBody = this.world.createRigidBody(rigidBodyDesc);
      (rigidBody as any).userData = { baseMass: finalMass };
      
      const colliderDesc = RAPIER.ColliderDesc.convexHull(vertices);
      if (!colliderDesc) {
          return this.createBox(x, y, z, 1, 1, 1, finalMass);
      }

      colliderDesc.setRestitution(matData.restitution).setFriction(matData.friction);
      
      if (finalMass > 0) {
          if (material) {
              colliderDesc.setDensity(matData.density);
          } else {
              colliderDesc.setMass(finalMass);
          }
      }
      
      this.optimizer.applyTo(colliderDesc, ['hull'], isStatic);
      this.world.createCollider(colliderDesc, rigidBody);

      return {
          handle: rigidBody.handle,
          type: 'convex-hull',
          position: { x, y, z },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          mass: finalMass
      };
  }

  createHeightfield(x: number, y: number, z: number, nrows: number, ncols: number, heights: Float32Array, size: {x: number, y: number, z: number}): PhysicsBodyDef {
      if (!this.world) throw new Error('Physics not initialized');

      const scale = { x: size.x, y: 1.0, z: size.z };

      const rigidBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z);
      const rigidBody = this.world.createRigidBody(rigidBodyDesc);

      const colliderDesc = RAPIER.ColliderDesc.heightfield(nrows, ncols, heights, scale)
          .setFriction(0.5)
          .setRestitution(0.1);
      
      this.optimizer.applyTo(colliderDesc, ['terrain'], true);
      this.world.createCollider(colliderDesc, rigidBody);

      return {
          handle: rigidBody.handle,
          type: 'heightfield',
          position: { x, y, z },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          heightData: heights,
          fieldSize: { rows: nrows, cols: ncols },
          size: { w: size.x, h: 1, d: size.z },
          mass: 0
      };
  }

  /**
   * Resizes the colliders of an existing rigid body by removing old colliders
   * and creating new ones with scaled dimensions. Preserves mass proportional to volume change.
   */
  updateBodyScale(handle: number, def: PhysicsBodyDef, scale: { x: number, y: number, z: number }) {
    if (!this.world) return;
    const body = this.world.getRigidBody(handle);
    if (!body) return;

    // 1. Snapshot existing properties before removal
    let oldGroups = 0xFFFF;
    let oldEvents = RAPIER.ActiveEvents.NONE;
    
    if (body.numColliders() > 0) {
        const c = body.collider(0);
        oldGroups = c.collisionGroups();
        oldEvents = c.activeEvents();
    }

    // 2. Remove existing colliders
    const n = body.numColliders();
    const collidersToRemove: RAPIER.Collider[] = [];
    for(let i=0; i<n; i++) collidersToRemove.push(body.collider(i));
    collidersToRemove.forEach(c => this.world!.removeCollider(c, false));

    // 3. Create Scaled Collider Desc
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
    } else if (def.type === 'heightfield' && def.heightData && def.fieldSize && def.size) {
        const targetW = def.size.w * scale.x;
        const targetD = def.size.d * scale.z;
        const targetH = scale.y;
        
        colliderDesc = RAPIER.ColliderDesc.heightfield(
            def.fieldSize.rows, 
            def.fieldSize.cols, 
            def.heightData, 
            { x: targetW, y: targetH, z: targetD }
        );
    }

    // 4. Apply & Reattach
    if (colliderDesc) {
        // Retrieve base mass from userdata if available
        const userData = (body as any).userData;
        const baseMass = userData?.baseMass ?? def.mass;

        if (baseMass && baseMass > 0) {
            colliderDesc.setMass(baseMass * scale.x * scale.y * scale.z);
        } else {
            colliderDesc.setDensity(1.0);
        }
        
        colliderDesc.setRestitution(0.3).setFriction(0.6); 
        
        // Restore Optimization Config
        colliderDesc.setCollisionGroups(oldGroups);
        colliderDesc.setActiveEvents(oldEvents);

        this.world.createCollider(colliderDesc, body);
    }
  }

  setLockRotation(handle: number, locked: boolean) {
      if (!this.world) return;
      const body = this.world.getRigidBody(handle);
      if (body) body.lockRotations(locked, true);
  }
}
