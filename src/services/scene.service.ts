
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { BodyData } from './physics.service';

@Injectable({
  providedIn: 'root'
})
export class SceneService {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private meshes = new Map<number, THREE.Mesh>();
  
  // Track mesh instances to clean up memory
  private geometries: THREE.BufferGeometry[] = [];
  private materials: THREE.Material[] = [];

  init(canvas: HTMLCanvasElement) {
    // 1. Scene Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a); // Slate-900
    this.scene.fog = new THREE.Fog(0x0f172a, 10, 50);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(
      60, window.innerWidth / window.innerHeight, 0.1, 100
    );
    this.camera.position.set(0, 10, 20);
    this.camera.lookAt(0, 0, 0);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    this.scene.add(dirLight);

    // 5. Ground (Visual Only)
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

    // Grid Helper
    const grid = new THREE.GridHelper(100, 50, 0x475569, 0x1e293b);
    this.scene.add(grid);
  }

  addMesh(data: BodyData) {
    let geometry: THREE.BufferGeometry;
    
    if (data.type === 'box') {
      geometry = new THREE.BoxGeometry(data.size!.w, data.size!.h, data.size!.d);
    } else {
      geometry = new THREE.SphereGeometry(data.radius!, 32, 32);
    }
    
    this.geometries.push(geometry);

    const material = new THREE.MeshStandardMaterial({ 
      color: data.color,
      roughness: 0.4,
      metalness: 0.5
    });
    this.materials.push(material);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(data.position.x, data.position.y, data.position.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    this.scene.add(mesh);
    this.meshes.set(data.handle, mesh);
  }

  updateMesh(handle: number, p: {x:number, y:number, z:number}, q: {x:number, y:number, z:number, w:number}) {
    const mesh = this.meshes.get(handle);
    if (mesh) {
      mesh.position.set(p.x, p.y, p.z);
      mesh.quaternion.set(q.x, q.y, q.z, q.w);
    }
  }

  reset() {
    this.meshes.forEach(mesh => {
      this.scene.remove(mesh);
    });
    this.meshes.clear();
    // In a real app, we'd dispose geometries/materials here carefully
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
