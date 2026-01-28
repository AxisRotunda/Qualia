
import { Injectable, inject } from '@angular/core';
import { EngineStateService } from '../engine/engine-state.service';
import { EngineRuntimeService } from '../engine/runtime/engine-runtime.service';
import { EntityManager } from '../engine/entity-manager.service';
import { PhysicsService } from './physics.service';
import { PhysicsMaterialsService } from '../physics/physics-materials.service';
import { SceneService } from './scene.service';
import { EnvironmentService } from './environment.service';
import { EntityLibraryService } from './entity-library.service';
import { SceneRegistryService } from './scene-registry.service';
import { InteractionService } from '../engine/interaction.service';
import { PersistenceService } from '../engine/persistence.service';
import { CameraControlService, CameraViewPreset } from './camera-control.service';
import { FlyControlsService } from './fly-controls.service';
import { CharacterControllerService } from './character-controller.service';
import { GameInputService } from './game-input.service';
import { MaterialService } from './material.service';
import { ParticleService } from './particle.service';
import { Entity } from '../engine/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class EngineService {
  // Core Subsystems
  public state = inject(EngineStateService);
  private runtime = inject(EngineRuntimeService);
  public entityMgr = inject(EntityManager);
  
  // Feature Services
  public physicsService = inject(PhysicsService);
  public sceneService = inject(SceneService);
  private physicsMaterials = inject(PhysicsMaterialsService);
  
  public environmentService = inject(EnvironmentService);
  public interaction = inject(InteractionService);
  public persistence = inject(PersistenceService);
  public materialService = inject(MaterialService);
  public particleService = inject(ParticleService);
  
  // Logic & Controllers
  private cameraControl = inject(CameraControlService);
  private flyControls = inject(FlyControlsService);
  private charController = inject(CharacterControllerService);
  private gameInput = inject(GameInputService);
  private entityLib = inject(EntityLibraryService);
  private sceneRegistry = inject(SceneRegistryService);

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
  get showDebugOverlay() { return this.state.showDebugOverlay; }
  get debugInfo() { return this.state.debugInfo; }
  get world() { return this.entityMgr.world; }
  get selectedEntity() { return this.entityMgr.selectedEntity; }
  get objectCount() { return this.entityMgr.objectCount; }

  constructor() {
    (window as any).qualiaDebug = { spawnAll: () => this.debugSpawnAllTemplates() };
    
    // Wire runtime update callback
    this.runtime.onUpdate = (dt) => this.handleControlsUpdate(dt);
  }

  async init(canvas: HTMLCanvasElement) {
    try {
      await this.physicsService.init();
      this.sceneService.init(canvas);
      this.environmentService.init();
      this.entityLib.validateTemplates(this.materialService);
      
      this.cameraControl.init(this.sceneService.getCamera(), canvas);
      this.flyControls.init(this.sceneService.getCamera(), canvas);

      this.state.loading.set(false);
      this.runtime.init();
      
      this.loadScene('city');
    } catch (err) {
      console.error("Engine Init Failed", err);
    }
  }

  private handleControlsUpdate(dt: number) {
      if (this.mode() === 'explore') this.flyControls.update(dt);
      else if (this.mode() === 'walk') this.charController.update(dt);
      else {
          const dragging = this.sceneService.isDraggingGizmo();
          this.cameraControl.setEnabled(!dragging && !this.mainMenuVisible());
          this.cameraControl.update();
      }
  }

  // --- API ---

  setMode(mode: 'edit' | 'explore' | 'walk') {
      const previous = this.mode();
      if (previous === mode) return;
      const canvas = this.sceneService.getDomElement();

      if (previous === 'explore') this.flyControls.disable();
      if (previous === 'walk') { this.charController.destroy(); this.gameInput.exitPointerLock(); }
      if (previous === 'edit') this.cameraControl.setEnabled(false);

      this.state.mode.set(mode);
      
      if (mode === 'edit') {
          this.cameraControl.setEnabled(true);
          this.gameInput.exitPointerLock();
      } else if (mode === 'explore') {
          this.selectedEntity.set(null); 
          this.flyControls.enable();
          this.gameInput.requestPointerLock(canvas);
      } else if (mode === 'walk') {
          this.selectedEntity.set(null);
          this.charController.init(this.sceneService.getCamera().position.clone());
          this.gameInput.requestPointerLock(canvas);
      }
  }

  toggleMode() {
      const m = this.mode();
      this.setMode(m === 'edit' ? 'walk' : m === 'walk' ? 'explore' : 'edit');
  }

  spawnFromTemplate(id: string) {
      const pos = this.interaction.raycastGround() ?? new THREE.Vector3(0, 5, 0);
      this.entityLib.spawnFromTemplate(this.entityMgr, id, pos);
  }
  spawnBox() { this.spawnFromTemplate('prop-crate'); }
  spawnSphere() { this.spawnFromTemplate('prop-barrel'); }

  loadScene(id: string) {
      this.sceneRegistry.loadScene(this, id);
      this.state.currentSceneId.set(id);
      this.state.mainMenuVisible.set(false);
  }

  reset() {
      this.entityMgr.reset();
      this.state.isPaused.set(false);
      this.setGravity(-9.81);
      this.cameraControl.reset();
      this.setMode('edit');
  }

  quickSave() { this.persistence.saveToLocal(this.persistence.exportScene(this.currentSceneId(), this.gravityY(), this.texturesEnabled())); }
  quickLoad() { const data = this.persistence.loadFromLocal(); if(data) this.persistence.loadSceneData(data, this); }
  hasSavedState() { return !!this.persistence.loadFromLocal(); }
  getQuickSaveLabel() { const d = this.persistence.loadFromLocal(); return d?.meta?.label ? `Continue: ${d.meta.label}` : 'Continue'; }

  deleteEntity(e: Entity) { this.entityMgr.destroyEntity(e); }
  duplicateEntity(e: Entity) { this.entityMgr.duplicateEntity(e); }
  raycastFromScreen(x: number, y: number) { return this.interaction.raycastFromScreen(x, y); }
  getEntityName(e: Entity) { return this.world.names.get(e) ?? `Entity_${e}`; }
  setEntityName(e: Entity, n: string) { this.world.names.add(e, n); }

  togglePause() { this.state.isPaused.update(v => !v); }
  setPaused(v: boolean) { this.state.isPaused.set(v); }
  
  toggleWireframe() { this.state.wireframe.update(v => !v); this.materialService.setWireframeForAll(this.wireframe()); }
  toggleTextures() { this.state.texturesEnabled.update(v => !v); this.materialService.setTexturesEnabled(this.texturesEnabled()); }
  setGravity(v: number) { this.state.gravityY.set(v); this.physicsService.setGravity(v); }
  setTransformMode(m: 'translate'|'rotate'|'scale') { this.state.transformMode.set(m); this.sceneService.setTransformMode(m); }
  setDebugOverlayVisible(v: boolean) { this.state.showDebugOverlay.set(v); }
  setCameraPreset(p: CameraViewPreset) { this.cameraControl.setPreset(p); }
  setLightSettings(s: any) { this.environmentService.setLightSettings(s); }

  updateEntityPhysics(e: Entity, props: {friction: number, restitution: number}) {
      const safe = { friction: Math.max(0, Math.min(props.friction, 5)), restitution: Math.max(0, Math.min(props.restitution, 2)) };
      const rb = this.world.rigidBodies.get(e);
      if(rb) {
          this.physicsMaterials.updateBodyMaterial(rb.handle, safe);
          this.world.physicsProps.add(e, safe);
      }
  }

  focusSelectedEntity() {
      const e = this.selectedEntity();
      if (e === null) return;
      const t = this.world.transforms.get(e);
      if (t) this.cameraControl.focusOn(new THREE.Vector3(t.position.x, t.position.y, t.position.z));
  }

  undo() {}
  redo() {}
  resize(w: number, h: number) { this.sceneService.resize(w, h); }

  debugSpawnAllTemplates() {
    this.reset();
    let x = -15;
    this.entityLib.templates.forEach(tpl => {
      this.entityLib.spawnFromTemplate(this.entityMgr, tpl.id, new THREE.Vector3(x, 5, 0));
      x += 5;
    });
  }
}
