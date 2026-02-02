
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { GameSystem } from '../system';
import { EngineStateService } from '../engine-state.service';
import { SubsystemsService } from '../subsystems.service';
import { EntityLifecycleService } from '../ecs/entity-lifecycle.service';
import { CITY_CONFIG } from '../features/city/city.config';

/**
 * Optimized City Traffic System
 * Implements GameSystem for automated frame updates.
 * Activated only when 'city' scene is loaded.
 * 
 * Refactored for RUN_REF:
 * - Uses MaterialService registry.
 * - Centralized config in CITY_CONFIG.
 */
@Injectable({
  providedIn: 'root'
})
export class CityTrafficSystem implements GameSystem {
  // Post-sync logic
  readonly priority = 400;

  private state = inject(EngineStateService);
  private sys = inject(SubsystemsService);
  private lifecycle = inject(EntityLifecycleService);

  private mesh: THREE.InstancedMesh | null = null;
  private speeds: Float32Array = new Float32Array(0);
  private offsets: Float32Array = new Float32Array(0);
  
  private active = false;

  // Local config references
  private readonly CFG = CITY_CONFIG.TRAFFIC;
  private readonly highwayZ = -90;
  private readonly highwayY = 12.0;

  // Scratch
  private readonly dummy = new THREE.Object3D();
  private readonly _color = new THREE.Color();

  constructor() {
      this.lifecycle.onWorldReset.subscribe(() => this.dispose());
  }

  update(dt: number, totalTime: number): void {
      const currentScene = this.state.currentSceneId();
      
      // Auto-Manage Lifecycle
      if (currentScene === 'city') {
          if (!this.active) this.init();
          this.active = true;
      } else {
          if (this.active) this.dispose();
          this.active = false;
          return;
      }

      if (!this.mesh) return;

      const dtSec = dt / 1000;
      const timeSec = totalTime / 1000;
      const count = this.CFG.COUNT;
      const bounds = this.CFG.BOUNDS_RADIUS;
      
      for(let i=0; i<count; i++) {
          this.mesh.getMatrixAt(i, this.dummy.matrix);
          this.dummy.position.setFromMatrixPosition(this.dummy.matrix);
          
          this.dummy.position.x += this.speeds[i] * dtSec;
          
          const bob = Math.sin(timeSec * this.CFG.BOB_FREQ + this.offsets[i]) * this.CFG.BOB_AMP;
          this.dummy.position.y = this.highwayY + this.CFG.HOVER_HEIGHT + bob;

          if (this.dummy.position.x > bounds) {
              this.dummy.position.x = -bounds;
          } else if (this.dummy.position.x < -bounds) {
              this.dummy.position.x = bounds;
          }
          
          this.dummy.updateMatrix();
          this.mesh.setMatrixAt(i, this.dummy.matrix);
      }
      
      this.mesh.instanceMatrix.needsUpdate = true;
  }

  private init() {
      if (this.mesh) return;

      const count = this.CFG.COUNT;
      const geo = this.sys.assets.getGeometry('vehicle-traffic-puck');
      
      // RUN_MAT: Retrieve material from registry
      const mat = this.sys.materials.getMaterial('mat-traffic-puck') as THREE.Material; 

      this.mesh = new THREE.InstancedMesh(geo, mat, count);
      this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      this.mesh.frustumCulled = false; 
      
      this.speeds = new Float32Array(count);
      this.offsets = new Float32Array(count);

      for(let i=0; i<count; i++) {
          this.resetVehicle(i);
      }
      
      this.mesh.instanceMatrix.needsUpdate = true;
      if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
      
      this.sys.graph.addEntity(this.mesh);
  }

  private resetVehicle(i: number) {
      const lane = i % 4;
      const dir = lane < 2 ? 1 : -1;
      const bounds = this.CFG.BOUNDS_RADIUS;
      
      let zLane = 0;
      if (lane === 0) zLane = 4;
      else if (lane === 1) zLane = 1.5;
      else if (lane === 2) zLane = -1.5;
      else if (lane === 3) zLane = -4;

      const x = (Math.random() - 0.5) * (bounds * 2);
      
      this.dummy.position.set(x, this.highwayY + this.CFG.HOVER_HEIGHT, this.highwayZ + zLane);
      this.dummy.rotation.set(0, dir === 1 ? 0 : Math.PI, 0);
      this.dummy.updateMatrix();
      
      if (this.mesh) this.mesh.setMatrixAt(i, this.dummy.matrix);
      
      // Color coding: Headlights (Orange) vs Tail lights (Cyan)
      if (dir === 1) this._color.setHex(0xffaa00);
      else this._color.setHex(0x0ea5e9);
      
      if (Math.random() > 0.9) this._color.setHex(0xffffff);

      if (this.mesh) this.mesh.setColorAt(i, this._color);
      
      this.speeds[i] = (this.CFG.MIN_SPEED + Math.random() * this.CFG.SPEED_VARIANCE) * dir;
      this.offsets[i] = Math.random() * 100;
  }

  private dispose() {
      if (this.mesh) {
          this.sys.graph.removeEntity(this.mesh);
          // Only dispose geometry, material is shared in registry
          this.mesh.geometry.dispose();
          this.mesh = null;
      }
      this.active = false;
  }
}
