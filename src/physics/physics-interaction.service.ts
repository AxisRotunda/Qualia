
import { Injectable, inject } from '@angular/core';
import RAPIER from '@dimforge/rapier3d-compat';
import { PhysicsWorldService } from './world.service';

@Injectable({ providedIn: 'root' })
export class PhysicsInteractionService {
  private worldService = inject(PhysicsWorldService);

  private handBody: RAPIER.RigidBody | null = null;
  private grabJoint: RAPIER.ImpulseJoint | null = null;

  init() {
    const world = this.worldService.world;
    if (!world) return;

    // Initialize Interaction Hand (Kinematic)
    // We keep it in the void until needed
    const handDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0, -1000, 0);
    this.handBody = world.createRigidBody(handDesc);
  }

  startGrab(targetHandle: number, anchorPos: { x: number, y: number, z: number }) {
      const world = this.worldService.world;
      if (!world || !this.handBody) return;
      this.endGrab(); // Clear existing

      const targetBody = world.getRigidBody(targetHandle);
      if (!targetBody || targetBody.isFixed()) return;

      // 1. Move Hand to anchor position
      this.handBody.setTranslation(anchorPos, true);

      // 2. Create Joint
      // Spring joint parameters: stiffness (high), damping (moderate)
      // This centers the object on the cursor (approx).
      const params = RAPIER.JointData.spring(0.0, 500.0, 20.0, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 });
      this.grabJoint = world.createImpulseJoint(params, this.handBody, targetBody, true);
      
      targetBody.wakeUp();
  }

  moveHand(pos: { x: number, y: number, z: number }) {
      if (!this.handBody) return;
      this.handBody.setNextKinematicTranslation(pos);
  }

  endGrab() {
      const world = this.worldService.world;
      if (this.grabJoint && world) {
          world.removeImpulseJoint(this.grabJoint, true);
          this.grabJoint = null;
      }
  }

  // Cleanup if the hand itself needs to be reset
  reset() {
      this.endGrab();
      // We don't destroy the hand body on reset, we just move it away? 
      // Or we let PhysicsWorldService.resetWorld() handle clearing everything and we re-init.
      // PhysicsWorldService clears all bodies except hand if we coded it that way, 
      // but simpler to let it wipe and re-init.
      this.handBody = null;
      this.grabJoint = null;
  }
}
