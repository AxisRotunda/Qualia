
import { Injectable, signal, computed } from '@angular/core';
import { PhysicsService } from './physics.service';
import { SceneService } from './scene.service';
import { CameraControlService } from './camera-control.service';
import { World, Entity } from '../engine/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class EngineService {
  // Public world for components to read
  public world = new World();
  
  private isRunning = false;
  private lastTime = 0;
  private frameCount = 0;
  private lastFpsTime = 0;
  
  // Raycaster for interaction
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  // Signals for UI
  fps = signal(0);
  physicsTime = signal(0);
  renderTime = signal(0);
  objectCount = signal(0);
  loading = signal(true);
  selectedEntity = signal<Entity | null>(null);

  // Undo/Redo stubs
  canUndo = signal(false);
  canRedo = signal(false);

  constructor(
    public physicsService: PhysicsService,
    private sceneService: SceneService,
    private cameraControl: CameraControlService
  ) {}

  async init(canvas: HTMLCanvasElement) {
    try {
      await this.physicsService.init();
      this.sceneService.init(canvas);
      
      this.cameraControl.setCamera(this.sceneService.getCamera());

      this.loading.set(false);
      this.startLoop();
      
      // Initial Spawn
      this.spawnBox();
      this.spawnSphere();
      this.spawnBox();
    } catch (err) {
      console.error("Engine Init Failed", err);
    }
  }

  private startLoop() {
    this.isRunning = true;
    
    const loop = (time: number) => {
      if (!this.isRunning) return;
      requestAnimationFrame(loop);

      this.lastTime = time;
      this.updateStats(time);

      // 2. Camera
      this.cameraControl.update();

      // 3. Physics Step
      const pStart = performance.now();
      this.physicsService.step();
      this.physicsTime.set(Math.round((performance.now() - pStart) * 100) / 100);

      // 4. System: Sync Physics -> ECS
      this.world.rigidBodies.forEach((rb, entity) => {
        const pose = this.physicsService.getBodyPose(rb.handle);
        if (pose) {
          // Update ECS Transform
          this.world.transforms.add(entity, {
            position: pose.p,
            rotation: pose.q
          });
        }
      });

      // 5. System: Sync ECS -> Render
      this.world.meshes.forEach((meshRef, entity) => {
        const transform = this.world.transforms.get(entity);
        if (transform) {
          meshRef.mesh.position.set(
            transform.position.x, 
            transform.position.y, 
            transform.position.z
          );
          meshRef.mesh.quaternion.set(
            transform.rotation.x, 
            transform.rotation.y, 
            transform.rotation.z, 
            transform.rotation.w
          );
        }
      });

      // 6. Render
      const rStart = performance.now();
      this.sceneService.render();
      this.renderTime.set(Math.round((performance.now() - rStart) * 100) / 100);
    };
    
    requestAnimationFrame(loop);
  }

  // --- API for UI ---

  spawnBox() {
    const x = (Math.random() - 0.5) * 5;
    const y = 10 + Math.random() * 5;
    const z = (Math.random() - 0.5) * 5;
    const color = Math.random() * 0xffffff;

    const bodyDef = this.physicsService.createBox(x, y, z);
    const mesh = this.sceneService.createMesh(bodyDef, color);

    const entity = this.world.createEntity();
    this.world.rigidBodies.add(entity, { handle: bodyDef.handle });
    this.world.meshes.add(entity, { mesh });
    this.world.transforms.add(entity, {
      position: bodyDef.position,
      rotation: bodyDef.rotation
    });

    this.updateCount();
  }

  spawnSphere() {
    const x = (Math.random() - 0.5) * 5;
    const y = 10 + Math.random() * 5;
    const z = (Math.random() - 0.5) * 5;
    const color = Math.random() * 0xffffff;

    const bodyDef = this.physicsService.createSphere(x, y, z);
    const mesh = this.sceneService.createMesh(bodyDef, color);

    const entity = this.world.createEntity();
    this.world.rigidBodies.add(entity, { handle: bodyDef.handle });
    this.world.meshes.add(entity, { mesh });
    this.world.transforms.add(entity, {
      position: bodyDef.position,
      rotation: bodyDef.rotation
    });

    this.updateCount();
  }

  deleteEntity(e: Entity) {
    if (this.selectedEntity() === e) {
      this.selectedEntity.set(null);
    }

    // 1. Remove from Physics
    const rb = this.world.rigidBodies.get(e);
    if (rb) {
      this.physicsService.removeBody(rb.handle);
    }

    // 2. Remove from Scene
    const meshRef = this.world.meshes.get(e);
    if (meshRef) {
      this.sceneService.removeMesh(meshRef.mesh);
    }

    // 3. Remove from ECS (clears all component stores)
    this.world.destroyEntity(e);
    
    this.updateCount();
  }

  duplicateEntity(e: Entity) {
    const t = this.world.transforms.get(e);
    const meshRef = this.world.meshes.get(e);
    
    if (t && meshRef) {
      // Offset slightly
      const x = t.position.x + 1;
      const y = t.position.y;
      const z = t.position.z;
      
      const material = meshRef.mesh.material as THREE.MeshStandardMaterial;
      const color = material.color.getHex();

      // Determine type via geometry (heuristic)
      const geo = meshRef.mesh.geometry;
      let bodyDef;
      
      if (geo instanceof THREE.SphereGeometry) {
         bodyDef = this.physicsService.createSphere(x, y, z);
      } else {
         bodyDef = this.physicsService.createBox(x, y, z);
      }

      const mesh = this.sceneService.createMesh(bodyDef, color);
      const newEntity = this.world.createEntity();
      
      this.world.rigidBodies.add(newEntity, { handle: bodyDef.handle });
      this.world.meshes.add(newEntity, { mesh });
      this.world.transforms.add(newEntity, { 
        position: bodyDef.position, 
        rotation: bodyDef.rotation 
      });

      this.updateCount();
    }
  }

  raycastFromScreen(clientX: number, clientY: number): Entity | null {
    // Convert to Normalized Device Coordinates
    this.mouse.x = (clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.sceneService.getCamera());

    // We can iterate over our known meshes instead of converting Map to Array every frame
    const meshes: THREE.Object3D[] = [];
    const meshToEntity = new Map<number, Entity>();

    this.world.meshes.forEach((ref, entity) => {
      meshes.push(ref.mesh);
      meshToEntity.set(ref.mesh.id, entity);
    });

    const intersects = this.raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      return meshToEntity.get(hit.id) ?? null;
    }
    return null;
  }

  reset() {
    this.selectedEntity.set(null);
    
    // 1. Clean Physics
    this.physicsService.resetWorld();
    
    // 2. Clean Scene & ECS
    this.world.meshes.forEach(m => this.sceneService.removeMesh(m.mesh));
    this.world.clear();
    
    this.updateCount();
  }

  // Stub actions for Menu
  undo() { 
    // TODO: Implement Command History
    console.log('Undo triggered'); 
  }
  
  redo() { 
    console.log('Redo triggered'); 
  }

  setGravity(val: number) {
    this.physicsService.setGravity(val);
  }

  resize(w: number, h: number) {
    this.sceneService.resize(w, h);
  }

  private updateStats(time: number) {
    this.frameCount++;
    if (time - this.lastFpsTime >= 1000) {
      this.fps.set(this.frameCount);
      this.frameCount = 0;
      this.lastFpsTime = time;
    }
  }

  private updateCount() {
    this.objectCount.set(this.world.entities.size);
  }
}
