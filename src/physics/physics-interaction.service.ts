
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
    // We reuse this body, so we don't recreate it constantly
    if (!this.handBody || !world.bodies.contains(this.handBody.handle)) {
        const handDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0, -1000, 0);
        this.handBody = world.createRigidBody(handDesc);
    }
  }

  startGrab(targetHandle: number, anchorPos: { x: number, y: number, z: number }) {
      const world = this.worldService.world;
      if (!world || !this.handBody) return;
      
      // Ensure hand body is still valid
      if (!world.bodies.contains(this.handBody.handle)) {
          this.init();
          if (!this.handBody) return;
      }

      this.endGrab(); 

      // Check target validity
      if (!world.bodies.contains(targetHandle)) return;

      const targetBody = world.getRigidBody(targetHandle);
      if (!targetBody || targetBody.isFixed()) return;

      // 1. Move Hand to anchor position
      this.handBody.setTranslation(anchorPos, true);

      // 2. Adaptive Joint Parameters
      const mass = targetBody.mass();
      
      // Base stiffness for a 1kg object
      const baseStiffness = 60.0; 
      // Scale stiffness with mass, but clamp to avoid instability with super heavy objects
      let stiffness = baseStiffness * mass;
      stiffness = Math.max(10, Math.min(stiffness, 20000)); // Cap for stability

      // Critical damping ratio approx: damping = 2 * sqrt(mass * stiffness)
      // We want slightly under-damped for "springy" feel or critically damped for "tight" grip.
      const damping = 2 * Math.sqrt(mass * stiffness) * 0.8; 

      const params = RAPIER.JointData.spring(0.0, stiffness, damping, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 });
      
      try {
          this.grabJoint = world.createImpulseJoint(params, this.handBody, targetBody, true);
          targetBody.wakeUp();
      } catch (err) {
          console.warn('Failed to create grab joint', err);
      }
  }

  moveHand(pos: { x: number, y: number, z: number }) {
      const world = this.worldService.world;
      if (!this.handBody || !world) return;
      
      // Safety check in case the world was reset
      if (!world.bodies.contains(this.handBody.handle)) return;

      this.handBody.setNextKinematicTranslation(pos);
  }

  endGrab() {
      const world = this.worldService.world;
      if (this.grabJoint && world) {
          try {
              // CRITICAL: Check if joint handle is still valid. 
              // If the body was deleted, the joint is auto-deleted by Rapier.
              // Attempting to remove it again causes WASM "unreachable" or "recursive use" errors.
              if (world.impulseJoints.contains(this.grabJoint.handle)) {
                  world.removeImpulseJoint(this.grabJoint, true);
              }
          } catch (e) {
              console.warn('Error cleaning up grab joint:', e);
          }
          this.grabJoint = null;
      }
  }

  reset() {
      this.endGrab();
      this.handBody = null;
      this.grabJoint = null;
  }
}
