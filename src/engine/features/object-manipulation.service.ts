
import { Injectable, inject } from '@angular/core';
import { EngineStateService } from '../engine-state.service';
import { EntityStoreService } from '../ecs/entity-store.service';
import { SceneService } from '../../services/scene.service';
import { TransformLogicService } from '../logic/transform-logic.service';
import { PhysicsService } from '../../services/physics.service';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class ObjectManipulationService {
  private state = inject(EngineStateService);
  private entityStore = inject(EntityStoreService);
  private scene = inject(SceneService);
  private transformLogic = inject(TransformLogicService);
  private physics = inject(PhysicsService);

  // Input State
  move = { x: 0, y: 0 };
  rotLift = { x: 0, y: 0 };
  
  // Settings
  private readonly MOVE_SPEED = 8.0;
  private readonly ROT_SPEED = 3.0;
  private readonly SCALE_SPEED = 2.0;

  // Interaction State
  private isGrabbing = false;
  private grabTargetPos = new THREE.Vector3();
  private grabbedEntity: number | null = null;

  // Optimization: Scratch Vectors
  private readonly _forward = new THREE.Vector3();
  private readonly _right = new THREE.Vector3();
  private readonly _dPos = new THREE.Vector3();

  setInput(move: {x: number, y: number}, rotLift: {x: number, y: number}) {
      this.move = move;
      this.rotLift = rotLift;
  }

  update(dt: number) {
      const e = this.entityStore.selectedEntity();
      
      // Check if selection changed or lost
      if (e === null || e !== this.grabbedEntity) {
          if (this.isGrabbing) this.endGrab();
          this.grabbedEntity = e;
      }

      if (e === null) return;

      const hasLeft = Math.abs(this.move.x) > 0.01 || Math.abs(this.move.y) > 0.01;
      const hasRight = Math.abs(this.rotLift.x) > 0.01 || Math.abs(this.rotLift.y) > 0.01;
      
      if (!hasLeft && !hasRight) {
          if (this.isGrabbing) this.endGrab();
          return;
      }

      const mode = this.state.transformMode();
      const camera = this.scene.getCamera();
      if (!camera) return;

      if (mode === 'translate') {
          // Physics-based Drag
          if (!this.isGrabbing) this.startGrab(e);

          // Calculate Delta relative to Camera using Zero-Alloc scratch vectors
          const quat = camera.quaternion;
          
          this._forward.set(0, 0, -1).applyQuaternion(quat);
          this._right.set(1, 0, 0).applyQuaternion(quat);
          
          this._forward.y = 0; this._forward.normalize();
          this._right.y = 0; this._right.normalize();
          
          this._dPos.set(0, 0, 0);
          this._dPos.addScaledVector(this._right, this.move.x * this.MOVE_SPEED * dt);
          this._dPos.addScaledVector(this._forward, -this.move.y * this.MOVE_SPEED * dt); 
          this._dPos.y += this.rotLift.y * this.MOVE_SPEED * dt;

          this.grabTargetPos.add(this._dPos);
          this.physics.interaction.moveHand(this.grabTargetPos);

      } else if (mode === 'rotate') {
          // Direct manipulation for rotation
          const dRotY = -this.move.x * this.ROT_SPEED * dt;
          this.transformLogic.applyTransformDelta(e, {x:0, y:0, z:0}, dRotY, camera);
          
      } else if (mode === 'scale') {
          const dScale = this.rotLift.y * this.SCALE_SPEED * dt; 
          this.transformLogic.applyScaleDelta(e, dScale);
      }
  }

  private startGrab(entity: number) {
      const t = this.entityStore.world.transforms.get(entity);
      const rb = this.entityStore.world.rigidBodies.get(entity);
      if (!t || !rb) return;

      this.isGrabbing = true;
      this.grabbedEntity = entity;
      this.grabTargetPos.set(t.position.x, t.position.y, t.position.z);
      
      this.physics.interaction.startGrab(rb.handle, t.position);
  }

  private endGrab() {
      if (this.isGrabbing) {
          this.physics.interaction.endGrab();
          this.isGrabbing = false;
      }
  }
}
