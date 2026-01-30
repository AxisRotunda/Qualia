
import { Injectable, inject } from '@angular/core';
import RAPIER from '@dimforge/rapier3d-compat';
import { PhysicsService } from './physics.service';

export interface CharacterContext {
    controller: RAPIER.KinematicCharacterController;
    bodyHandle: number;
    colliderHandle: number;
}

@Injectable({
  providedIn: 'root'
})
export class CharacterPhysicsService {
  private physics = inject(PhysicsService);

  // Approximate mass of the character + equipment in kg.
  // Defines how much momentum is transferred during collisions.
  private readonly VIRTUAL_MASS = 120.0; 

  private get world() {
    return this.physics.rWorld;
  }

  createCharacter(x: number, y: number, z: number, radius: number, height: number): CharacterContext {
      if (!this.world) throw new Error('Physics not initialized');

      // 1. Create Kinematic Rigid Body (Position Based)
      const bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased()
          .setTranslation(x, y, z);
      const rigidBody = this.world.createRigidBody(bodyDesc);

      // 2. Create Capsule Collider
      const halfHeight = (height / 2) - radius;
      const colliderDesc = RAPIER.ColliderDesc.capsule(halfHeight, radius)
          .setFriction(0.0) 
          .setRestitution(0.0);
      
      const collider = this.world.createCollider(colliderDesc, rigidBody);

      // 3. Create Controller
      const offset = 0.05; 
      const controller = this.world.createCharacterController(offset);
      
      // Default settings
      controller.setUp({ x: 0.0, y: 1.0, z: 0.0 });
      controller.setMaxSlopeClimbAngle(50 * Math.PI / 180); // Increased to 50deg for steeper ramps
      controller.setMinSlopeSlideAngle(30 * Math.PI / 180);
      
      // Autostep: Increased max height to 0.5 to handle the 0.31m steps in the grand staircase
      controller.enableAutostep(0.5, 0.2, true);
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

      // Interaction: Apply impulses to dynamic bodies we touched
      this.applyInteractionImpulses(ctx, corrected, dt);
  }

  private applyInteractionImpulses(ctx: CharacterContext, movement: RAPIER.Vector, dt: number) {
      const num = ctx.controller.numComputedCollisions();
      for (let i = 0; i < num; i++) {
          const collision = ctx.controller.computedCollision(i);
          const otherCollider = this.world!.getCollider(collision.collider.handle);
          if (otherCollider) {
              const otherBody = otherCollider.parent();
              // Only push dynamic bodies
              if (otherBody && otherBody.isDynamic()) {
                  // Hard Realism: Momentum Transfer
                  const coupling = 50.0; // Increased coupling for better heavy object pushing
                  
                  const impulse = {
                      x: movement.x * this.VIRTUAL_MASS * coupling,
                      y: movement.y * this.VIRTUAL_MASS * coupling, 
                      z: movement.z * this.VIRTUAL_MASS * coupling
                  };
                  
                  otherBody.applyImpulse(impulse, true);
                  otherBody.wakeUp();
              }
          }
      }
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
}
