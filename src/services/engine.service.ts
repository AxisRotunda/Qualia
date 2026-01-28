
import { Injectable, signal, inject } from '@angular/core';
import { PhysicsService } from './physics.service';
import { SceneService } from './scene.service';
import { CameraControlService, CameraViewPreset } from './camera-control.service';
import { FlyControlsService } from './fly-controls.service';
import { CharacterControllerService } from './character-controller.service';
import { GameInputService } from './game-input.service';
import { EntityLibraryService } from './entity-library.service';
import { SceneRegistryService } from './scene-registry.service';
import { ParticleService } from './particle.service';
import { MaterialService } from './material.service';
import { EntityManager } from '../engine/entity-manager.service';
import { InteractionService } from '../engine/interaction.service';
import { PersistenceService } from '../engine/persistence.service';
import { GameLoopService } from './game-loop.service';
import { Entity } from '../engine/core';
import * as THREE from 'three';

export interface DebugState {
    paused: boolean;
    bodyCount: number;
    singleUpdate: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class EngineService {
  // Subsystems
  public physicsService = inject(PhysicsService);
  public sceneService = inject(SceneService);
  public entityMgr = inject(EntityManager);
  public interaction = inject(InteractionService);
  public persistence = inject(PersistenceService);
  public materialService = inject(MaterialService);
  public loop = inject(GameLoopService);
  
  private cameraControl = inject(CameraControlService);
  private flyControls = inject(FlyControlsService);
  private charController = inject(CharacterControllerService);
  private gameInput = inject(GameInputService);
  private entityLib = inject(EntityLibraryService);
  private sceneRegistry = inject(SceneRegistryService);
  private particleService = inject(ParticleService);

  // Facade Properties (for compatibility)
  get world() { return this.entityMgr.world; }
  get selectedEntity() { return this.entityMgr.selectedEntity; }
  get objectCount() { return this.entityMgr.objectCount; }

  // State Signals
  fps = this.loop.fps;
  physicsTime = signal(0);
  renderTime = signal(0);
  loading = signal(true);
  
  isPaused = signal(false);
  gravityY = signal(-9.81);
  wireframe = signal(false);
  texturesEnabled = signal(false);
  transformMode = signal<'translate' | 'rotate' | 'scale'>('translate');
  mode = signal<'edit' | 'explore' | 'walk'>('edit');
  currentSceneId = signal<string | null>(null);
  
  canUndo = signal(false);
  canRedo = signal(false);
  mainMenuVisible = signal(true);
  showDebugOverlay = signal(true);
  debugInfo = signal<DebugState>({ paused: false, bodyCount: 0, singleUpdate: null });

  constructor() {
      (window as any).qualiaDebug = {
          spawnAll: () => this.debugSpawnAllTemplates(),
          validate: () => console.log('Validation moved to tests')
      };
  }

  async init(canvas: HTMLCanvasElement) {
    try {
      await this.physicsService.init();
      this.sceneService.init(canvas);
      this.entityLib.validateTemplates(this.materialService);
      
      this.cameraControl.init(this.sceneService.getCamera(), canvas);
      this.flyControls.init(this.sceneService.getCamera(), canvas);

      this.loading.set(false);
      
      // Start the loop
      this.loop.start((dt) => this.update(dt));
      
      this.loadScene('city');
    } catch (err) {
      console.error("Engine Init Failed", err);
    }
  }

  private update(dt: number) {
      let singleUpdateTarget: string | null = null;

      // 1. Controls
      if (this.mode() === 'explore') this.flyControls.update(dt);
      else if (this.mode() === 'walk') this.charController.update(dt);
      else {
          const dragging = this.sceneService.isDraggingGizmo();
          this.cameraControl.setEnabled(!dragging && !this.mainMenuVisible());
          this.cameraControl.update();
      }
      
      this.particleService.update(dt);

      // 2. Physics & Sync
      const physicsPaused = this.isPaused() || this.mainMenuVisible();
      if (!physicsPaused) {
        const pStart = performance.now();
        this.physicsService.step();
        this.physicsTime.set(Math.round((performance.now() - pStart) * 100) / 100);
        
        // Use EntityManager for Sync
        const syncMode = this.mode() === 'edit' ? 'edit' : 'play';
        this.entityMgr.syncPhysicsTransforms(syncMode, this.sceneService.isDraggingGizmo());
      } else {
         if (this.mode() === 'edit' && this.sceneService.isDraggingGizmo()) {
             const e = this.selectedEntity();
             if (e !== null) {
                 this.entityMgr.updateSingleEntityFromVisual(e);
                 singleUpdateTarget = `Entity_${e}`;
             }
         }
      }

      this.debugInfo.set({
          paused: physicsPaused,
          bodyCount: this.world.rigidBodies.size,
          singleUpdate: singleUpdateTarget
      });
      
      if (this.selectedEntity() !== null) this.sceneService.updateSelectionHelper();

      const rStart = performance.now();
      this.sceneService.render();
      this.renderTime.set(Math.round((performance.now() - rStart) * 100) / 100);
  }

  // --- Facade Methods ---

  setMode(mode: 'edit' | 'explore' | 'walk') {
      const previous = this.mode();
      if (previous === mode) return;
      const canvas = this.sceneService.getDomElement();

      if (previous === 'explore') this.flyControls.disable();
      if (previous === 'walk') { this.charController.destroy(); this.gameInput.exitPointerLock(); }
      if (previous === 'edit') this.cameraControl.setEnabled(false);

      this.mode.set(mode);
      
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
  
  // Specific Spawns
  spawnBox() { this.spawnFromTemplate('prop-crate'); }
  spawnSphere() { this.spawnFromTemplate('prop-barrel'); }

  loadScene(id: string) {
      this.sceneRegistry.loadScene(this, id);
      this.currentSceneId.set(id);
      this.mainMenuVisible.set(false);
  }

  reset() {
      this.entityMgr.reset();
      this.isPaused.set(false);
      this.setGravity(-9.81);
      this.cameraControl.reset();
      this.setMode('edit');
  }

  // Persistance Facade
  quickSave() { this.persistence.saveToLocal(this.persistence.exportScene(this.currentSceneId(), this.gravityY(), this.texturesEnabled())); }
  quickLoad() { const data = this.persistence.loadFromLocal(); if(data) this.persistence.loadSceneData(data, this); }
  hasSavedState() { return !!this.persistence.loadFromLocal(); }
  getQuickSaveLabel() { 
      const d = this.persistence.loadFromLocal(); 
      return d?.meta?.label ? `Continue: ${d.meta.label}` : 'Continue'; 
  }

  // Entity Passthrough
  deleteEntity(e: Entity) { this.entityMgr.destroyEntity(e); }
  duplicateEntity(e: Entity) { this.entityMgr.duplicateEntity(e); }
  raycastFromScreen(x: number, y: number) { return this.interaction.raycastFromScreen(x, y); }
  getEntityName(e: Entity) { return this.world.names.get(e) ?? `Entity_${e}`; }
  setEntityName(e: Entity, n: string) { this.world.names.add(e, n); }

  // Settings
  togglePause() { this.isPaused.update(v => !v); }
  setPaused(v: boolean) { this.isPaused.set(v); }
  toggleWireframe() { this.wireframe.update(v => !v); this.materialService.setWireframeForAll(this.wireframe()); }
  toggleTextures() { this.texturesEnabled.update(v => !v); this.materialService.setTexturesEnabled(this.texturesEnabled()); }
  setGravity(v: number) { this.gravityY.set(v); this.physicsService.setGravity(v); }
  setTransformMode(m: 'translate'|'rotate'|'scale') { this.transformMode.set(m); this.sceneService.setTransformMode(m); }
  setDebugOverlayVisible(v: boolean) { this.showDebugOverlay.set(v); }
  setCameraPreset(p: CameraViewPreset) { this.cameraControl.setPreset(p); }
  setLightSettings(s: any) { this.sceneService.setLightSettings(s); }

  updateEntityPhysics(e: Entity, props: {friction: number, restitution: number}) {
      const safe = { friction: Math.max(0, Math.min(props.friction, 5)), restitution: Math.max(0, Math.min(props.restitution, 2)) };
      const rb = this.world.rigidBodies.get(e);
      if(rb) {
          this.physicsService.updateBodyMaterial(rb.handle, safe);
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
