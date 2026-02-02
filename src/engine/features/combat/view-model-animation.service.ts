
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { AssetService } from '../../../services/asset.service';
import { MaterialService } from '../../../services/material.service';
import { SceneService } from '../../../services/scene.service';
import { LayoutService } from '../../../services/ui/layout.service';
import { COMBAT_CONFIG, WeaponType, WeaponAnimationType } from './combat.config';

export interface ViewModelInput {
    lookDelta: { x: number, y: number };
    moveInput: { x: number, y: number };
    isMoving: boolean;
}

export interface WeaponState {
    type: WeaponType;
    isSwinging: boolean;
    swingProgress: number; 
}

@Injectable({
  providedIn: 'root'
})
export class ViewModelAnimationService {
  private assetService = inject(AssetService);
  private materialService = inject(MaterialService);
  private scene = inject(SceneService);
  private layout = inject(LayoutService);

  public readonly group = new THREE.Group();
  private currentMesh: THREE.Object3D | null = null;

  // Kinetic State
  private recoil = {
      pos: new THREE.Vector3(),
      target: new THREE.Vector3()
  };

  private smoothLook = { x: 0, y: 0 };
  private simTime = 0;

  // RUN_OPT: Scratch objects
  private readonly _swayPos = new THREE.Vector3();
  private readonly _swayRot = new THREE.Euler();
  private readonly _bobPos = new THREE.Vector3();
  private readonly _procPos = new THREE.Vector3(); 
  private readonly _procRot = new THREE.Euler();   
  private readonly _finalPos = new THREE.Vector3();

  constructor() {
      this.group.name = 'ViewModel_Container';
      this.group.renderOrder = 999;
  }

