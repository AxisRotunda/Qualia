
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { PhysicsService } from './physics.service';
import { CharacterPhysicsService, CharacterContext } from './character-physics.service';
import { SceneService } from './scene.service';
import { GameInputService } from './game-input.service';

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

  init(position: THREE.Vector3) {
    if (this.character) return;
    
    // Create physics representation
    this.character = this.charPhysics.createCharacter(
        position.x, position.y + (this.HEIGHT/2), position.z, 
        this.RADIUS, this.HEIGHT
    );
    
    // Sync initial rotation from camera
    const cam = this.scene.getCamera();
    const euler = new THREE.Euler().setFromQuaternion(cam.quaternion, 'YXZ');
    this.yaw = euler.y;
    this.pitch = euler.x;

    this.verticalVelocity = 0;
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

    // 1. Look (Mouse)
    const mouseDelta = this.input.getAndResetMouseDelta();
    const sensitivity = 0.002;
    
    this.yaw -= mouseDelta.x * sensitivity;
    this.pitch -= mouseDelta.y * sensitivity;
    // Clamp pitch
    this.pitch = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, this.pitch));

    // 2. Movement (WASD)
    const xInput = this.input.getAxis('KeyA', 'KeyD');
    const zInput = this.input.getAxis('KeyW', 'KeyS');
    const isRunning = this.input.isPressed('ShiftLeft');
    
    const speed = isRunning ? this.RUN_SPEED : this.WALK_SPEED;
    
    // Direction relative to Yaw
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0,1,0), this.yaw);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0,1,0), this.yaw);
    
    const moveDir = new THREE.Vector3()
        .addScaledVector(forward, zInput)
        .addScaledVector(right, xInput);
        
    if (moveDir.lengthSq() > 0) moveDir.normalize();
    
    // 3. Jump & Gravity
    const grounded = this.charPhysics.isCharacterGrounded(this.character);
    
    if (grounded && this.verticalVelocity < 0) {
        this.verticalVelocity = -2; // Stick to ground
    }
    
    if (grounded && this.input.isPressed('Space')) {
        this.verticalVelocity = this.JUMP_VELOCITY;
    } else {
        // Apply Gravity
        this.verticalVelocity += -9.81 * dt; // Using Earth gravity constant for consistent feel
    }
    
    // 4. Compute Translation
    const displacement = moveDir.multiplyScalar(speed * dt);
    displacement.y = this.verticalVelocity * dt;

    // 5. Physics Step
    this.charPhysics.moveCharacter(this.character, displacement, dt);

    // 6. Sync Camera
    const pose = this.physics.getBodyPose(this.character.bodyHandle);
    if (pose) {
        // Camera at Eye Height
        const camPos = new THREE.Vector3(pose.p.x, pose.p.y + this.EYE_HEIGHT - (this.HEIGHT/2), pose.p.z);
        camera.position.copy(camPos);
        
        // Rotation
        camera.quaternion.setFromEuler(new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ'));
    }
  }
}
