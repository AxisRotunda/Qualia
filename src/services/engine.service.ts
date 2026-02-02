
import { Injectable, inject, Injector } from '@angular/core';
import { EngineStateService } from '../engine/engine-state.service';
import { EntityStoreService } from '../engine/ecs/entity-store.service';
import { InputManagerService } from '../engine/input-manager.service';
import { SubsystemsService } from '../engine/subsystems.service';
import { EntityLibraryService } from '../engine/features/entity-library.service';
import { BootstrapService } from '../engine/bootstrap.service';
import { CameraControlService } from '../engine/controllers/camera-control.service';
import * as THREE from 'three';

import { LevelManagerService } from '../engine/features/level-manager.service';
import { EnvironmentControlService } from '../engine/features/environment-control.service';
import { InteractionService } from '../engine/interaction.service';
import { EntityOpsService } from '../engine/features/entity-ops.service';
import { SimulationService } from '../engine/features/simulation.service';
import { ViewportService } from '../engine/features/viewport.service';
import { TerrainManagerService } from '../engine/features/terrain-manager.service';
import { TransformLogicService } from '../engine/logic/transform-logic.service';
import { SpawnerService } from '../engine/features/spawner.service';
import { AnimationControlService } from '../engine/features/animation-control.service';
import { WeaponService } from '../engine/features/combat/weapon.service';
import { FractureService } from '../engine/features/fracture.service';

@Injectable({
  providedIn: 'root'
})
export class EngineService {
  public readonly injector = inject(Injector); 
  public readonly state = inject(EngineStateService);
  public readonly entityMgr = inject(EntityStoreService);
  public readonly sys = inject(SubsystemsService); 
  public readonly library = inject(EntityLibraryService); 
  private readonly bootstrap = inject(BootstrapService);
  private readonly cameraControl = inject(CameraControlService);

  public readonly ops = inject(EntityOpsService);
  public readonly sim = inject(SimulationService);
  public readonly viewport = inject(ViewportService);
  public readonly env = inject(EnvironmentControlService);
  public readonly level = inject(LevelManagerService);
  public readonly input = inject(InputManagerService);
  public readonly interaction = inject(InteractionService);
  public readonly terrain = inject(TerrainManagerService);
  public readonly transform = inject(TransformLogicService);
  public readonly spawner = inject(SpawnerService);
  public readonly anim = inject(AnimationControlService);
  public readonly combat = inject(WeaponService);
  public readonly fracture = inject(FractureService);
  
  readonly mode = this.state.mode;
  readonly loading = this.state.loading;
  readonly isPaused = this.state.isPaused;
  readonly fps = this.state.fps;
  readonly physicsTime = this.state.physicsTime;
  readonly renderTime = this.state.renderTime;
  readonly objectCount = this.entityMgr.objectCount;
  readonly debugInfo = this.state.debugInfo;
  readonly timeScale = this.state.timeScale;
  readonly gravityY = this.state.gravityY;
  readonly wireframe = this.state.wireframe;
  readonly texturesEnabled = this.state.texturesEnabled;
  readonly transformMode = this.state.transformMode;
  readonly currentSceneId = this.state.currentSceneId;
  readonly selectedEntity = this.entityMgr.selectedEntity;
  readonly mainMenuVisible = this.state.mainMenuVisible;
  readonly hudVisible = this.state.hudVisible;
  readonly showDebugOverlay = this.state.showDebugOverlay;
  readonly showPhysicsDebug = this.state.showPhysicsDebug;
  readonly canUndo = this.state.canUndo;
  readonly canRedo = this.state.canRedo;
  readonly weather = this.state.weather;
  readonly timeOfDay = this.state.timeOfDay;
  readonly atmosphere = this.state.atmosphere;
  readonly world = this.entityMgr.world;

  async init(canvas: HTMLCanvasElement) {
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

  setMainMenuVisible(visible: boolean) { this.state.setMainMenuVisible(visible); }
}
