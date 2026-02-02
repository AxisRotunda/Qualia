
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { GameSystem } from '../system';
import { MaterialService } from '../../services/material.service';
import { EngineStateService } from '../engine-state.service';
import { EnvironmentManagerService } from '../graphics/environment-manager.service';
import { PhysicsService } from '../../services/physics.service';
import { EntityStoreService } from '../ecs/entity-store.service';
import { RendererService } from '../graphics/renderer.service';

@Injectable({
  providedIn: 'root'
})
export class MaterialAnimationSystem implements GameSystem {
  readonly priority = 800;

  private materials = inject(MaterialService);
  private state = inject(EngineStateService);
  private envManager = inject(EnvironmentManagerService);
  private physics = inject(PhysicsService);
  private entityStore = inject(EntityStoreService);
  private renderer = inject(RendererService);

  private _vel = { x: 0, y: 0, z: 0 };
  private _sunDir = new THREE.Vector3();
  private currentMode = 0;
  private currentExposure = 1.2;

  update(dt: number, totalTime: number): void {
    const timeSec = totalTime / 1000;
    const dtSec = dt / 1000;
    const sunPos = this.envManager.sunPosition;
    const elevation = sunPos.y / 150.0;

    // RUN_OPT: Wrapped Time for high-precision shader stability
    // Sine/Noise functions in GLSL lose precision when inputs > 10000
    const wrappedTime = timeSec % 10000.0;

    // Update Volumetric Scattering Vector
    this._sunDir.copy(sunPos).normalize();
    this.envManager.heightFogUniforms.uSunDir.value.copy(this._sunDir);

    // 1. Adaptive Exposure (HDR Adaptation Simulation)
    const targetExposure = elevation > 0.1 
        ? 1.3 
        : THREE.MathUtils.lerp(4.0, 1.3, THREE.MathUtils.smoothstep(elevation, -0.4, 0.1));
        
    this.currentExposure = THREE.MathUtils.lerp(this.currentExposure, targetExposure, dtSec * 0.8);
    this.renderer.setExposure(this.currentExposure);

    // 2. Master Uniform Sync
    const waveScale = this.state.waveTimeScale();
    
    // Global Time Uniform
    this.materials['materialRegistry'].forEach((mat) => {
        const m = (Array.isArray(mat) ? mat[0] : mat) as THREE.Material;
        if (m.userData['time'] && m.userData['time'].value !== undefined) {
            m.userData['time'].value = wrappedTime;
        }
    });

    // 3. Water & Toxic Logic
    const waterMat = this.materials.getMaterial('mat-water') as THREE.MeshPhysicalMaterial;
    if (waterMat?.userData?.['time']?.value !== undefined) {
        waterMat.userData['time'].value = wrappedTime * waveScale;
    }

    // 4. Building Windows (Sync with sun elevation)
    const cityWindowMat = this.materials.getMaterial('mat-city-window') as THREE.MeshStandardMaterial;
    if (cityWindowMat?.userData?.['time']?.value !== undefined) {
        cityWindowMat.userData['time'].value = wrappedTime;
        if (cityWindowMat.userData['sunElevation']?.value !== undefined) {
            cityWindowMat.userData['sunElevation'].value = elevation;
        }
    }

    // 5. Robot Actor Sync
    const robotMat = this.materials.getMaterial('mat-robot') as THREE.MeshStandardMaterial;
    if (robotMat?.userData?.['uRobotTime']?.value !== undefined) {
        robotMat.userData['uRobotTime'].value = wrappedTime;
        
        let playerVel = 0;
        const player = this.state.playerEntity();
        if (player !== null) {
            const rbHandle = this.entityStore.world.rigidBodies.getHandle(player);
            if (rbHandle !== undefined && this.physics.world.copyBodyLinVel(rbHandle, this._vel)) {
                playerVel = Math.sqrt(this._vel.x * this._vel.x + this._vel.z * this._vel.z);
            }
        }

        const isMoving = playerVel > 0.1;
        const isRunning = playerVel > 6.5;
        const targetMode = isMoving ? (isRunning ? 2.0 : 1.0) : 0.0;
        this.currentMode = THREE.MathUtils.lerp(this.currentMode, targetMode, Math.min(1.0, dtSec * 5.0));
        
        if (robotMat.userData['uRobotMode']) robotMat.userData['uRobotMode'].value = this.currentMode;
        if (robotMat.userData['uRobotSpeed']) robotMat.userData['uRobotSpeed'].value = THREE.MathUtils.clamp(playerVel / 5.0, 0.0, 2.0);
    }
  }
}
