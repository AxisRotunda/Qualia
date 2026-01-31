
import { Injectable, inject } from '@angular/core';
import { EngineStateService } from '../engine/engine-state.service';
import { EntityStoreService } from '../engine/ecs/entity-store.service';
import { InputManagerService } from '../engine/input-manager.service';
import { SubsystemsService } from '../engine/subsystems.service';
import { EntityLibraryService } from './entity-library.service';
import { BootstrapService } from '../engine/bootstrap.service';
import { CameraControlService } from '../engine/controllers/camera-control.service';
import * as THREE from 'three';

// Feature Modules
import { LevelManagerService } from '../engine/features/level-manager.service';
import { EnvironmentControlService } from '../engine/features/environment-control.service';
import { InteractionService } from '../engine/interaction.service';
import { EntityOpsService } from '../engine/features/entity-ops.service';
import { SimulationService } from '../engine/features/simulation.service';
import { ViewportService } from '../engine/features/viewport.service';
import { TerrainManagerService } from '../engine/features/terrain-manager.service';

@Injectable({
  providedIn: 'root'
})
export class EngineService {
  // --- Architecture & State ---
  public readonly state = inject(EngineStateService);
  public readonly entityMgr = inject(EntityStoreService);
  public readonly sys = inject(SubsystemsService); 
  public readonly library = inject(EntityLibraryService); 
  private readonly bootstrap = inject(BootstrapService);
  private readonly cameraControl = inject(CameraControlService);

  // --- Feature Modules (Public API) ---
  public readonly ops = inject(EntityOpsService);
  public readonly sim = inject(SimulationService);
  public readonly viewport = inject(ViewportService);
  public readonly env = inject(EnvironmentControlService);
  public readonly level = inject(LevelManagerService);
  public readonly input = inject(InputManagerService);
  public readonly interaction = inject(InteractionService);
  public readonly terrain = inject(TerrainManagerService);
  
  // --- Subsystem Accessors (Legacy/Compat) ---
  get physicsService() { return this.sys.physics; }
  get sceneService() { return this.sys.scene; }
  get sceneGraph() { return this.sys.graph; }
  get visualsFactory() { return this.sys.visualsFactory; }
  get assetService() { return this.sys.assets; }
  get physicsFactory() { return this.sys.physicsFactory; }
  get entityFactory() { return this.sys.entityFactory; }
  get materialService() { return this.sys.materials; }
  get particleService() { return this.sys.particles; }
  get buoyancySystem() { return this.sys.buoyancy; }

  // --- State Shortcuts (Read-Only) ---
  get mode() { return this.state.mode; }
  get loading() { return this.state.loading; }
  get isPaused() { return this.state.isPaused; }
  get fps() { return this.state.fps; }
  get physicsTime() { return this.state.physicsTime; }
  get renderTime() { return this.state.renderTime; }
  get objectCount() { return this.entityMgr.objectCount; }
  get debugInfo() { return this.state.debugInfo; }
  get timeScale() { return this.state.timeScale; }
  get gravityY() { return this.state.gravityY; }
  get wireframe() { return this.state.wireframe; }
  get texturesEnabled() { return this.state.texturesEnabled; }
  get transformMode() { return this.state.transformMode; }
  get currentSceneId() { return this.state.currentSceneId; }
  get selectedEntity() { return this.entityMgr.selectedEntity; }
  get mainMenuVisible() { return this.state.mainMenuVisible; }
  get hudVisible() { return this.state.hudVisible; }
  get showDebugOverlay() { return this.state.showDebugOverlay; }
  get showPhysicsDebug() { return this.state.showPhysicsDebug; }
  get canUndo() { return this.state.canUndo; }
  get canRedo() { return this.state.canRedo; }
  get weather() { return this.state.weather; }
  get timeOfDay() { return this.state.timeOfDay; }
  get atmosphere() { return this.state.atmosphere; }
  get world() { return this.entityMgr.world; }

  constructor() {}

  async init(canvas: HTMLCanvasElement) {
    // Pass 'this' to bootstrap manually to resolve circular dependency
    await this.bootstrap.init(canvas, this);
  }
  
  getEntityName(e: number) { return this.ops.getEntityName(e); }
  resize(w: number, h: number) { this.sys.scene.resize(w, h); }

  tweenCamera(config: { pos: {x:number,y:number,z:number}, lookAt: {x:number,y:number,z:number}, duration: number }) {
      this.cameraControl.transitionTo({
          targetPos: new THREE.Vector3(config.pos.x, config.pos.y, config.pos.z),
          lookAt: new THREE.Vector3(config.lookAt.x, config.lookAt.y, config.lookAt.z),
          duration: config.duration
      });
  }
}
