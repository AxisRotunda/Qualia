
import { Injectable, signal, inject } from '@angular/core';
import * as THREE from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { MaterialService } from './material.service';
import { PhysicsBodyDef } from './physics.service';
import { EnvironmentManagerService } from '../engine/graphics/environment-manager.service';
import { VisualsFactoryService } from '../engine/graphics/visuals-factory.service';

@Injectable({
  providedIn: 'root'
})
export class SceneService {
  private materialService = inject(MaterialService);
  private envManager = inject(EnvironmentManagerService);
  private visualsFactory = inject(VisualsFactoryService);
  
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;

  // Tools
  private selectionHelper: THREE.BoxHelper | null = null;
  private transformControl: TransformControls | null = null;
  
  // Signals
  public readonly isDraggingGizmo = signal(false);

  init(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    
    // Default Camera Setup
    this.camera = new THREE.PerspectiveCamera(
      60, window.innerWidth / window.innerHeight, 0.1, 500
    );
    this.camera.position.set(0, 10, 20);
    this.camera.lookAt(0, 0, 0);

    // Renderer Setup
    this.renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true,
      powerPreference: 'high-performance',
      logarithmicDepthBuffer: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Delegate Environment Setup
    this.envManager.init(this.scene);

    // Ground Plane
    const groundGeo = new THREE.PlaneGeometry(200, 200);
    const groundMat = this.materialService.getMaterial('mat-ground');
    
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Reference Grid
    const grid = new THREE.GridHelper(200, 100, 0x475569, 0x1e293b);
    this.scene.add(grid);

    // Gizmo / Transform Controls
    this.transformControl = new TransformControls(this.camera, this.renderer.domElement);
    this.transformControl.addEventListener('dragging-changed', (event: any) => {
        this.isDraggingGizmo.set(event.value);
    });
    this.scene.add(this.transformControl);
  }

  // --- Environment Delegates ---

  setAtmosphere(preset: 'clear'|'fog'|'night'|'forest'|'ice') {
    this.envManager.setAtmosphere(preset);
  }

  setLightSettings(settings: { ambientIntensity?: number; dirIntensity?: number; dirColor?: string }) {
    this.envManager.setLightSettings(settings);
  }

  // --- Accessors ---
  getScene(): THREE.Scene { return this.scene; }
  getCamera(): THREE.PerspectiveCamera { return this.camera; }
  getDomElement(): HTMLCanvasElement { return this.renderer.domElement; }

  // --- Object Management ---

  createEntityVisual(data: PhysicsBodyDef, options: { color?: number, materialId?: string, meshId?: string }): THREE.Mesh {
    const mesh = this.visualsFactory.createMesh(data, options);
    this.scene.add(mesh);
    return mesh;
  }
  
  removeEntityVisual(mesh: THREE.Mesh) {
    this.scene.remove(mesh);
    if (this.transformControl?.object === mesh) {
        this.transformControl.detach();
    }
    this.visualsFactory.disposeMesh(mesh);
  }

  setSelection(mesh: THREE.Mesh | null) {
    if (this.selectionHelper) {
      this.scene.remove(this.selectionHelper);
      this.selectionHelper.dispose();
      this.selectionHelper = null;
    }
    if (mesh) {
      this.transformControl?.attach(mesh);
      this.selectionHelper = new THREE.BoxHelper(mesh, 0x22d3ee);
      this.scene.add(this.selectionHelper);
    } else {
      this.transformControl?.detach();
    }
  }

  setTransformMode(mode: 'translate' | 'rotate' | 'scale') {
      this.transformControl?.setMode(mode);
  }

  updateSelectionHelper() {
    this.selectionHelper?.update();
  }

  // --- Rendering Lifecycle ---
  resize(width: number, height: number) {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  render() {
    if (!this.renderer || !this.scene || !this.camera) return;
    this.renderer.render(this.scene, this.camera);
  }
}
