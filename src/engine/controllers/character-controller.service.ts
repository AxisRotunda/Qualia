
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { PhysicsService } from '../../services/physics.service';
import { CharacterPhysicsService, CharacterContext } from '../../services/character-physics.service';
import { SceneService } from '../../services/scene.service';
import { GameInputService } from '../../services/game-input.service';
import { EntityAssemblerService } from '../ecs/entity-assembler.service';
import { EngineStateService } from '../engine-state.service';
import { EntityStoreService } from '../ecs/entity-store.service';
import { WeaponService } from '../features/combat/weapon.service';
import { LayoutService } from '../../services/ui/layout.service';
import { CameraManagerService } from '../graphics/camera-manager.service';

/**
 * CharacterControllerService: Primary locomotion engine.
 * Refactored Phase 86.0: Implements Dynamic Stance (Crouch) and Navigation Hardening.
 */
@Injectable({
  providedIn: 'root'
})
export class CharacterControllerService {
  private physics = inject(PhysicsService);
  private charPhysics = inject(CharacterPhysicsService);
  private scene = inject(SceneService);
  private gameInput = inject(GameInputService);
  private assembler = inject(EntityAssemblerService);
  private state = inject(EngineStateService);
  private entityStore = inject(EntityStoreService);
  private weaponService = inject(WeaponService);
  private layout = inject(LayoutService);
  private cameraManager = inject(CameraManagerService);

  private character: CharacterContext | null = null;
  private active = false;

  // Stance Constants
  private readonly RADIUS = 0.4;
  private readonly STAND_HEIGHT = 1.8;
  private readonly STAND_EYE = 1.65;
  private readonly CROUCH_HEIGHT = 1.1;
  private readonly CROUCH_EYE = 0.85;

  private currentEyeHeight = 1.65;
  private eyeHeightVel = 0; 
  
  private readonly NECK_OFFSET_FORWARD = 0.12; 
  
  private readonly WALK_SPEED = 5;
  private readonly RUN_SPEED = 10;
  private readonly CROUCH_SPEED = 2.2;
  private readonly FOCUS_SPEED = 2.5; 
  private readonly JUMP_VELOCITY = 6.0;
  private readonly TURN_SMOOTHING = 25.0; 
  private readonly TERMINAL_VELOCITY = -55.0; 
  
  // Locomotion Inertia (AAA Standard)
  private readonly GROUND_ACCEL = 10.0;
  private readonly GROUND_DECEL = 12.0;
  
  // Rotational Inertia (Damping for Mobile Look)
  private readonly LOOK_SMOOTHING = 22.0; 
  
  private readonly TP_DISTANCE = 4.5;
  private readonly CAM_DAMPING = 12.0; 
  private readonly LEAN_MAX = 0.055; 
  private readonly BOB_SPEED_MULT = 1.8;
  
  private verticalVelocity = 0;
  private readonly horizontalVelocity = new THREE.Vector3();
  
  private pitch = 0;
  private yaw = 0;
  private lookVel = { x: 0, y: 0 }; 

  private targetYaw = 0;
  private currentYaw = 0;
  private currentLean = 0;
  private bobTime = 0;
  private wasGrounded = false;

  // Scratch objects
  private readonly _vecMove = new THREE.Vector3();
  private readonly _vecDisp = new THREE.Vector3();
  private readonly _vecCamPos = new THREE.Vector3(); 
  private readonly _vecTargetPos = new THREE.Vector3(); 
  private readonly _vecFwd = new THREE.Vector3();
  private readonly _vecRgt = new THREE.Vector3();
  private readonly _euler = new THREE.Euler(0, 0, 0, 'YXZ');
  private readonly _Y_AXIS = new THREE.Vector3(0, 1, 0);

  init(position: THREE.Vector3) {
    if (this.character) return;
    const bodyDef = this.charPhysics.createCharacterDef(position.x, position.y + (this.STAND_HEIGHT / 2), position.z, this.RADIUS, this.STAND_HEIGHT);
    const entityId = this.assembler.createEntityFromDef(bodyDef, { meshId: 'robot-actor' }, { name: 'SYSTEM_ACTOR', tags: ['player', 'hero'], isStatic: false });
    this.state.setPlayerEntity(entityId);
    this.character = { controller: this.charPhysics.createController(), bodyDef, entityId };
    
    const cam = this.scene.getCamera();
    if (cam) {
        this._euler.setFromQuaternion(cam.quaternion, 'YXZ');
        this.yaw = this._euler.y;
        this.pitch = this._euler.x;
        this.targetYaw = this.yaw;
        this.currentYaw = this.yaw;
    }
    
    this.currentEyeHeight = this.STAND_EYE;
    this.verticalVelocity = 0;
    this.horizontalVelocity.set(0, 0, 0);
    this.lookVel = { x: 0, y: 0 };
    this.active = true;
  }

