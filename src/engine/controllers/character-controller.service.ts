
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

  init(position: THREE.Vector3) {
    if (this.character) return;
    
    this.character = this.charPhysics.createCharacter(
        position.x, position.y + (this.HEIGHT/2), position.z, 
        this.RADIUS, this.HEIGHT
    );
    
    const cam = this.scene.getCamera();
    if (cam) {
        const euler = new THREE.Euler().setFromQuaternion(cam.quaternion, 'YXZ');
        this.yaw = euler.y;
        this.pitch = euler.x;
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
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0,1,0), this.yaw);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0,1,0), this.yaw);
    
    const moveDir = new THREE.Vector3()
        .addScaledVector(forward, moveInput.y)
        .addScaledVector(right, moveInput.x);
        
    if (moveDir.lengthSq() > 0) moveDir.normalize();
    
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
    const displacement = moveDir.clone().multiplyScalar(speed * dt);
    displacement.y = this.verticalVelocity * dt;

    // 5. Physics Step
    this.charPhysics.moveCharacter(this.character, displacement, dt);
    
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
    // FIXED: Use physics.world.getBodyPose
    const pose = this.physics.world.getBodyPose(this.character.bodyHandle);
    if (pose) {
        const camPos = new THREE.Vector3(
            pose.p.x, 
            pose.p.y + this.EYE_HEIGHT - (this.HEIGHT/2) + bobOffset, 
            pose.p.z
        );
        camera.position.copy(camPos);
        camera.quaternion.setFromEuler(new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ'));
    }
  }
}
