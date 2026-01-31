
import { Injectable, inject } from '@angular/core';
import RAPIER from '@dimforge/rapier3d-compat';
import { PhysicsWorldService } from './world.service';
import { PhysicsBodyDef } from '../engine/schema'; 
import { MassCalculator } from './logic/mass-calculator';
import { PhysicsScaler } from './logic/physics-scaler';

@Injectable({ providedIn: 'root' })
export class ShapesFactory {
  private worldService = inject(PhysicsWorldService);
  private massCalc = inject(MassCalculator);
  private scaler = inject(PhysicsScaler);

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
    
    const rigidBodyDesc = (props.mass === 0) ? RAPIER.RigidBodyDesc.fixed() : RAPIER.RigidBodyDesc.dynamic();
    rigidBodyDesc.setTranslation(x, y, z);
    
    if (props.mass !== 0) {
        this.configureDynamicBody(rigidBodyDesc);
    }

    const rigidBody = this.world.createRigidBody(rigidBodyDesc);
    // Cache base properties for scaling
    (rigidBody as any).userData = { baseMass: props.mass, baseVolume: props.volume };

    const colliderDesc = RAPIER.ColliderDesc.cuboid(width / 2, height / 2, depth / 2)
        .setRestitution(props.restitution)
        .setFriction(props.friction);
    
    if (props.mass > 0) colliderDesc.setMass(props.mass);
    
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

    const rigidBodyDesc = (props.mass === 0) ? RAPIER.RigidBodyDesc.fixed() : RAPIER.RigidBodyDesc.dynamic();
    rigidBodyDesc.setTranslation(x, y, z);

    if (props.mass !== 0) this.configureDynamicBody(rigidBodyDesc);

    const rigidBody = this.world.createRigidBody(rigidBodyDesc);
    (rigidBody as any).userData = { baseMass: props.mass, baseVolume: props.volume };

    const colliderDesc = RAPIER.ColliderDesc.ball(radius)
        .setRestitution(props.restitution)
        .setFriction(props.friction);

    if (props.mass > 0) colliderDesc.setMass(props.mass);
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

      const rigidBodyDesc = (props.mass === 0) ? RAPIER.RigidBodyDesc.fixed() : RAPIER.RigidBodyDesc.dynamic();
      rigidBodyDesc.setTranslation(x, y, z);
      
      if (props.mass !== 0) this.configureDynamicBody(rigidBodyDesc);

      const rigidBody = this.world.createRigidBody(rigidBodyDesc);
      (rigidBody as any).userData = { baseMass: props.mass, baseVolume: props.volume };

      const colliderDesc = RAPIER.ColliderDesc.cylinder(height / 2, radius)
        .setRestitution(props.restitution)
        .setFriction(props.friction);
      
      if (props.mass > 0) colliderDesc.setMass(props.mass);
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

      const rigidBodyDesc = (props.mass === 0) ? RAPIER.RigidBodyDesc.fixed() : RAPIER.RigidBodyDesc.dynamic();
      rigidBodyDesc.setTranslation(x, y, z);
      
      if (props.mass !== 0) this.configureDynamicBody(rigidBodyDesc);

      const rigidBody = this.world.createRigidBody(rigidBodyDesc);
      (rigidBody as any).userData = { baseMass: props.mass, baseVolume: props.volume };

      const colliderDesc = RAPIER.ColliderDesc.cone(height / 2, radius)
        .setRestitution(props.restitution)
        .setFriction(props.friction);

      if (props.mass > 0) colliderDesc.setMass(props.mass);
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

      // Safeguard against empty geometry
      if (vertices.length < 9 || indices.length < 3) {
          console.warn("ShapesFactory: Trimesh too small, fallback to box.");
          return this.createBox(x, y, z, 1, 1, 1, 0);
      }

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

