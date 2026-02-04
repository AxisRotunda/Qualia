
import { Injectable, inject, signal, effect } from '@angular/core';
import * as THREE from 'three';
import { Ray } from '@dimforge/rapier3d-compat';
import { EngineStateService } from '../../engine-state.service';
import { PhysicsService } from '../../../services/physics.service';
import { TemplateFactoryService } from '../../../services/factories/template-factory.service';
import { EntityLibraryService } from '../../../services/entity-library.service';
import { EntityStoreService } from '../../ecs/entity-store.service';
import { SceneService } from '../../../services/scene.service';
import { GameInputService } from '../../../services/game-input.service';
import { VfxService } from '../vfx/vfx.service';
import { COMBAT_CONFIG, WeaponType } from './combat.config';
import { ViewModelAnimationService } from './view-model-animation.service';
import { AssetService } from '../../../services/asset.service';
import { MaterialService } from '../../../services/material.service';
import { CameraManagerService } from '../../graphics/camera-manager.service';
import { RaycasterService } from '../../../engine/interaction/raycaster.service';

@Injectable({
  providedIn: 'root'
})
export class WeaponService {
  private state = inject(EngineStateService);
  private physics = inject(PhysicsService);
  private entityStore = inject(EntityStoreService);
  private factory = inject(TemplateFactoryService);
  private lib = inject(EntityLibraryService);
  private scene = inject(SceneService);
  private input = inject(GameInputService);
  private vfx = inject(VfxService);
  private viewModel = inject(ViewModelAnimationService);
  private assetService = inject(AssetService);
  private materialService = inject(MaterialService);
  private cameraManager = inject(CameraManagerService);
  private raycaster = inject(RaycasterService);

  readonly equipped = signal<WeaponType>('blaster');
  readonly energy = signal(100);
  
  private cooldownTimer = 0;
  private rechargeDelayTimer = 0;
  private isSwinging = false;
  private meleeTimer = 0;
  private hitTriggered = false;
  private tpWeaponMesh: THREE.Object3D | null = null;
  private lastPlayerEntity: number | null = null;

  // RUN_OPT: Module-level scratch vectors
  private readonly _origin = new THREE.Vector3();
  private readonly _dir = new THREE.Vector3();
  private readonly _right = new THREE.Vector3();
  private readonly _up = new THREE.Vector3();
  private readonly _target = new THREE.Vector3();
  private readonly _spawnPos = new THREE.Vector3();
  private readonly _vel = new THREE.Vector3();
  private readonly _impulse = new THREE.Vector3();
  private readonly _quat = new THREE.Quaternion();
  private readonly _aimTarget = new THREE.Vector3();

  constructor() {
      this.viewModel.setWeapon('blaster');
      
      effect(() => {
          this.updateThirdPersonVisuals(this.state.playerEntity(), this.equipped());
      });
  }

  cycle() {
      if (this.isSwinging) return;
      const current = this.equipped();
      const next: WeaponType = current === 'blaster' ? 'pistol' : (current === 'pistol' ? 'fist' : (current === 'fist' ? 'hammer' : 'blaster'));
      this.equipped.set(next);
      this.viewModel.setWeapon(next);
      this.input.vibrate(10);
  }

  update(dt: number) {
      if (this.cooldownTimer > 0) this.cooldownTimer -= dt;
      
      if (this.rechargeDelayTimer > 0) {
          this.rechargeDelayTimer -= dt;
      } else if (this.energy() < 100) {
          const rechargeRate = COMBAT_CONFIG.SYSTEMS.RECHARGE_RATE * (dt / 1000);
          this.energy.update(e => Math.min(100, e + rechargeRate));
      }

      if (this.state.viewMode() === 'fp' && this.state.mode() === 'walk') {
          this.viewModel.update(dt, {
              lookDelta: this.input.virtualLook,
              moveInput: this.input.virtualMove,
              isMoving: Math.abs(this.input.virtualMove.x) > 0.1 || Math.abs(this.input.virtualMove.y) > 0.1
          }, {
              type: this.equipped(),
              isSwinging: this.isSwinging,
              swingProgress: this.isSwinging ? Math.min(1, this.meleeTimer / COMBAT_CONFIG.WEAPONS[this.equipped()].swingTime) : 0
          });
      }

      if (this.isSwinging) {
          this.meleeTimer += dt;
          this.updateSwingState();
      }
  }