  setWeapon(type: WeaponType) {
      if (this.currentMesh) {
          this.group.remove(this.currentMesh);
          this.currentMesh = null;
      }

      const def = COMBAT_CONFIG.WEAPONS[type];
      let meshId = 'gen-weapon-blaster';
      if (type === 'hammer') meshId = 'gen-weapon-hammer';
      if (type === 'fist') meshId = 'gen-weapon-fist';

      const geometry = this.assetService.getGeometry(meshId);
      const matDef = this.assetService.getAssetMaterials(meshId);
      
      let material: THREE.Material | THREE.Material[];
      if (Array.isArray(matDef)) {
          material = matDef.map(id => this.materialService.getMaterial(id) as THREE.Material);
      } else {
          material = this.materialService.getMaterial(matDef) as THREE.Material;
      }

      this.currentMesh = new THREE.Mesh(geometry, material);

      if (this.currentMesh) {
          this.currentMesh.scale.setScalar(def.viewScale);
          this.currentMesh.position.set(def.viewOffset.x, def.viewOffset.y, def.viewOffset.z);
          this.currentMesh.rotation.set(0, Math.PI, 0);
          
          this.currentMesh.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                  child.castShadow = false;
                  child.receiveShadow = false;
                  child.renderOrder = 999;
                  child.frustumCulled = false;
              }
          });

          this.group.add(this.currentMesh);
      }
  }

  applyRecoil(kickBack: number, kickUp: number) {
      const scale = this.layout.reducedMotion() ? 0.3 : 1.0;
      
      // RUN_INDUSTRY: Recoil is directed and slightly randomized per fire
      this.recoil.target.z += kickBack * scale;
      this.recoil.target.y -= kickUp * 0.4 * scale;
      this.recoil.target.x += (Math.random() - 0.5) * 0.15 * scale;
  }

  update(dt: number, input: ViewModelInput, state: WeaponState) {
      if (!this.currentMesh) return;

      const cam = this.scene.getCamera();
      if (this.group.parent !== cam) {
          cam.add(this.group);
      }

      const dtSec = dt / 1000;
      this.simTime += dtSec;

      const cfg = COMBAT_CONFIG.VIEW_MODEL;
      const def = COMBAT_CONFIG.WEAPONS[state.type];
      const reducedMotion = this.layout.reducedMotion();

      // 1. Inertial Sway
      if (!reducedMotion) {
          this.updateSway(dtSec, input.lookDelta, cfg);
      } else {
          this._swayPos.set(0, 0, 0);
          this._swayRot.set(0, 0, 0);
      }

      // 2. Locomotion Bob
      this.updateBob(this.simTime, input.isMoving && !reducedMotion, cfg);
      
      // 3. Kinetic Recoil
      this.updateRecoil(dtSec, cfg);
      
      // 4. Procedural Action Curves (Swings/Thrusts)
      this.updateActionCurve(state.isSwinging, state.swingProgress, def.animationType);

      // 5. Matrix Composition
      this._finalPos.set(
          def.viewOffset.x + this._bobPos.x + this.recoil.pos.x + this._swayPos.x + this._procPos.x,
          def.viewOffset.y + this._bobPos.y + this.recoil.pos.y + this._swayPos.y + this._procPos.y,
          def.viewOffset.z + this.recoil.pos.z + this._procPos.z 
      );

      this.currentMesh.position.copy(this._finalPos);

      // Rotation combines recoil pitch and sway yaw
      this.currentMesh.rotation.set(
          this.recoil.pos.y * 2.8 + this._swayRot.x + this._procRot.x,
          Math.PI + this.recoil.pos.x * 2.8 + this._swayRot.y + this._procRot.y,
          this._swayRot.z + this._procRot.z + (this.recoil.pos.x * 5.0) 
      );
  }

  private updateSway(dtSec: number, look: {x:number, y:number}, cfg: any) {
      this.smoothLook.x = THREE.MathUtils.lerp(this.smoothLook.x, look.x, dtSec * cfg.SWAY_SMOOTHING);
      this.smoothLook.y = THREE.MathUtils.lerp(this.smoothLook.y, look.y, dtSec * cfg.SWAY_SMOOTHING);

      this._swayPos.set(-this.smoothLook.x * cfg.SWAY_AMOUNT, -this.smoothLook.y * cfg.SWAY_AMOUNT, 0);
      this._swayRot.set(this.smoothLook.y * cfg.SWAY_AMOUNT * 2.0, this.smoothLook.x * cfg.SWAY_AMOUNT * 2.5, this.smoothLook.x * cfg.SWAY_AMOUNT * 1.5);
  }

  private updateBob(simTime: number, isMoving: boolean, cfg: any) {
      if (isMoving) {
          this._bobPos.y = Math.sin(simTime * cfg.BOB_FREQ) * cfg.BOB_AMP;
          this._bobPos.x = Math.cos(simTime * cfg.BOB_FREQ * 0.5) * cfg.BOB_AMP;
      } else {
          this._bobPos.lerp(new THREE.Vector3(), 0.15);
      }
  }

  private updateRecoil(dtSec: number, cfg: any) {
      const snap = cfg.RECOIL_SNAP * 60.0;
      const ret = cfg.RECOIL_RETURN * 60.0;

      // Snap target
      this.recoil.pos.x = THREE.MathUtils.damp(this.recoil.pos.x, this.recoil.target.x, snap, dtSec);
      this.recoil.pos.y = THREE.MathUtils.damp(this.recoil.pos.y, this.recoil.target.y, snap, dtSec);
      this.recoil.pos.z = THREE.MathUtils.damp(this.recoil.pos.z, this.recoil.target.z, snap, dtSec);

      // Return target to zero
      this.recoil.target.x = THREE.MathUtils.damp(this.recoil.target.x, 0, ret, dtSec);
      this.recoil.target.y = THREE.MathUtils.damp(this.recoil.target.y, 0, ret, dtSec);
      this.recoil.target.z = THREE.MathUtils.damp(this.recoil.target.z, 0, ret, dtSec);
  }

  private updateActionCurve(active: boolean, t: number, type: WeaponAnimationType) {
      this._procPos.set(0, 0, 0);
      this._procRot.set(0, 0, 0);
      if (!active) return;

      if (type === 'thrust') {
          if (t < 0.25) {
              const wt = t / 0.25;
              this._procPos.z = 0.25 * (wt * wt);
          } else if (t < 0.45) {
              const st = (t - 0.25) / 0.2;
              const curve = 1 - Math.pow(1 - st, 4);
              this._procPos.z = THREE.MathUtils.lerp(0.25, -0.9, curve);
              this._procRot.z = Math.sin(st * Math.PI) * 0.3;
          } else {
              const rt = (t - 0.45) / 0.55;
              const ease = rt * rt * (3 - 2 * rt);
              this._procPos.z = THREE.MathUtils.lerp(-0.9, 0, ease);
          }
      } else if (type === 'swing') {
          if (t < 0.4) {
              const wt = t / 0.4;
              const curve = wt * wt;
              this._procPos.set(0.15 * curve, 0.15 * curve, 0.3 * curve);
              this._procRot.set(-0.4 * curve, -0.2 * curve, 0.4 * curve);
          } else if (t < 0.6) {
              const st = (t - 0.4) / 0.2;
              const curve = st * st * st;
              this._procPos.x = THREE.MathUtils.lerp(0.15, -0.3, curve);
              this._procPos.y = THREE.MathUtils.lerp(0.15, -0.5, curve);
              this._procPos.z = THREE.MathUtils.lerp(0.3, -0.8, curve);
              this._procRot.x = THREE.MathUtils.lerp(-0.4, 0.8, curve);
              this._procRot.y = THREE.MathUtils.lerp(-0.2, 0.6, curve);
              this._procRot.z = THREE.MathUtils.lerp(0.4, -0.8, curve);
          } else {
              const rt = (t - 0.6) / 0.4;
              const ease = 1 - Math.pow(1 - rt, 2);
              this._procPos.x = THREE.MathUtils.lerp(-0.3, 0, ease);
              this._procPos.y = THREE.MathUtils.lerp(-0.5, 0, ease);
              this._procPos.z = THREE.MathUtils.lerp(-0.8, 0, ease);
              this._procRot.x = THREE.MathUtils.lerp(0.8, 0, ease);
              this._procRot.y = THREE.MathUtils.lerp(0.6, 0, ease);
              this._procRot.z = THREE.MathUtils.lerp(-0.8, 0, ease);
          }
      }
  }
}
