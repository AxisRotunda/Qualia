
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { SceneGraphService } from '../engine/graphics/scene-graph.service';
import { EnvironmentManagerService } from '../engine/graphics/environment-manager.service';
import { GizmoManagerService, GizmoConfig } from '../engine/graphics/gizmo-manager.service';
import { InstancedMeshService } from '../engine/graphics/instanced-mesh.service';
import { CameraManagerService } from '../engine/graphics/camera-manager.service';
import { StageService } from '../engine/graphics/stage.service';
import { RenderingCoordinatorService } from '../engine/graphics/rendering-coordinator.service';

@Injectable({
  providedIn: 'root'
})
export class SceneService {
  // Public for Engine Facade
  public graph = inject(SceneGraphService);
  public stageService = inject(StageService); 
  public gizmoManager = inject(GizmoManagerService);
  
  private envManager = inject(EnvironmentManagerService);
  private instancedMeshService = inject(InstancedMeshService);
  private cameraManager = inject(CameraManagerService);
  private coordinator = inject(RenderingCoordinatorService);
  
  public get isDraggingGizmo() { return this.gizmoManager.isDraggingGizmo; }

  init(canvas: HTMLCanvasElement) {
    const scene = this.graph.scene;
    
    // 1. Initialize Renderer & Camera
    this.coordinator.init(canvas);
    
    // 2. Setup Subsystems
    this.envManager.init(scene);
    this.stageService.init(this.graph.stageGroup);
    
    // 3. IBL Generation
    this.envManager.generateDefaultEnvironment(this.coordinator.pmremGenerator);

    // 4. Gizmos
    this.gizmoManager.init(this.cameraManager.getCamera(), this.coordinator.domElement, this.graph.helperGroup);
  }

  // --- Accessors ---
  getScene(): THREE.Scene { return this.graph.scene; }
  getCamera(): THREE.PerspectiveCamera { return this.cameraManager.getCamera(); }
  getDomElement(): HTMLCanvasElement { return this.coordinator.domElement; }

  setTransformMode(mode: 'translate' | 'rotate' | 'scale') {
     this.gizmoManager.setMode(mode);
  }

  setGizmoConfig(config: GizmoConfig) {
     this.gizmoManager.setConfig(config);
  }

  // --- Rendering Lifecycle ---
  resize(width: number, height: number) {
    this.coordinator.resize(width, height);
  }

  render() {
    this.coordinator.render();
  }
}
