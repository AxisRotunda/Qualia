
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { MaterialService } from './material.service';
import { PhysicsBodyDef } from './physics.service';
import { EnvironmentManagerService } from '../engine/graphics/environment-manager.service';
import { VisualsFactoryService } from '../engine/graphics/visuals-factory.service';
import { SelectionVisualsFactory } from '../engine/graphics/selection-visuals.factory';
import { GizmoManagerService, GizmoConfig } from '../engine/graphics/gizmo-manager.service';
import { RendererService } from '../engine/graphics/renderer.service';

@Injectable({
  providedIn: 'root'
})
export class SceneService {
  private materialService = inject(MaterialService);
  private envManager = inject(EnvironmentManagerService);
  private visualsFactory = inject(VisualsFactoryService);
  private selectionFactory = inject(SelectionVisualsFactory);
  public gizmoManager = inject(GizmoManagerService);
  private rendererService = inject(RendererService);
  
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;

  // Tools
  private selectionMesh: THREE.Group | null = null;
  
  // Proxy signal
  public get isDraggingGizmo() { return this.gizmoManager.isDraggingGizmo; }

  init(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    
    // Default Camera Setup - Wide FOV for immersion, Low Near Plane for scale detail
    this.camera = new THREE.PerspectiveCamera(
      75, window.innerWidth / window.innerHeight, 0.05, 500
    );
    this.camera.position.set(0, 10, 20);
    this.camera.lookAt(0, 0, 0);

    // Delegate Renderer Setup
    this.rendererService.init(canvas);

    // Delegate Environment Setup
    this.envManager.init(this.scene);
    
    // Generate IBL for PBR
    this.envManager.generateDefaultEnvironment(this.rendererService.pmremGenerator);

    // Ground Plane
    const groundGeo = new THREE.PlaneGeometry(200, 200);
    const groundMat = this.materialService.getMaterial('mat-ground');
    
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Reference Grid - Lower opacity for realism
    const grid = new THREE.GridHelper(200, 100, 0x475569, 0x1e293b);
    (grid.material as THREE.Material).opacity = 0.2;
    (grid.material as THREE.Material).transparent = true;
    this.scene.add(grid);

    // Initialize Gizmo Manager
    this.gizmoManager.init(this.camera, this.rendererService.domElement, this.scene);
  }

  // --- Environment Delegates ---

  setAtmosphere(preset: 'clear'|'fog'|'night'|'forest'|'ice'|'space'|'city'|'blizzard') {
    this.envManager.setAtmosphere(preset);
  }

  setTimeOfDay(hour: number) {
    this.envManager.setTimeOfDay(hour);
  }

  setLightSettings(settings: { ambientIntensity?: number; dirIntensity?: number; dirColor?: string }) {
    this.envManager.setLightSettings(settings);
  }

  // --- Accessors ---
  getScene(): THREE.Scene { return this.scene; }
  getCamera(): THREE.PerspectiveCamera { return this.camera; }
  getDomElement(): HTMLCanvasElement { return this.rendererService.domElement; }

  // --- Object Management ---

  createEntityVisual(data: PhysicsBodyDef, options: { color?: number, materialId?: string, meshId?: string }): THREE.Mesh {
    const mesh = this.visualsFactory.createMesh(data, options);
    this.scene.add(mesh);
    return mesh;
  }
  
  removeEntityVisual(mesh: THREE.Mesh) {
    this.scene.remove(mesh);
    // Detach gizmo if this was the selected object
    if (this.gizmoManager.getControl()?.object === mesh) {
        this.setSelection(null);
    }
    this.visualsFactory.disposeMesh(mesh);
  }

  setSelection(mesh: THREE.Mesh | null) {
    // 1. Clean up existing selection visual
    if (this.selectionMesh) {
      this.scene.remove(this.selectionMesh);
      this.selectionFactory.dispose(this.selectionMesh);
      this.selectionMesh = null;
    }

    // 2. Setup new selection
    if (mesh) {
      this.gizmoManager.attach(mesh);
      this.selectionMesh = this.selectionFactory.createSelectionVisuals(mesh);
      this.scene.add(this.selectionMesh);
    } else {
      this.gizmoManager.detach();
    }
  }

  setTransformMode(mode: 'translate' | 'rotate' | 'scale') {
     this.gizmoManager.setMode(mode);
  }

  setGizmoConfig(config: GizmoConfig) {
     this.gizmoManager.setConfig(config);
  }

  updateSelectionHelper() {
    this.gizmoManager.updateSelectionHelper(this.selectionMesh);
  }

  // --- Rendering Lifecycle ---
  resize(width: number, height: number) {
    if (!this.camera) return;
    this.rendererService.resize(width, height, this.camera);
  }

  render() {
    if (!this.scene || !this.camera) return;
    this.rendererService.render(this.scene, this.camera);
  }
}
