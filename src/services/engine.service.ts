
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

  // Signals for UI
  fps = signal(0);
  objectCount = signal(0);
  loading = signal(true);
  selectedEntity = signal<Entity | null>(null);

  constructor(
    private physics: PhysicsService,
    private scene: SceneService,
    private cameraControl: CameraControlService
  ) {}

  async init(canvas: HTMLCanvasElement) {
    try {
      await this.physics.init();
      this.scene.init(canvas);
      
      this.cameraControl.setCamera(this.scene.getCamera());

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

      // 1. Time & Stats
      // const deltaTime = (time - this.lastTime) / 1000;
      this.lastTime = time;
      this.updateStats(time);

      // 2. Camera
      this.cameraControl.update();

      // 3. Physics Step
      this.physics.step();

      // 4. System: Sync Physics -> ECS
      this.world.rigidBodies.forEach((rb, entity) => {
        const pose = this.physics.getBodyPose(rb.handle);
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
      this.scene.render();
    };
    
    requestAnimationFrame(loop);
  }

  // --- API for UI ---

  spawnBox() {
    const x = (Math.random() - 0.5) * 5;
    const y = 10 + Math.random() * 5;
    const z = (Math.random() - 0.5) * 5;
    const color = Math.random() * 0xffffff;

    const bodyDef = this.physics.createBox(x, y, z);
    const mesh = this.scene.createMesh(bodyDef, color);

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

    const bodyDef = this.physics.createSphere(x, y, z);
    const mesh = this.scene.createMesh(bodyDef, color);

    const entity = this.world.createEntity();
    this.world.rigidBodies.add(entity, { handle: bodyDef.handle });
    this.world.meshes.add(entity, { mesh });
    this.world.transforms.add(entity, {
      position: bodyDef.position,
      rotation: bodyDef.rotation
    });

    this.updateCount();
  }

  reset() {
    this.selectedEntity.set(null);
    // 1. Clean Physics
    this.physics.resetWorld();
    
    // 2. Clean Scene & ECS
    this.world.meshes.forEach(m => this.scene.removeMesh(m.mesh));
    this.world.clear();
    
    this.updateCount();
  }

  setGravity(val: number) {
    this.physics.setGravity(val);
  }

  resize(w: number, h: number) {
    this.scene.resize(w, h);
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
