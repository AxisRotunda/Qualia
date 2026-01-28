
import { Injectable, inject } from '@angular/core';
import RAPIER from '@dimforge/rapier3d-compat';
import { PhysicsService, PhysicsBodyDef } from '../physics.service';

@Injectable({
  providedIn: 'root'
})
export class PhysicsFactoryService {
  private physics = inject(PhysicsService);

  private get world() {
    return this.physics.rWorld;
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
}