  trigger() {
      const def = COMBAT_CONFIG.WEAPONS[this.equipped()];
      if (this.isSwinging || this.cooldownTimer > 0) return;
      
      if (this.energy() < def.energyCost) {
          this.input.vibrate([5, 40, 5]); 
          return;
      }

      this.cooldownTimer = def.cooldown;
      this.rechargeDelayTimer = COMBAT_CONFIG.SYSTEMS.RECHARGE_DELAY * 1000;
      this.energy.update(e => Math.max(0, e - def.energyCost));

      if (def.id === 'blaster' || def.id === 'pistol') {
          this.executeRangedAttack(def);
      } else {
          this.executeMeleeInitiation(def);
      }
  }

  private executeRangedAttack(def: any) {
      const cam = this.scene.getCamera();
      if (!cam) return;

      // 1. Calculate Convergence Point (Where the reticle points)
      const hit = this.raycaster.raycastTacticalCenter();
      if (hit) {
          this._aimTarget.copy(cam.position).addScaledVector(cam.getWorldDirection(this._dir), hit.distance);
      } else {
          this._aimTarget.copy(cam.position).addScaledVector(cam.getWorldDirection(this._dir), 500);
      }

      // 2. Resolve Muzzle Position
      this.resolveMuzzleGeometry(cam);
      
      // 3. Calculate Firing Vector (From muzzle to converge point)
      this._dir.subVectors(this._aimTarget, this._origin).normalize();

      this.vfx.emitMuzzleFlash(this._origin, this._dir, def.color);
      this.vfx.emitLightFlash(this._origin, def.color, 4.0, 8.0, 0.1);
      
      // Tracer line for travel visualization
      this.vfx.emitTracer(this._origin, this._aimTarget, def.color);
      
      // Shell Ejection
      if (def.shellEject) {
          // Right and Up relative to camera
          this._right.set(1, 0, 0).applyQuaternion(cam.quaternion);
          this._up.set(0, 1, 0).applyQuaternion(cam.quaternion);
          // Eject slightly right of muzzle
          const ejectPos = this._origin.clone().addScaledVector(this._right, 0.1);
          this.vfx.emitShell(ejectPos, this._right, this._up);
      }
      
      this.fireProjectile(this._origin, this._dir, def);
      
      this.viewModel.applyRecoil(def.kickBack || 0.1, def.kickUp || 0.1);
      this.cameraManager.shake(def.shake || 0.05);
      this.input.vibrate(def.haptic || 20);
  }

  private executeMeleeInitiation(def: any) {
      this.isSwinging = true;
      this.meleeTimer = 0;
      this.hitTriggered = false;
      this.input.vibrate(10);
  }

  private fireProjectile(origin: THREE.Vector3, dir: THREE.Vector3, def: any) {
      const tpl = this.lib.getTemplate('projectile-plasma');
      if (!tpl) return;

      this._spawnPos.copy(origin);
      this._quat.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
      
      const ent = this.factory.spawn(this.entityStore, tpl, this._spawnPos, this._quat);
      const meshRef = this.entityStore.world.meshes.get(ent);
      if (meshRef) {
          // Elongated bolt look
          meshRef.mesh.scale.set(0.1, 0.1, 1.5); 
          if (def.id === 'pistol') {
              // Smaller bullet
              meshRef.mesh.scale.set(0.05, 0.05, 0.8);
              (meshRef.mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0xffaa00);
          }
      }

      this.entityStore.world.projectiles.add(ent, { 
          damage: def.damage, 
          impulse: def.impulse, 
          life: 5.0, 
          ownerId: this.state.playerEntity() || -1 
      });
      
      const rb = this.entityStore.world.rigidBodies.get(ent);
      if (rb && this.physics.rWorld) {
          const body = this.physics.rWorld.getRigidBody(rb.handle);
          if (body) {
              this._vel.copy(dir).multiplyScalar(def.projectileSpeed);
              body.setLinvel(this._vel, true);
              body.enableCcd(true); 
              // Configurable gravity for ballistics
              body.setGravityScale(def.gravityScale !== undefined ? def.gravityScale : 0.01, true); 
          }
      }
  }

