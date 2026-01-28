
import { Injectable, signal, inject } from '@angular/core';
import * as THREE from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { MaterialService } from './material.service';
import { AssetService } from './asset.service';
import { PhysicsBodyDef } from './physics.service';

@Injectable({
  providedIn: 'root'
})
export class SceneService {
  private materialService = inject(MaterialService);
  private assetService = inject(AssetService);
  
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  
  // Environment
  private ambientLight!: THREE.AmbientLight;
  private dirLight!: THREE.DirectionalLight;

  // Tools
  private selectionHelper: THREE.BoxHelper | null = null;
  private transformControl: TransformControls | null = null;
  
  // Mesh Management
  private geometries: THREE.BufferGeometry[] = [];

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

    // Environment Initialization
    this.initLights();
    this.setAtmosphere('clear');
  }

  // --- Environment Logic ---

  private initLights() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.dirLight.position.set(20, 50, 20);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 100;
    this.dirLight.shadow.camera.left = -50;
    this.dirLight.shadow.camera.right = 50;
    this.dirLight.shadow.camera.top = 50;
    this.dirLight.shadow.camera.bottom = -50;
    this.dirLight.shadow.bias = -0.0005;
    this.scene.add(this.dirLight);
  }

  setAtmosphere(preset: 'clear'|'fog'|'night'|'forest'|'ice') {
    if (!this.scene) return;
    
    // Reset defaults
    if (this.dirLight) {
        this.dirLight.color.setHex(0xffffff);
        this.dirLight.intensity = 0.8;
    }
    if (this.ambientLight) {
        this.ambientLight.intensity = 0.4;
    }

    switch(preset) {
      case 'clear':
        this.scene.fog = new THREE.Fog(0x0f172a, 40, 200);
        this.scene.background = new THREE.Color(0x0f172a);
        if(this.ambientLight) this.ambientLight.intensity = 0.5;
        break;
      case 'fog':
        this.scene.fog = new THREE.FogExp2(0x1a1a2e, 0.015);
        this.scene.background = new THREE.Color(0x0f0f1e);
        break;
      case 'night':
        this.scene.fog = new THREE.FogExp2(0x050510, 0.025);
        this.scene.background = new THREE.Color(0x000008);
        if(this.ambientLight) this.ambientLight.intensity = 0.1;
        if(this.dirLight) {
            this.dirLight.intensity = 0.5;
            this.dirLight.color.setHex(0x6688ff);
        }
        break;
      case 'forest':
        this.scene.fog = new THREE.FogExp2(0x1a2e1a, 0.035);
        this.scene.background = new THREE.Color(0x0f1a0f);
        if (this.dirLight) {
            this.dirLight.intensity = 0.5;
            this.dirLight.color.setHex(0xffecc7);
        }
        break;
      case 'ice':
        this.scene.fog = new THREE.Fog(0xe0f7ff, 30, 300);
        this.scene.background = new THREE.Color(0xbae6fd);
        if (this.ambientLight) this.ambientLight.intensity = 0.6;
        if (this.dirLight) {
            this.dirLight.intensity = 1.1;
            this.dirLight.color.setHex(0xf0faff);
        }
        break;
    }
  }

  setLightSettings(settings: { ambientIntensity?: number; dirIntensity?: number; dirColor?: string }) {
    if (settings.ambientIntensity !== undefined && this.ambientLight) this.ambientLight.intensity = settings.ambientIntensity;
    if (settings.dirIntensity !== undefined && this.dirLight) this.dirLight.intensity = settings.dirIntensity;
    if (settings.dirColor !== undefined && this.dirLight) this.dirLight.color.set(settings.dirColor);
  }

  // --- Accessors ---
  getScene(): THREE.Scene { return this.scene; }
  getCamera(): THREE.PerspectiveCamera { return this.camera; }
  getDomElement(): HTMLCanvasElement { return this.renderer.domElement; }

  // --- Object Management ---

  createMesh(data: PhysicsBodyDef, options: { color?: number, materialId?: string, meshId?: string }): THREE.Mesh {
    let mesh: THREE.Mesh;

    if (options.meshId) {
        // Asset-based mesh generation
        mesh = this.assetService.getMesh(options.meshId);
    } else {
        // Primitive generation
        let geometry: THREE.BufferGeometry;
        
        if (data.type === 'box') {
            geometry = new THREE.BoxGeometry(data.size!.w, data.size!.h, data.size!.d);
        } else if (data.type === 'cylinder') {
            geometry = new THREE.CylinderGeometry(data.radius, data.radius, data.height, 32);
        } else {
            geometry = new THREE.SphereGeometry(data.radius!, 32, 32);
        }
        this.geometries.push(geometry);

        let material: THREE.Material | THREE.Material[];
        if (options.materialId && this.materialService.hasMaterial(options.materialId)) {
            material = this.materialService.getMaterial(options.materialId)!;
        } else if (options.color) {
            material = new THREE.MeshStandardMaterial({ color: options.color, roughness: 0.5 });
        } else {
            material = this.materialService.getMaterial('mat-default')!;
        }

        mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
    }

    mesh.position.set(data.position.x, data.position.y, data.position.z);
    
    if (data.rotation) {
        mesh.quaternion.set(data.rotation.x, data.rotation.y, data.rotation.z, data.rotation.w);
    }
    
    this.scene.add(mesh);
    return mesh;
  }
  
  disposeMesh(mesh: THREE.Mesh) {
      if (this.geometries.includes(mesh.geometry)) {
          mesh.geometry.dispose();
      }
      // Note: We don't dispose AssetService geometries here as they are shared/cached
  }

  removeMesh(mesh: THREE.Mesh) {
    this.scene.remove(mesh);
    if (this.transformControl?.object === mesh) {
        this.transformControl.detach();
    }
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
