
import { Injectable, signal, inject } from '@angular/core';
import * as THREE from 'three';
import { PhysicsBodyDef } from './physics.service';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { AssetService } from './asset.service';

@Injectable({
  providedIn: 'root'
})
export class SceneService {
  private assetService = inject(AssetService);
  
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  
  // Lights
  private ambientLight!: THREE.AmbientLight;
  private dirLight!: THREE.DirectionalLight;

  // Material Registry
  private materialRegistry = new Map<string, THREE.Material | THREE.Material[]>();
  private textures = new Map<string, THREE.Texture>();
  public texturesEnabled = false;
  
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
    this.dirLight.shadow.bias = -0.0005;
    
    this.scene.add(this.dirLight);

    // Initialize Material Registry
    this.initTextures();
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

  private generateProceduralTexture(baseColor: string, grainColor: string, scale: number = 4): THREE.Texture {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
        // Base
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, size, size);
        
        // Noise
        const imgData = ctx.getImageData(0,0, size, size);
        const data = imgData.data;
        for(let i=0; i < data.length; i += 4) {
            const grain = (Math.random() - 0.5) * 40;
            // Simple additive noise
            data[i] = Math.min(255, Math.max(0, data[i] + grain));
            data[i+1] = Math.min(255, Math.max(0, data[i+1] + grain));
            data[i+2] = Math.min(255, Math.max(0, data[i+2] + grain));
        }
        ctx.putImageData(imgData, 0, 0);
    }
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(scale, scale);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  private initTextures() {
    this.textures.set('tex-concrete', this.generateProceduralTexture('#808080', '#505050'));
    this.textures.set('tex-ground', this.generateProceduralTexture('#2d3748', '#1a202c', 8));
    this.textures.set('tex-bark', this.generateProceduralTexture('#3f2e26', '#2b1d16', 2));
    this.textures.set('tex-leaf', this.generateProceduralTexture('#2f5c35', '#224a28', 2));
    this.textures.set('tex-rock', this.generateProceduralTexture('#64748b', '#475569', 1));
    this.textures.set('tex-snow', this.generateProceduralTexture('#f0f9ff', '#e0f2fe', 4));
  }

  private initMaterials() {
    // Helper
    const std = (col: number, rough: number, metal: number, mapId?: string) => {
        const m = new THREE.MeshStandardMaterial({ color: col, roughness: rough, metalness: metal });
        if (mapId) {
             m.userData['mapId'] = mapId; // Store for toggling
        }
        return m;
    };

    // Concrete
    this.materialRegistry.set('mat-concrete', std(0x808080, 0.8, 0.0, 'tex-concrete'));
    // Metal
    this.materialRegistry.set('mat-metal', std(0x94a3b8, 0.2, 1.0));
    // Road
    this.materialRegistry.set('mat-road', std(0x333333, 0.7, 0.0, 'tex-concrete'));
    // Wood
    this.materialRegistry.set('mat-wood', std(0x8B4513, 0.6, 0.0, 'tex-bark'));
    // Forest (Base)
    this.materialRegistry.set('mat-forest', std(0x3d5a38, 0.9, 0.0, 'tex-leaf'));
    // Ice
    this.materialRegistry.set('mat-ice', std(0xe0f2fe, 0.05, 0.3, 'tex-snow'));
    // Glass
    this.materialRegistry.set('mat-glass', new THREE.MeshStandardMaterial({ 
      color: 0xa5f3fc, roughness: 0.05, metalness: 0.0, transparent: true, opacity: 0.6 
    }));
    // Hazard
    this.materialRegistry.set('mat-hazard', std(0xfacc15, 0.6, 0.1));
    // Ground
    this.materialRegistry.set('mat-ground', std(0x1e293b, 0.9, 0.0, 'tex-ground'));
    
    // -- New Organic Materials --
    this.materialRegistry.set('mat-bark', std(0x5c4033, 0.9, 0.0, 'tex-bark'));
    this.materialRegistry.set('mat-leaf', std(0x4ade80, 0.8, 0.0, 'tex-leaf'));
    this.materialRegistry.set('mat-rock', std(0x94a3b8, 0.9, 0.0, 'tex-rock'));

    // Fallback
    this.materialRegistry.set('mat-default', std(0xffffff, 0.5, 0.0));
  }

  setTexturesEnabled(enabled: boolean) {
      this.texturesEnabled = enabled;
      
      this.materialRegistry.forEach(mat => {
          if (Array.isArray(mat)) {
              mat.forEach(m => this.applyTexture(m as THREE.MeshStandardMaterial, enabled));
          } else {
              this.applyTexture(mat as THREE.MeshStandardMaterial, enabled);
          }
      });
  }

  private applyTexture(mat: THREE.MeshStandardMaterial, enabled: boolean) {
      const mapId = mat.userData['mapId'];
      if (mapId && this.textures.has(mapId)) {
          mat.map = enabled ? this.textures.get(mapId)! : null;
          mat.needsUpdate = true;
      }
  }

  getMaterial(id: string): THREE.Material | THREE.Material[] {
      return this.materialRegistry.get(id) || this.materialRegistry.get('mat-default')!;
  }

  hasMaterial(id: string): boolean {
    return this.materialRegistry.has(id);
  }

  setAtmosphere(preset: 'clear'|'fog'|'night'|'forest'|'ice') {
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
        if(this.dirLight) this.dirLight.intensity = 0.8;
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
        if (this.ambientLight) this.ambientLight.intensity = 0.4;
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
        if (Array.isArray(mat)) {
            mat.forEach(m => (m as any).wireframe = enabled);
        } else {
            (mat as any).wireframe = enabled;
        }
    });
  }

  setLightSettings(settings: { ambientIntensity?: number; dirIntensity?: number; dirColor?: string }) {
    if (settings.ambientIntensity !== undefined) this.ambientLight.intensity = settings.ambientIntensity;
    if (settings.dirIntensity !== undefined) this.dirLight.intensity = settings.dirIntensity;
    if (settings.dirColor !== undefined) this.dirLight.color.set(settings.dirColor);
  }

  createMesh(data: PhysicsBodyDef, options: { color?: number, materialId?: string, meshId?: string }): THREE.Mesh {
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material | THREE.Material[];

    // 1. Geometry Retrieval
    if (options.meshId) {
        geometry = this.assetService.getGeometry(options.meshId);
    } else {
        // Primitive fallbacks
        if (data.type === 'box') {
            geometry = new THREE.BoxGeometry(data.size!.w, data.size!.h, data.size!.d);
        } else if (data.type === 'cylinder') {
            geometry = new THREE.CylinderGeometry(data.radius, data.radius, data.height, 32);
        } else {
            geometry = new THREE.SphereGeometry(data.radius!, 32, 32);
        }
        this.geometries.push(geometry);
    }

    // 2. Material Retrieval
    if (options.meshId === 'tree-01') {
        // Special Case: Hardcoded Multi-material for tree for now
        // Or cleaner: allow options.materialId to look up an array
        const trunk = this.getMaterial('mat-bark') as THREE.Material;
        const leaf = this.getMaterial('mat-leaf') as THREE.Material;
        material = [trunk, leaf];
    } else {
        // Standard Single Material
        if (options.materialId && this.materialRegistry.has(options.materialId)) {
            material = this.materialRegistry.get(options.materialId)!;
        } else if (options.color) {
            material = new THREE.MeshStandardMaterial({ 
                color: options.color,
                roughness: 0.5,
                metalness: 0.1
            });
        } else {
            material = this.materialRegistry.get('mat-default')!;
        }
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
    
    // Geometry is cached in asset service or geometries array, simple cleanup for primitives
    // For now we rely on Garbage Collection for Assets as they are persistent global resources
    if (this.geometries.includes(mesh.geometry)) {
        mesh.geometry.dispose();
    }
    
    // Cleanup unique materials
    if (mesh.material && !Array.isArray(mesh.material)) {
        const isShared = Array.from(this.materialRegistry.values()).flat().includes(mesh.material as THREE.Material);
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