  createConvexHull(x: number, y: number, z: number, vertices: Float32Array, mass: number = 1, material?: string): PhysicsBodyDef {
      if (!this.world) throw new Error('Physics not initialized');

      if (vertices.length < 3) {
          console.warn("ShapesFactory: Convex hull vertices empty.");
          return this.createBox(x, y, z, 1, 1, 1, mass);
      }

      let finalMass = mass;
      const matData = this.massCalc.resolveMaterialOnly(material);
      
      const rigidBodyDesc = (finalMass === 0) ? RAPIER.RigidBodyDesc.fixed() : RAPIER.RigidBodyDesc.dynamic();
      rigidBodyDesc.setTranslation(x, y, z);
      
      if (finalMass !== 0) this.configureDynamicBody(rigidBodyDesc);

      const rigidBody = this.world.createRigidBody(rigidBodyDesc);
      (rigidBody as any).userData = { baseMass: finalMass };
      
      const colliderDesc = RAPIER.ColliderDesc.convexHull(vertices);
      if (!colliderDesc) {
          console.error("Failed to generate convex hull. Falling back to box.");
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

      // Safeguard against invalid dimensions which crash WASM
      if (nrows < 2 || ncols < 2 || heights.length < 4) {
          console.warn(`ShapesFactory: Invalid heightfield dims ${nrows}x${ncols}. Fallback to plane.`);
          return this.createBox(x, y, z, size.x, 0.1, size.z, 0);
      }

      // Sanitize heights to prevent WASM panic
      for(let k=0; k<heights.length; k++) {
          if (isNaN(heights[k]) || !isFinite(heights[k])) {
              heights[k] = 0;
          }
      }

      // Convert Heightfield to Trimesh to avoid "unreachable" crashes with Rapier Heightfields in compat mode
      const numVerts = nrows * ncols;
      const vertices = new Float32Array(numVerts * 3);
      
      // Allocate double indices for double-sided collision (Back + Front)
      const numQuads = (nrows - 1) * (ncols - 1);
      const indices = new Uint32Array(numQuads * 6 * 2);

      // We need to match Rapier's Heightfield layout: centered at (0,0,0)
      const scaleX = size.x / Math.max(1, ncols - 1);
      const scaleZ = size.z / Math.max(1, nrows - 1);
      const startX = -size.x / 2;
      const startZ = -size.z / 2;

      // Generate Vertices (Y Up)
      for (let i = 0; i < nrows; i++) {
          for (let j = 0; j < ncols; j++) {
              const idx = i * ncols + j;
              vertices[idx * 3 + 0] = startX + j * scaleX;
              vertices[idx * 3 + 1] = heights[idx]; 
              vertices[idx * 3 + 2] = startZ + i * scaleZ;
          }
      }

      // Generate Indices (Two triangles per cell, double sided)
      let ptr = 0;
      for (let i = 0; i < nrows - 1; i++) {
          for (let j = 0; j < ncols - 1; j++) {
              const row1 = i * ncols;
              const row2 = (i + 1) * ncols;
              
              const a = row1 + j;
              const b = row2 + j;
              const c = row1 + j + 1;
              const d = row2 + j + 1;

              // Front Face (CCW)
              indices[ptr++] = a; indices[ptr++] = b; indices[ptr++] = c;
              indices[ptr++] = c; indices[ptr++] = b; indices[ptr++] = d;

              // Back Face (CW) - Ensures collision even if normal logic is flipped or mesh is entered from below
              indices[ptr++] = a; indices[ptr++] = c; indices[ptr++] = b;
              indices[ptr++] = c; indices[ptr++] = d; indices[ptr++] = b;
          }
      }

      const rigidBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z);
      const rigidBody = this.world.createRigidBody(rigidBodyDesc);

      const colliderDesc = RAPIER.ColliderDesc.trimesh(vertices, indices)
          .setFriction(0.5)
          .setRestitution(0.1);

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

  updateBodyScale(handle: number, def: PhysicsBodyDef, scale: { x: number, y: number, z: number }) {
      this.scaler.updateBodyScale(handle, def, scale);
  }

  setLockRotation(handle: number, locked: boolean) {
      if (!this.world) return;
      const body = this.world.getRigidBody(handle);
      if (body) body.lockRotations(locked, true);
  }
}
