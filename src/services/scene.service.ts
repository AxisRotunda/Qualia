
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { PhysicsBodyDef } from './physics.service';

@Injectable({
  providedIn: 'root'
})
export class SceneService {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  
  // Cache for cleanup
  private materials: THREE.Material[] = [];
  private geometries: THREE.BufferGeometry[] = [];

  // Highlight helper
  private selectionHelper: THREE.BoxHelper | null = null;

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    this.scene.add(dirLight);

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
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  // Returns the Mesh object for the ECS to store
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
      metalness: 0.5
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
    
    // Dispose geometry/material to prevent leaks
    if (mesh.geometry) mesh.geometry.dispose();
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(m => m.dispose());
    } else if (mesh.material) {
      mesh.material.dispose();
    }
  }

  setSelection(mesh: THREE.Mesh | null) {
    // Clean up old helper
    if (this.selectionHelper) {
      this.scene.remove(this.selectionHelper);
      this.selectionHelper.dispose();
      this.selectionHelper = null;
    }

    if (mesh) {
      this.selectionHelper = new THREE.BoxHelper(mesh, 0x22d3ee); // Cyan-400
      this.scene.add(this.selectionHelper);
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