  private updateSwingState() {
      const def = COMBAT_CONFIG.WEAPONS[this.equipped()];
      if (!this.hitTriggered && this.meleeTimer >= def.hitTime) {
          this.hitTriggered = true;
          this.resolveMeleeHit();
          this.viewModel.applyRecoil(def.kickBack || 0.1, def.kickUp || 0.1); 
          this.cameraManager.shake(def.shake || 0.15);
      }
      if (this.meleeTimer >= def.swingTime) {
          this.isSwinging = false;
      }
  }

  private resolveMeleeHit() {
      const cam = this.scene.getCamera();
      if (!cam) return;
      
      this.resolveMuzzleGeometry(cam);
      const def = COMBAT_CONFIG.WEAPONS[this.equipped()];
      
      const ray = new Ray(this._origin, this._dir);
      const hit = this.physics.world.rWorld?.castRayAndGetNormal(ray, def.range || 3.0, true);
      
      if (hit && hit.collider) {
          const body = hit.collider.parent();
          this._target.copy(this._origin).addScaledVector(this._dir, hit.timeOfImpact);
          this._right.set(hit.normal.x, hit.normal.y, hit.normal.z);
          
          const entityId = this.physics.registry.getEntityId(body?.handle || -1);
          const props = entityId !== undefined ? this.entityStore.world.physicsProps.get(entityId) : undefined;
          
          this.vfx.emitImpact(this._target, this._right, props?.materialType, def.color);
          
          if (body && body.isDynamic()) {
              this._impulse.copy(this._dir).multiplyScalar(def.impulse);
              body.applyImpulseAtPoint(this._impulse, this._target, true);
              if (entityId !== undefined) {
                  this.entityStore.world.integrity.applyDamage(entityId, def.damage);
                  this.state.triggerHitMarker();
              }
          }
          this.input.vibrate(def.haptic || 30);
      }
  }

  private resolveMuzzleGeometry(cam: THREE.Camera) {
      cam.getWorldPosition(this._origin);
      cam.getWorldDirection(this._dir);
      
      if (this.state.viewMode() === 'fp') {
          this._right.set(1, 0, 0).applyQuaternion(cam.quaternion);
          this._origin.addScaledVector(this._right, 0.45).addScaledVector(this._dir, 0.8);
      } else {
          this._origin.addScaledVector(this._dir, 2.5);
      }
  }

  private updateThirdPersonVisuals(playerEntity: number | null, weaponType: WeaponType) {
      if (playerEntity !== this.lastPlayerEntity) { 
          this.tpWeaponMesh = null; 
          this.lastPlayerEntity = playerEntity; 
      }
      
      if (playerEntity === null) return;
      
      const meshRef = this.entityStore.world.meshes.get(playerEntity);
      if (!meshRef) return;
      
      let hand = meshRef.mesh.getObjectByName('TP_Weapon_Mount');
      if (!hand) { 
          hand = new THREE.Group(); 
          hand.name = 'TP_Weapon_Mount'; 
          hand.position.set(0.3, 1.2, 0.4); 
          meshRef.mesh.add(hand); 
      }
      
      if (this.tpWeaponMesh) { 
          hand.remove(this.tpWeaponMesh); 
          this.tpWeaponMesh = null; 
      }
      
      if (weaponType !== 'fist') {
          let meshId = 'gen-weapon-blaster';
          if (weaponType === 'hammer') meshId = 'gen-weapon-hammer';
          if (weaponType === 'pistol') meshId = 'gen-weapon-pistol';

          this.tpWeaponMesh = new THREE.Mesh(
              this.assetService.getGeometry(meshId), 
              this.materialService.getMaterial(this.assetService.getAssetMaterials(meshId) as any) as any
          );
          this.tpWeaponMesh.scale.setScalar(0.75); 
          hand.add(this.tpWeaponMesh);
      }
  }
}
