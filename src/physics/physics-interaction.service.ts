
import { Injectable, inject, OnDestroy } from '@angular/core';
import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { PhysicsWorldService } from './world.service';
import { SceneLifecycleService } from '../engine/level/scene-lifecycle.service';
import { Subscription } from 'rxjs';

/**
 * PhysicsInteractionService: Manages kinematic-to-dynamic constraints in the WASM world.
 * Orchestrates "The Hand" (Kinematic Body) and Spring Joints.
 */
@Injectable({ providedIn: 'root' })
export class PhysicsInteractionService implements OnDestroy {
  private worldService = inject(PhysicsWorldService);
  private lifecycle = inject(SceneLifecycleService);

  private handBody: RAPIER.RigidBody | null = null;
  private grabJoint: RAPIER.ImpulseJoint | null = null;
  private sub: Subscription;

  // Scratch objects for math
  private readonly _targetPos = new THREE.Vector3();
  private readonly _targetRot = new THREE.Quaternion();
  private readonly _offset = new THREE.Vector3();

  constructor() {
      this.sub = this.lifecycle.onWorldCleared.subscribe(() => {
          this.reset();
      });
  }

  ngOnDestroy() {
      this.sub.unsubscribe();
  }

  init() {
    const world = this.worldService.world;
    if (!world) return;

    try {
        const isValid = this.handBody && world.bodies.contains(this.handBody.handle);
        if (!isValid) {
            const handDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0, -1000, 0);
            this.handBody = world.createRigidBody(handDesc);
        }
    } catch (err) {
        console.warn('[PHYSICS] Failed to init interaction hand', err);
        this.handBody = null;
    }
  }

  private ensureHandInitialized(): boolean {
      const world = this.worldService.world;
      if (!world) return false;
      if (!this.handBody || !world.bodies.contains(this.handBody.handle)) {
          this.init();
      }
      return !!this.handBody;
  }

  startGrab(targetHandle: number, anchorPos: { x: number, y: number, z: number }) {
      const world = this.worldService.world;
      if (!world) return;

      if (!Number.isFinite(anchorPos.x) || !Number.isFinite(anchorPos.y) || !Number.isFinite(anchorPos.z)) {
          return;
      }
      
      if (!this.ensureHandInitialized()) return;

      this.endGrab(); 

      if (!world.bodies.contains(targetHandle)) return;
      if (targetHandle === this.handBody!.handle) return;

      const targetBody = world.getRigidBody(targetHandle);
      if (!targetBody || !targetBody.isDynamic()) return;

      this.handBody!.setTranslation(anchorPos, true);

      const bPos = targetBody.translation();
      const bRot = targetBody.rotation();
      
      this._targetPos.set(bPos.x, bPos.y, bPos.z);
      this._targetRot.set(bRot.x, bRot.y, bRot.z, bRot.w);
      this._targetRot.invert(); 
      
      this._offset.set(anchorPos.x, anchorPos.y, anchorPos.z).sub(this._targetPos).applyQuaternion(this._targetRot);

      const mass = targetBody.mass();
      const { stiffness, damping } = this.calculateGripTuning(mass);
      
      const params = RAPIER.JointData.spring(
          0.0, stiffness, damping, 
          { x: 0, y: 0, z: 0 }, 
          { x: this._offset.x, y: this._offset.y, z: this._offset.z }
      );
      
      try {
          this.grabJoint = world.createImpulseJoint(params, this.handBody!, targetBody, true);
          targetBody.wakeUp();
      } catch (err) {
          console.warn('[PHYSICS] Grab joint failure', err);
          this.grabJoint = null;
      }
  }

  /**
   * Calculates overdamped spring parameters based on mass.
   * RUN_REF: Boosted damping to 2.0 for critical stability during high-speed drag.
   */
  private calculateGripTuning(mass: number): { stiffness: number, damping: number } {
      const baseStiffness = 120.0; 
      let stiffness = baseStiffness * mass;
      
      stiffness = Math.max(100, Math.min(stiffness, 2000000)); 

      // Critical damping: d = 2.0 * sqrt(k*m)
      const damping = 2.0 * Math.sqrt(stiffness * mass);

      return { stiffness, damping };
  }

  moveHand(pos: { x: number, y: number, z: number }) {
      const world = this.worldService.world;
      if (!this.handBody || !world) return;
      
      if (!world.bodies.contains(this.handBody.handle)) {
          this.grabJoint = null; 
          return;
      }

      this.handBody.setNextKinematicTranslation(pos);
  }

  endGrab() {
      const world = this.worldService.world;
      if (this.grabJoint && world) {
          try {
              world.removeImpulseJoint(this.grabJoint, true);
          } catch {
          }
          this.grabJoint = null;
      }
  }

  reset() {
      this.grabJoint = null;
      this.handBody = null; 
  }
}
