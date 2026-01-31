
import { Injectable, inject } from '@angular/core';
import { EngineStateService } from '../engine/engine-state.service';
import { EngineRuntimeService } from '../engine/runtime/engine-runtime.service';
import { EntityStoreService } from '../engine/ecs/entity-store.service';
import { InputManagerService } from '../engine/input-manager.service';
import { SubsystemsService } from '../engine/subsystems.service';
import { DebugService } from './debug.service';
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
  private readonly runtime = inject(EngineRuntimeService);
  public readonly entityMgr = inject(EntityStoreService);
  public readonly sys = inject(SubsystemsService); 

  // --- Feature Modules (Public API) ---
  public readonly ops = inject(EntityOpsService);
  public readonly sim = inject(SimulationService);
  public readonly viewport = inject(ViewportService);
  public readonly env = inject(EnvironmentControlService);
  public readonly level = inject(LevelManagerService);
  public readonly input = inject(InputManagerService);
  public readonly interaction = inject(InteractionService);
  public readonly terrain = inject(TerrainManagerService);
  
  private readonly debugService = inject(DebugService);

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
  // Core
  get mode() { return this.state.mode; }
  get loading() { return this.state.loading; }
  get isPaused() { return this.state.isPaused; }
  
  // Stats
  get fps() { return this.state.fps; }
  get physicsTime() { return this.state.physicsTime; }
  get renderTime() { return this.state.renderTime; }
  get objectCount() { return this.entityMgr.objectCount; }
  get debugInfo() { return this.state.debugInfo; }
  
  // Settings
  get timeScale() { return this.state.timeScale; }
  get gravityY() { return this.state.gravityY; }
  get wireframe() { return this.state.wireframe; }
  get texturesEnabled() { return this.state.texturesEnabled; }
  
  // UI
  get transformMode() { return this.state.transformMode; }
  get currentSceneId() { return this.state.currentSceneId; }
  get selectedEntity() { return this.entityMgr.selectedEntity; }
  get mainMenuVisible() { return this.state.mainMenuVisible; }
  get hudVisible() { return this.state.hudVisible; }
  get showDebugOverlay() { return this.state.showDebugOverlay; }
  get showPhysicsDebug() { return this.state.showPhysicsDebug; }
  
  // History
  get canUndo() { return this.state.canUndo; }
  get canRedo() { return this.state.canRedo; }

  // Environment
  get weather() { return this.state.weather; }
  get timeOfDay() { return this.state.timeOfDay; }
  get atmosphere() { return this.state.atmosphere; }
  get world() { return this.entityMgr.world; }

  constructor() {
    this.debugService.init(this);
  }

  async init(canvas: HTMLCanvasElement) {
    try {
      await this.sys.physics.init();
      this.sys.scene.init(canvas);
      
      this.interaction.bind(canvas);
      this.input.init();

      this.state.loading.set(false);
      this.runtime.init();
      
      this.level.loadScene(this, 'city');
    } catch (err) {
      console.error("Engine Init Failed", err);
    }
  }
  
  // Helper for UI
  getEntityName(e: number) { return this.ops.getEntityName(e); }
  
  resize(w: number, h: number) { this.sys.scene.resize(w, h); }
}
