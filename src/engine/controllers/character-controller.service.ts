
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { PhysicsService } from '../../services/physics.service';
import { CharacterPhysicsService, CharacterContext } from '../../services/character-physics.service';
import { SceneService } from '../../services/scene.service';
import { GameInputService } from '../../services/game-input.service';

@Injectable({
  providedIn: 'root'
})
export class CharacterControllerService {
  private physics = inject(PhysicsService);
  private charPhysics = inject(CharacterPhysicsService);
  private scene = inject(SceneService);
  private input = inject(GameInputService);

  private character: CharacterContext | null = null;
  private active = false;

  // Config
  private readonly HEIGHT = 1.7;
  private readonly RADIUS = 0.4;
  private readonly EYE_HEIGHT = 1.6;
  private readonly WALK_SPEED = 5;
  private readonly RUN_SPEED = 10;
  private readonly JUMP_VELOCITY = 5;
  
  // State
  private verticalVelocity = 0;
  private pitch = 0;
  private yaw = 0;
  
  // Head Bob State
  private bobTimer = 0;
  private bobFrequency = 10;
  private bobAmplitude = 0.08; 

  // Optimization: Scratch Vectors (Zero-Allocation)
  private readonly _vecForward = new THREE.Vector3();
  private readonly _vecRight = new THREE.Vector3();
  private readonly _vecMove = new THREE.Vector3();
  private readonly _vecDisp = new THREE.Vector3();
  private readonly _vecCam = new THREE.Vector3();
  private readonly _euler = new THREE.Euler(0, 0, 0, 'YXZ');
  private readonly _Y_AXIS = new THREE.Vector3(0, 1, 0);

  init(position: THREE.Vector3) {
    if (this.character) return;
    
    this.character = this.charPhysics.createCharacter(
        position.x, position.y + (this.HEIGHT/2), position.z, 
        this.RADIUS, this.HEIGHT
    );
    
    const cam = this.scene.getCamera();
    if (cam) {
        this._euler.setFromQuaternion(cam.quaternion, 'YXZ');
        this.yaw = this._euler.y;
        this.pitch = this._euler.x;
    }

    this.verticalVelocity = 0;
    this.bobTimer = 0;
    this.active = true;
  }

  destroy() {
    if (this.character) {
        this.charPhysics.destroyCharacter(this.character);
        this.character = null;
    }
    this.active = false;
  }

  update(dtMs: number) {
    if (!this.active || !this.character) return;

    const dt = dtMs / 1000;
    const camera = this.scene.getCamera();
    if (!camera) return;

    // 1. Look
    const look = this.input.getLookDelta();
    const sensitivity = 0.002;
    
    this.yaw -= look.x * sensitivity;
    this.pitch += look.y * sensitivity;
    
    this.pitch = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, this.pitch));

    // 2. Movement
    const moveInput = this.input.getMoveDir();
    const isRunning = this.input.getRun();
    const isMoving = Math.abs(moveInput.x) > 0.01 || Math.abs(moveInput.y) > 0.01;
    
    const speed = isRunning ? this.RUN_SPEED : this.WALK_SPEED;
    
    // Direction relative to Yaw
    // Reuse scratch vectors to avoid 'new THREE.Vector3()'
    this._vecForward.set(0, 0, -1).applyAxisAngle(this._Y_AXIS, this.yaw);
    this._vecRight.set(1, 0, 0).applyAxisAngle(this._Y_AXIS, this.yaw);
    
    this._vecMove.set(0, 0, 0)
        .addScaledVector(this._vecForward, moveInput.y)
        .addScaledVector(this._vecRight, moveInput.x);
        
    if (this._vecMove.lengthSq() > 0) this._vecMove.normalize();
    
    // 3. Jump & Gravity
    const grounded = this.charPhysics.isCharacterGrounded(this.character);
    
    if (grounded && this.verticalVelocity < 0) {
        this.verticalVelocity = -2; 
    }
    
    if (grounded && this.input.getJump()) {
        this.verticalVelocity = this.JUMP_VELOCITY;
    } else {
        this.verticalVelocity += -9.81 * dt; 
    }
    
    // 4. Compute Translation
    this._vecDisp.copy(this._vecMove).multiplyScalar(speed * dt);
    this._vecDisp.y = this.verticalVelocity * dt;

    // 5. Physics Step
    // Rapier expects a simple interface {x,y,z}, THREE.Vector3 satisfies this.
    this.charPhysics.moveCharacter(this.character, this._vecDisp, dt);
    
    // 6. Head Bobbing Calculation
    if (isMoving && grounded) {
        const currentFreq = isRunning ? this.bobFrequency * 1.5 : this.bobFrequency;
        this.bobTimer += dt * currentFreq;
    } else {
        this.bobTimer = 0;
    }
    
    const bobOffset = isMoving && grounded 
        ? Math.sin(this.bobTimer) * (isRunning ? this.bobAmplitude * 1.2 : this.bobAmplitude)
        : 0;

    // 7. Sync Camera
    // Optimized: Reuse _vecCam scratch vector to read position directly from physics wrapper
    if (this.physics.world.copyBodyPosition(this.character.bodyHandle, this._vecCam)) {
        // Apply offsets directly to the vector
        this._vecCam.y += this.EYE_HEIGHT - (this.HEIGHT/2) + bobOffset;
        camera.position.copy(this._vecCam);
        
        this._euler.set(this.pitch, this.yaw, 0, 'YXZ');
        camera.quaternion.setFromEuler(this._euler);
    }
  }
}
