
import { Injectable, inject } from '@angular/core';
import { EngineStateService } from '../engine/engine-state.service';
import { EngineRuntimeService } from '../engine/runtime/engine-runtime.service';
import { EntityManager } from '../engine/entity-manager.service';
import { InputManagerService } from '../engine/input-manager.service';
import { PhysicsService } from './physics.service';
import { SceneService } from './scene.service';
import { GizmoConfig } from '../engine/graphics/gizmo-manager.service';
import { InteractionService } from '../engine/interaction.service';
import { CameraViewPreset } from '../engine/controllers/camera-control.service';
import { MaterialService } from './material.service';
import { ParticleService, WeatherType } from './particle.service';
import { Entity } from '../engine/core';
import { BuoyancySystem } from '../engine/systems/buoyancy.system.ts';
import { DebugService } from './debug.service';
import { AssetService } from './asset.service';

// Feature Modules
import { EnvironmentControlService } from '../engine/features/environment-control.service';
import { SpawnerService } from '../engine/features/spawner.service';
import { LevelManagerService } from '../engine/features/level-manager.service';

@Injectable({
  providedIn: 'root'
})
export class EngineService {
  // Core Subsystems
  public state = inject(EngineStateService);
  private runtime = inject(EngineRuntimeService);
  public entityMgr = inject(EntityManager);
  private inputManager = inject(InputManagerService);
  
  // Feature Services
  public physicsService = inject(PhysicsService);
  public sceneService = inject(SceneService);
  public assetService = inject(AssetService); // Exposed for Scene Scripts
  private debugService = inject(DebugService);
  
  // Feature Logic Modules
  private envControl = inject(EnvironmentControlService);
  private spawner = inject(SpawnerService);
  private levelManager = inject(LevelManagerService);

  // Systems (Exposed for specialized logic like Scene Scripts)
  public buoyancySystem = inject(BuoyancySystem);
  
  public interaction = inject(InteractionService);
  public materialService = inject(MaterialService);
  public particleService = inject(ParticleService);
  
  // Facade Accessors
  get fps() { return this.state.fps; }
  get physicsTime() { return this.state.physicsTime; }
  get renderTime() { return this.state.renderTime; }
  get loading() { return this.state.loading; }
  get isPaused() { return this.state.isPaused; }
  get gravityY() { return this.state.gravityY; }
  get wireframe() { return this.state.wireframe; }
  get texturesEnabled() { return this.state.texturesEnabled; }
  get transformMode() { return this.state.transformMode; }
  get mode() { return this.state.mode; }
  get currentSceneId() { return this.state.currentSceneId; }
  get canUndo() { return this.state.canUndo; }
  get canRedo() { return this.state.canRedo; }
  get mainMenuVisible() { return this.state.mainMenuVisible; }
  get hudVisible() { return this.state.hudVisible; }
  get showDebugOverlay() { return this.state.showDebugOverlay; }
  get showPhysicsDebug() { return this.state.showPhysicsDebug; }
  get debugInfo() { return this.state.debugInfo; }
  get world() { return this.entityMgr.world; }
  get selectedEntity() { return this.entityMgr.selectedEntity; }
  get objectCount() { return this.entityMgr.objectCount; }

  // Environment Accessors
  get weather() { return this.state.weather; }
  get timeOfDay() { return this.state.timeOfDay; }
  get atmosphere() { return this.state.atmosphere; }

  constructor() {
    // Init Debugger
    this.debugService.init(this);
  }

  async init(canvas: HTMLCanvasElement) {
    try {
      await this.physicsService.init();
      this.sceneService.init(canvas);
      
      // Bind Interaction Service to Canvas
      this.interaction.bind(canvas);

      this.inputManager.init();

      this.state.loading.set(false);
      this.runtime.init();
      
      this.loadScene('city');
    } catch (err) {
      console.error("Engine Init Failed", err);
    }
  }

  // --- API ---

  setMode(mode: 'edit' | 'explore' | 'walk') {
      this.inputManager.setMode(mode);
  }

  toggleMode() {
      this.inputManager.toggleMode();
  }

  // Spawning Delegates
  spawnFromTemplate(id: string) { this.spawner.spawnFromTemplate(id); }
  startPlacement(id: string) { this.spawner.startPlacement(id); }
  spawnBox() { this.spawner.spawnBox(); }
  spawnSphere() { this.spawner.spawnSphere(); }

  // Level Management Delegates
  loadScene(id: string) { this.levelManager.loadScene(this, id); }
  reset() { this.levelManager.reset(); }
  quickSave() { this.levelManager.quickSave(); }
  quickLoad() { this.levelManager.quickLoad(this); }
  hasSavedState() { return this.levelManager.hasSavedState(); }
  getQuickSaveLabel() { return this.levelManager.getQuickSaveLabel(); }

  // Entity Management
  deleteEntity(e: Entity) { this.entityMgr.destroyEntity(e); }
  duplicateEntity(e: Entity) { this.entityMgr.duplicateEntity(e); }
  getEntityName(e: Entity) { return this.world.names.get(e) ?? `Entity_${e}`; }
  setEntityName(e: Entity, n: string) { this.world.names.add(e, n); }

  togglePause() { this.state.isPaused.update(v => !v); }
  setPaused(v: boolean) { this.state.isPaused.set(v); }
  
  toggleWireframe() { this.state.wireframe.update(v => !v); this.materialService.setWireframeForAll(this.wireframe()); }
  toggleTextures() { this.state.texturesEnabled.update(v => !v); this.materialService.setTexturesEnabled(this.texturesEnabled()); }
  togglePhysicsDebug() { this.state.showPhysicsDebug.update(v => !v); }

  setGravity(v: number) { this.state.gravityY.set(v); this.physicsService.setGravity(v); }
  
  setTransformMode(m: 'translate'|'rotate'|'scale') { 
      this.state.transformMode.set(m); 
      this.sceneService.setTransformMode(m); 
  }
  
  setDebugOverlayVisible(v: boolean) { this.state.showDebugOverlay.set(v); }
  toggleHud() { this.state.hudVisible.update(v => !v); }
  
  setCameraPreset(p: CameraViewPreset) { 
      this.inputManager.setCameraPreset(p); 
  }
  
  setLightSettings(s: any) { this.envControl.setLightSettings(s); }
  setGizmoConfig(config: GizmoConfig) { this.sceneService.setGizmoConfig(config); }

  // Environment Control Delegates
  setAtmosphere(preset: 'clear'|'fog'|'night'|'forest'|'ice'|'space'|'city'|'blizzard') {
      this.envControl.setAtmosphere(preset);
  }

  setWeather(type: WeatherType) {
      this.envControl.setWeather(type);
  }

  setTimeOfDay(hour: number) {
      this.envControl.setTimeOfDay(hour);
  }

  setPerformanceMode(isPerformance: boolean) {
      if (isPerformance) {
          if (this.texturesEnabled()) this.toggleTextures();
      } else {
          if (!this.texturesEnabled()) this.toggleTextures();
      }
  }

  updateEntityPhysics(e: Entity, props: {friction: number, restitution: number}) {
      this.entityMgr.updateEntityPhysics(e, props);
  }

  focusSelectedEntity() {
      this.inputManager.focusSelectedEntity();
  }
  
  // Facade for system logic
  applyBuoyancy(baseWaterLevel: number, time: number) {
      this.buoyancySystem.update(baseWaterLevel, time);
  }

  undo() {}
  redo() {}
  resize(w: number, h: number) { this.sceneService.resize(w, h); }
}
