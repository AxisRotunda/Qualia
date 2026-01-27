
import { Injectable, signal } from '@angular/core';
import * as THREE from 'three';
import { PhysicsBodyDef } from './physics.service';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

@Injectable({
  providedIn: 'root'
})
export class SceneService {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  
  // Lights
  private ambientLight!: THREE.AmbientLight;
  private dirLight!: THREE.DirectionalLight;

  // Material Registry
  private materialRegistry = new Map<string, THREE.Material>();
  
  // Cache for cleanup
  private geometries: THREE.BufferGeometry[] = [];

  private selectionHelper: THREE.BoxHelper | null = null;
  private transformControl: TransformControls | null = null;

  // Signals to notify engine
  isDraggingGizmo = signal(false);

  init(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    this.setAtmosphere('clear');

    this.camera = new THREE.PerspectiveCamera(
      60, window.innerWidth / window.innerHeight, 0.1, 500
    );
    this.camera.position.set(0, 10, 20);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lighting
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
    
    this.scene.add(this.dirLight);

    // Initialize Material Registry
    this.initMaterials();

    // Ground
    const groundGeo = new THREE.PlaneGeometry(200, 200);
    const groundMat = this.getMaterial('mat-ground');
    this.geometries.push(groundGeo);

    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const grid = new THREE.GridHelper(200, 100, 0x475569, 0x1e293b);
    this.scene.add(grid);

    // Initialize Gizmo
    this.transformControl = new TransformControls(this.camera, this.renderer.domElement);
    this.transformControl.addEventListener('dragging-changed', (event: any) => {
        this.isDraggingGizmo.set(event.value);
    });
    this.scene.add(this.transformControl);
  }

  private initMaterials() {
    // Shared parameters
    const baseSettings = { roughness: 0.7, metalness: 0.1 };

    this.materialRegistry.set('mat-ground', new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, roughness: 0.9, metalness: 0.1 
    }));
    
    this.materialRegistry.set('mat-concrete', new THREE.MeshStandardMaterial({ 
      color: 0x64748b, roughness: 0.9, metalness: 0.1 
    }));
    
    this.materialRegistry.set('mat-metal', new THREE.MeshStandardMaterial({ 
      color: 0x94a3b8, roughness: 0.4, metalness: 0.8 
    }));
    
    this.materialRegistry.set('mat-wood', new THREE.MeshStandardMaterial({ 
      color: 0xa16207, roughness: 0.9, metalness: 0.0 
    }));

    this.materialRegistry.set('mat-road', new THREE.MeshStandardMaterial({ 
      color: 0x0f172a, roughness: 0.9, metalness: 0.0 
    }));

    this.materialRegistry.set('mat-glass', new THREE.MeshStandardMaterial({ 
      color: 0x22d3ee, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.6 
    }));
    
    this.materialRegistry.set('mat-hazard', new THREE.MeshStandardMaterial({
        color: 0xfacc15, roughness: 0.6, metalness: 0.4
    }));
    
    this.materialRegistry.set('mat-default', new THREE.MeshStandardMaterial({ 
      color: 0xffffff, ...baseSettings 
    }));
  }

  getMaterial(id: string): THREE.Material {
      return this.materialRegistry.get(id) || this.materialRegistry.get('mat-default')!;
  }

  setAtmosphere(preset: 'clear'|'fog'|'night') {
    switch(preset) {
      case 'clear':
        this.scene.fog = new THREE.Fog(0x0f172a, 30, 150);
        this.scene.background = new THREE.Color(0x0f172a);
        if(this.ambientLight) this.ambientLight.intensity = 0.4;
        break;
      case 'fog':
        this.scene.fog = new THREE.FogExp2(0x1a1a2e, 0.015);
        this.scene.background = new THREE.Color(0x0f0f1e);
        if(this.ambientLight) this.ambientLight.intensity = 0.25;
        if(this.dirLight) this.dirLight.intensity = 0.7;
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
    }
  }

  getScene(): THREE.Scene {
      return this.scene;
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  getDomElement(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  setWireframeForAll(enabled: boolean) {
    this.materialRegistry.forEach(mat => {
        (mat as any).wireframe = enabled;
    });
  }

  setLightSettings(settings: { ambientIntensity?: number; dirIntensity?: number; dirColor?: string }) {
    if (settings.ambientIntensity !== undefined) {
      this.ambientLight.intensity = settings.ambientIntensity;
    }
    if (settings.dirIntensity !== undefined) {
      this.dirLight.intensity = settings.dirIntensity;
    }
    if (settings.dirColor !== undefined) {
      this.dirLight.color.set(settings.dirColor);
    }
  }

  createMesh(data: PhysicsBodyDef, options: { color?: number, materialId?: string }): THREE.Mesh {
    let geometry: THREE.BufferGeometry;
    
    if (data.type === 'box') {
      geometry = new THREE.BoxGeometry(data.size!.w, data.size!.h, data.size!.d);
    } else if (data.type === 'cylinder') {
      geometry = new THREE.CylinderGeometry(data.radius, data.radius, data.height, 32);
    } else {
      geometry = new THREE.SphereGeometry(data.radius!, 32, 32);
    }
    
    this.geometries.push(geometry);

    let material: THREE.Material;
    
    // Priority: Material ID -> Fallback Default shared -> Unique (legacy/color override)
    if (options.materialId && this.materialRegistry.has(options.materialId)) {
        material = this.materialRegistry.get(options.materialId)!;
    } else if (options.color) {
        // Only create new material if specific color requested that isn't a preset
        // This is a "cost" but allows flexibility for dynamic coloring if needed.
        material = new THREE.MeshStandardMaterial({ 
            color: options.color,
            roughness: 0.4,
            metalness: 0.5
        });
    } else {
        material = this.materialRegistry.get('mat-default')!;
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(data.position.x, data.position.y, data.position.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    this.scene.add(mesh);
    return mesh;
  }

  removeMesh(mesh: THREE.Mesh) {
    this.scene.remove(mesh);
    if (this.transformControl?.object === mesh) {
        this.transformControl.detach();
    }
    
    if (mesh.geometry) mesh.geometry.dispose();
    
    // Cleanup unique materials
    if (mesh.material) {
        const isShared = Array.from(this.materialRegistry.values()).includes(mesh.material as THREE.Material);
        if (!isShared) {
            (mesh.material as THREE.Material).dispose();
        }
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
      if (this.transformControl) {
          this.transformControl.setMode(mode);
      }
  }

  updateSelectionHelper() {
    if (this.selectionHelper) {
      this.selectionHelper.update();
    }
  }

  resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
