
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
}
