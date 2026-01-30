
import { Injectable, inject } from '@angular/core';
import { EngineStateService } from '../engine-state.service';
import { EntityManager } from '../entity-manager.service';
import { SceneService } from '../../services/scene.service';
import { TransformLogicService } from '../logic/transform-logic.service';
import { PhysicsService } from '../../services/physics.service';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class ObjectManipulationService {
  private state = inject(EngineStateService);
  private entityMgr = inject(EntityManager);
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

  setInput(move: {x: number, y: number}, rotLift: {x: number, y: number}) {
      this.move = move;
      this.rotLift = rotLift;
  }

  update(dt: number) {
      const e = this.entityMgr.selectedEntity();
      
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

          // Calculate Delta relative to Camera
          const quat = camera.quaternion;
          const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(quat);
          const right = new THREE.Vector3(1, 0, 0).applyQuaternion(quat);
          
          forward.y = 0; forward.normalize();
          right.y = 0; right.normalize();
          
          const dPos = new THREE.Vector3();
          dPos.addScaledVector(right, this.move.x * this.MOVE_SPEED * dt);
          dPos.addScaledVector(forward, -this.move.y * this.MOVE_SPEED * dt); 
          dPos.y += this.rotLift.y * this.MOVE_SPEED * dt;

          this.grabTargetPos.add(dPos);
          this.physics.moveGrabbed(this.grabTargetPos);

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
      const t = this.entityMgr.world.transforms.get(entity);
      const rb = this.entityMgr.world.rigidBodies.get(entity);
      if (!t || !rb) return;

      this.isGrabbing = true;
      this.grabbedEntity = entity;
      this.grabTargetPos.set(t.position.x, t.position.y, t.position.z);
      
      this.physics.grabBody(rb.handle, t.position);
  }

  private endGrab() {
      if (this.isGrabbing) {
          this.physics.releaseGrab();
          this.isGrabbing = false;
      }
  }
}