  destroy() {
    if (this.character) {
        this.assembler.destroyEntity(this.character.entityId);
        this.charPhysics.destroyCharacter(this.character);
        this.state.setPlayerEntity(null);
        this.character = null;
    }
    this.active = false;
    this.cameraManager.setFovOffset(0);
    this.cameraManager.setRoll(0);
  }

  update(dtMs: number) {
    if (!this.active || !this.character) return;
    const dt = dtMs / 1000;
    const camera = this.scene.getCamera();
    const meshRef = this.entityStore.world.meshes.get(this.character.entityId);
    if (!camera) return;

    const isAiming = this.gameInput.getAim();
    this.state.setAiming(isAiming);

    const isCrouching = this.gameInput.getCrouch();
    if (isCrouching !== this.state.isCrouching()) {
        this.state.setCrouching(isCrouching);
        // Resize physics hitbox
        const targetH = isCrouching ? this.CROUCH_HEIGHT : this.STAND_HEIGHT;
        this.charPhysics.updateCharacterHeight(this.character, this.RADIUS, targetH);
    }

    const viewMode = this.state.viewMode();
    const reducedMotion = this.layout.reducedMotion();

    // 1. Look Input
    const lookInput = this.gameInput.getLookDelta(dt);
    const sensitivityMult = (this.layout.isMobile() ? 2.5 : 1.0) * (isAiming ? 0.6 : 1.0);
    const baseSensitivity = 0.0022;
    const finalSensitivity = baseSensitivity * sensitivityMult;

    this.lookVel.x = THREE.MathUtils.lerp(this.lookVel.x, -lookInput.x * finalSensitivity, 1.0 - Math.exp(-this.LOOK_SMOOTHING * dt));
    this.lookVel.y = THREE.MathUtils.lerp(this.lookVel.y, -lookInput.y * finalSensitivity, 1.0 - Math.exp(-this.LOOK_SMOOTHING * dt));

    this.yaw += this.lookVel.x;
    this.pitch += this.lookVel.y; 
    this.pitch = THREE.MathUtils.clamp(this.pitch, -Math.PI/2 + 0.1, Math.PI/2 - 0.1);

    // 2. Locomotion Input
    const moveInput = this.gameInput.getMoveDir();
    const isRunning = this.gameInput.getRun() && !isAiming && !isCrouching;
    
    let targetSpeed = this.WALK_SPEED;
    if (isAiming) targetSpeed = this.FOCUS_SPEED;
    else if (isCrouching) targetSpeed = this.CROUCH_SPEED;
    else if (isRunning) targetSpeed = this.RUN_SPEED;
    
    this._vecFwd.set(0, 0, -1).applyAxisAngle(this._Y_AXIS, this.yaw);
    this._vecRgt.set(1, 0, 0).applyAxisAngle(this._Y_AXIS, this.yaw);
    this._vecMove.set(0, 0, 0).addScaledVector(this._vecFwd, moveInput.y).addScaledVector(this._vecRgt, moveInput.x);
    if (this._vecMove.lengthSq() > 1) this._vecMove.normalize();
    
    // 3. Physics State & Inertia
    const grounded = this.charPhysics.isCharacterGrounded(this.character);
    if (grounded && !this.wasGrounded) {
        const fallImpact = Math.abs(this.verticalVelocity);
        if (fallImpact > 6.0) {
            this.cameraManager.shake(Math.min(1.0, fallImpact / 20.0) * 0.7);
            this.gameInput.vibrate(25);
            this.bobTime += 0.5;
        }
    }
    this.wasGrounded = grounded;

    const rate = (this._vecMove.lengthSq() > 0.01) ? this.GROUND_ACCEL : this.GROUND_DECEL;
    const lerpFactor = 1.0 - Math.exp(-rate * dt);
    
    const targetVel = this._vecMove.clone().multiplyScalar(targetSpeed);
    this.horizontalVelocity.lerp(targetVel, lerpFactor);

    // 4. Vertical Dynamics
    if (grounded) {
        if (this.verticalVelocity < 0) this.verticalVelocity = -2; 
        if (this.gameInput.getJump() && !isCrouching) {
            this.verticalVelocity = this.JUMP_VELOCITY;
            this.gameInput.vibrate(15);
        }
    } else {
        this.verticalVelocity += this.state.gravityY() * dt;
        this.verticalVelocity = Math.max(this.TERMINAL_VELOCITY, this.verticalVelocity);
    }
    
    // 5. Final Move Execution
    this._vecDisp.copy(this.horizontalVelocity).multiplyScalar(dt);
    this._vecDisp.y = this.verticalVelocity * dt;
    this.charPhysics.moveCharacter(this.character, this._vecDisp, dt);
    
    // 6. Camera VFX (Eye-Level Spring)
    const targetEyeHeight = isCrouching ? this.CROUCH_EYE : this.STAND_EYE;
    
    // Spring Damping for stance changes
    const springK = 250.0;
    const springD = 22.0;
    const force = (targetEyeHeight - this.currentEyeHeight) * springK;
    this.eyeHeightVel += (force - this.eyeHeightVel * springD) * dt;
    this.currentEyeHeight += this.eyeHeightVel * dt;

    if (viewMode === 'fp' && !reducedMotion) {
        this.currentLean = THREE.MathUtils.lerp(this.currentLean, -moveInput.x * this.LEAN_MAX, dt * 8);
        this.cameraManager.setRoll(this.currentLean);
        
        const speed = this.horizontalVelocity.length();
        if (grounded && speed > 0.5) {
            const bobScale = isCrouching ? 0.4 : 1.0;
            this.bobTime += dt * speed * this.BOB_SPEED_MULT;
            this._vecTargetPos.set(
                Math.cos(this.bobTime * 0.5) * 0.04 * bobScale, 
                this.currentEyeHeight + Math.sin(this.bobTime) * 0.06 * bobScale, 
                0
            );
        } else {
            this.bobTime = THREE.MathUtils.lerp(this.bobTime, 0, dt * 5);
            this._vecTargetPos.set(0, this.currentEyeHeight, 0);
        }
        
        const fovOffset = isAiming ? -15 : (isRunning && speed > 8 ? 8 : 0);
        this.cameraManager.setFovOffset(fovOffset);
    } else {
        this.cameraManager.setRoll(0);
        this._vecTargetPos.set(0, this.currentEyeHeight, 0);
        this.cameraManager.setFovOffset(0);
    }

    // 7. Visual Sync
    if (this.physics.world.copyBodyPosition(this.character.bodyDef.handle, this._vecCamPos)) {
        if (meshRef) {
            if (this.horizontalVelocity.lengthSq() > 0.1) {
                this.targetYaw = Math.atan2(this.horizontalVelocity.x, this.horizontalVelocity.z) + Math.PI;
                let delta = this.targetYaw - this.currentYaw;
                while (delta > Math.PI) delta -= Math.PI * 2;
                while (delta < -Math.PI) delta += Math.PI * 2;
                this.currentYaw += delta * this.TURN_SMOOTHING * dt;
            }
            meshRef.mesh.quaternion.setFromAxisAngle(this._Y_AXIS, this.currentYaw);
            
            // Physical Mesh Stance
            const targetMeshScale = isCrouching ? 0.6 : 1.0;
            meshRef.mesh.scale.y = THREE.MathUtils.lerp(meshRef.mesh.scale.y, targetMeshScale, dt * 10);
        }
        
        if (viewMode === 'fp') {
            this._euler.set(this.pitch, this.yaw, 0, 'YXZ');
            camera.quaternion.setFromEuler(this._euler);
            this._vecFwd.set(0, 0, -this.NECK_OFFSET_FORWARD).applyQuaternion(camera.quaternion);
            camera.position.copy(this._vecCamPos).add(this._vecTargetPos).add(this._vecFwd);
        } else {
            this._euler.set(this.pitch, this.yaw, 0, 'YXZ');
            const orbitQuat = new THREE.Quaternion().setFromEuler(this._euler);
            const lookAtPoint = this._vecCamPos.clone().add(new THREE.Vector3(0, this.currentEyeHeight, 0));
            const idealPos = lookAtPoint.clone().add(new THREE.Vector3(0, 0, this.TP_DISTANCE).applyQuaternion(orbitQuat));
            
            camera.position.lerp(idealPos, 1.0 - Math.exp(-this.CAM_DAMPING * dt));
            camera.lookAt(lookAtPoint);
        }
    }
    
    if (this.gameInput.getFire()) this.weaponService.trigger();
  }
}
