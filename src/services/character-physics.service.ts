
import { Injectable, inject } from '@angular/core';
import RAPIER from '@dimforge/rapier3d-compat';
import { PhysicsService, PhysicsBodyDef } from './physics.service';

export interface CharacterContext {
    controller: RAPIER.KinematicCharacterController;
    bodyDef: PhysicsBodyDef;
    entityId: number;
}

@Injectable({
  providedIn: 'root'
})
export class CharacterPhysicsService {
  private physics = inject(PhysicsService);

  private readonly VIRTUAL_MASS = 120.0; 
  private readonly _impulse = { x: 0, y: 0, z: 0 };

  private get world() {
    return this.physics.rWorld;
  }

  createCharacterDef(x: number, y: number, z: number, radius: number, height: number): PhysicsBodyDef {
      if (!this.world) throw new Error('Physics not initialized');

      // RUN_REF: Using Capsule for realistic human-scale navigation
      const def = this.physics.shapes.createCapsule(
          x, y, z, height, radius, 1, 'plastic', 'kinematicPosition'
      );
      
      return def;
  }

  /**
   * Updates character collision volume for stance changes (Crouch).
   * Industry Standard: Recreates the collider on the kinematic body.
   */
  updateCharacterHeight(ctx: CharacterContext, radius: number, height: number) {
      if (!this.world) return;
      const body = this.world.getRigidBody(ctx.bodyDef.handle);
      if (!body) return;

      // 1. Remove old collider
      const oldCollider = body.collider(0);
      if (oldCollider) {
          this.world.removeCollider(oldCollider, false);
      }

      // 2. Create new capsule descriptor
      const halfH = Math.max(0.1, (height / 2) - radius);
      const colDesc = RAPIER.ColliderDesc.capsule(halfH, radius);
      
      // 3. Re-apply interaction groups (PLAYER mask)
      const membership = 0x0004; // CG.PLAYER
      const filter = 0xFFFF;
      colDesc.setCollisionGroups((membership << 16) | filter);
      
      this.world.createCollider(colDesc, body);
      
      // Update definition cache
      ctx.bodyDef.height = height;
      ctx.bodyDef.radius = radius;
  }

  createController(): RAPIER.KinematicCharacterController {
      if (!this.world) throw new Error('Physics not initialized');
      
      // RUN_INDUSTRY: Precise offset for predictable floor contact
      const offset = 0.02; 
      const controller = this.world.createCharacterController(offset);
      
      controller.setUp({ x: 0.0, y: 1.0, z: 0.0 });
      controller.setMaxSlopeClimbAngle(50 * Math.PI / 180);
      controller.setMinSlopeSlideAngle(30 * Math.PI / 180);
      
      // RUN_INDUSTRY: Standard Autostep (Stairs, small rocks)
      controller.enableAutostep(0.5, 0.2, true);
      
      // Increased snap distance to keep feet on ground during downhill run
      controller.enableSnapToGround(0.5);

      return controller;
  }

  moveCharacter(ctx: CharacterContext, translation: {x:number, y:number, z:number}, dt: number) {
      if (!this.world) return;
      
      const body = this.world.getRigidBody(ctx.bodyDef.handle);
      if (!body) return;
      
      const collider = body.collider(0);
      if (!collider) return;

      // Compute collision-aware movement
      ctx.controller.computeColliderMovement(collider, translation);

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
              if (otherBody && otherBody.isDynamic()) {
                  const coupling = 50.0; 
                  
                  // RUN_OPT: Use scratch vector to prevent loop allocation
                  this._impulse.x = movement.x * this.VIRTUAL_MASS * coupling;
                  this._impulse.y = movement.y * this.VIRTUAL_MASS * coupling;
                  this._impulse.z = movement.z * this.VIRTUAL_MASS * coupling;
                  
                  otherBody.applyImpulse(this._impulse, true);
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
      this.physics.world.removeBody(ctx.bodyDef.handle);
      this.world.removeCharacterController(ctx.controller);
  }
}
