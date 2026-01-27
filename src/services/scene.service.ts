
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

  // Cache for cleanup and bulk updates
  private materials: THREE.Material[] = [];
  private geometries: THREE.BufferGeometry[] = [];

  private selectionHelper: THREE.BoxHelper | null = null;
  private transformControl: TransformControls | null = null;

  // Signals to notify engine
  isDraggingGizmo = signal(false);

  init(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a);
    this.scene.fog = new THREE.Fog(0x0f172a, 10, 50);

    this.camera = new THREE.PerspectiveCamera(
      60, window.innerWidth / window.innerHeight, 0.1, 100
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
    this.dirLight.position.set(10, 20, 10);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.scene.add(this.dirLight);

    // Ground
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const groundMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      roughness: 0.8,
      metalness: 0.2
    });
    this.materials.push(groundMat);
    this.geometries.push(groundGeo);

    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const grid = new THREE.GridHelper(100, 50, 0x475569, 0x1e293b);
    this.scene.add(grid);

    // Initialize Gizmo
    this.transformControl = new TransformControls(this.camera, this.renderer.domElement);
    this.transformControl.addEventListener('dragging-changed', (event: any) => {
        this.isDraggingGizmo.set(event.value);
    });
    this.scene.add(this.transformControl);
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  getDomElement(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  setWireframeForAll(enabled: boolean) {
    this.materials.forEach(mat => {
        // Cast to any to avoid strict type checks on base Material class
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

  createMesh(data: PhysicsBodyDef, color: number): THREE.Mesh {
    let geometry: THREE.BufferGeometry;
    
    if (data.type === 'box') {
      geometry = new THREE.BoxGeometry(data.size!.w, data.size!.h, data.size!.d);
    } else {
      geometry = new THREE.SphereGeometry(data.radius!, 32, 32);
    }
    
    this.geometries.push(geometry);

    const material = new THREE.MeshStandardMaterial({ 
      color: color,
      roughness: 0.4,
      metalness: 0.5,
      // Check current wireframe state from ground (hacky but effective for syncing)
      wireframe: (this.materials[0] as any).wireframe || false
    });
    this.materials.push(material);

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
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(m => m.dispose());
    } else if (mesh.material) {
      mesh.material.dispose();
    }
  }

  setSelection(mesh: THREE.Mesh | null) {
    // Legacy helper removal
    if (this.selectionHelper) {
      this.scene.remove(this.selectionHelper);
      this.selectionHelper.dispose();
      this.selectionHelper = null;
    }

    // Attach Gizmo
    if (mesh) {
      this.transformControl?.attach(mesh);
      // Optional: Add box helper too for clarity? For now, gizmo is enough visual feedback
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