
import { Injectable, signal, computed } from '@angular/core';
import { PhysicsService } from './physics.service';
import { SceneService } from './scene.service';
import { CameraControlService, CameraViewPreset } from './camera-control.service';
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
  
  // Simulation State
  isPaused = signal(false);
  gravityY = signal(-9.81);
  wireframe = signal(false);

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
      
      // Pass canvas to camera control for event listeners
      this.cameraControl.init(this.sceneService.getCamera(), canvas);

      this.loading.set(false);
      this.startLoop();
      
      // Initial Spawn
      this.reset();
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
      if (!this.isPaused()) {
        const pStart = performance.now();
        this.physicsService.step();
        this.physicsTime.set(Math.round((performance.now() - pStart) * 100) / 100);

        // 4. System: Sync Physics -> ECS
        this.world.rigidBodies.forEach((rb, entity) => {
          const pose = this.physicsService.getBodyPose(rb.handle);
          if (pose) {
            const transform = this.world.transforms.get(entity);
            if (transform) {
                // Update position/rotation, preserve scale
                transform.position = pose.p;
                transform.rotation = pose.q;
            }
          }
        });
      }

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
          meshRef.mesh.scale.set(
              transform.scale.x,
              transform.scale.y,
              transform.scale.z
          );
        }
      });
      
      // Update selection visual
      if (!this.isPaused() || this.selectedEntity() !== null) {
        this.sceneService.updateSelectionHelper();
      }

      // 6. Render
      const rStart = performance.now();
      this.sceneService.render();
      this.renderTime.set(Math.round((performance.now() - rStart) * 100) / 100);
    };
    
    requestAnimationFrame(loop);
  }

  // --- Core Lifecycle ---

  private destroyEntityInternal(e: Entity) {
    if (this.selectedEntity() === e) {
      this.selectedEntity.set(null);
    }

    const rb = this.world.rigidBodies.get(e);
    if (rb) {
      this.physicsService.removeBody(rb.handle);
    }

    const meshRef = this.world.meshes.get(e);
    if (meshRef) {
      this.sceneService.removeMesh(meshRef.mesh);
    }

    this.world.destroyEntity(e);
  }

  private generateRandomColor(): number {
      const color = new THREE.Color();
      color.setHSL(Math.random(), 0.6 + Math.random() * 0.3, 0.4 + Math.random() * 0.2);
      return color.getHex();
  }

  spawnBox() {
    const x = (Math.random() - 0.5) * 5;
    const y = 10 + Math.random() * 5;
    const z = (Math.random() - 0.5) * 5;
    const color = this.generateRandomColor();

    const bodyDef = this.physicsService.createBox(x, y, z);
    const mesh = this.sceneService.createMesh(bodyDef, color);

    const entity = this.world.createEntity();
    this.world.rigidBodies.add(entity, { handle: bodyDef.handle });
    this.world.meshes.add(entity, { mesh });
    this.world.transforms.add(entity, {
      position: bodyDef.position,
      rotation: bodyDef.rotation,
      scale: { x: 1, y: 1, z: 1 }
    });
    this.world.bodyDefs.add(entity, bodyDef);
    this.world.physicsProps.add(entity, { friction: 0.5, restitution: 0.7 });

    this.updateCount();
  }

  spawnSphere() {
    const x = (Math.random() - 0.5) * 5;
    const y = 10 + Math.random() * 5;
    const z = (Math.random() - 0.5) * 5;
    const color = this.generateRandomColor();

    const bodyDef = this.physicsService.createSphere(x, y, z);
    const mesh = this.sceneService.createMesh(bodyDef, color);

    const entity = this.world.createEntity();
    this.world.rigidBodies.add(entity, { handle: bodyDef.handle });
    this.world.meshes.add(entity, { mesh });
    this.world.transforms.add(entity, {
      position: bodyDef.position,
      rotation: bodyDef.rotation,
      scale: { x: 1, y: 1, z: 1 }
    });
    this.world.bodyDefs.add(entity, bodyDef);
    this.world.physicsProps.add(entity, { friction: 0.5, restitution: 0.8 });

    this.updateCount();
  }

  deleteEntity(e: Entity) {
    this.destroyEntityInternal(e);
    this.updateCount();
  }

  duplicateEntity(e: Entity) {
    const t = this.world.transforms.get(e);
    const meshRef = this.world.meshes.get(e);
    const scale = t?.scale ?? { x: 1, y: 1, z: 1 };
    
    if (t && meshRef) {
      const x = t.position.x + 1;
      const y = t.position.y;
      const z = t.position.z;
      
      const material = meshRef.mesh.material as THREE.MeshStandardMaterial;
      const color = material.color.getHex();

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
        rotation: bodyDef.rotation,
        scale: { ...scale } 
      });
      this.world.bodyDefs.add(newEntity, bodyDef);
      
      // Copy physics props if exists
      const props = this.world.physicsProps.get(e);
      if (props) {
          this.world.physicsProps.add(newEntity, { ...props });
          this.physicsService.updateBodyMaterial(bodyDef.handle, props);
      } else {
          this.world.physicsProps.add(newEntity, { friction: 0.5, restitution: 0.7 });
      }
      
      // Apply scale to new entity if needed
      if (scale.x !== 1 || scale.y !== 1 || scale.z !== 1) {
          this.physicsService.updateBodyScale(bodyDef.handle, bodyDef, scale);
      }

      this.updateCount();
    }
  }

  reset() {
    this.selectedEntity.set(null);
    this.isPaused.set(false);
    this.setGravity(-9.81);
    
    const allEntities = Array.from(this.world.entities);
    allEntities.forEach(e => this.destroyEntityInternal(e));
    
    this.physicsService.resetWorld();
    this.cameraControl.reset();

    this.updateCount();
  }

  // --- Interaction API ---

  raycastFromScreen(clientX: number, clientY: number): Entity | null {
    const domEl = this.sceneService.getDomElement();
    if (!domEl) return null;

    const rect = domEl.getBoundingClientRect();
    
    // Normalized device coordinates (-1 to +1)
    this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.sceneService.getCamera());

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

  focusSelectedEntity() {
      const e = this.selectedEntity();
      if (e === null) return;
      const t = this.world.transforms.get(e);
      if (!t) return;
      this.cameraControl.focusOn(new THREE.Vector3(t.position.x, t.position.y, t.position.z));
  }

  // --- Controls ---

  togglePause() {
    this.isPaused.update(v => !v);
  }

  setPaused(val: boolean) {
    this.isPaused.set(val);
  }

  toggleWireframe() {
      this.wireframe.update(v => !v);
      this.sceneService.setWireframeForAll(this.wireframe());
  }

  setGravity(val: number) {
    this.gravityY.set(val);
    this.physicsService.setGravity(val);
  }
  
  setLightSettings(settings: { ambient: number, directional: number, color: string }) {
      this.sceneService.setLightSettings({
          ambientIntensity: settings.ambient,
          dirIntensity: settings.directional,
          dirColor: settings.color
      });
  }
  
  setCameraPreset(preset: CameraViewPreset) {
      this.cameraControl.setPreset(preset);
  }

  // --- Entity Updates from Inspector ---

  updateEntityScale(e: Entity, scale: { x: number, y: number, z: number }) {
      // Clamp scale to sane limits
      const s = Math.max(0.1, Math.min(scale.x, 10));
      const safeScale = { x: s, y: s, z: s };

      const t = this.world.transforms.get(e);
      const def = this.world.bodyDefs.get(e);
      const rb = this.world.rigidBodies.get(e);

      if (t && def && rb) {
          t.scale = safeScale;
          this.physicsService.updateBodyScale(rb.handle, def, safeScale);
      }
  }

  updateEntityPhysics(e: Entity, props: { friction: number, restitution: number }) {
      // Clamp props
      const safeProps = {
          friction: Math.max(0, Math.min(props.friction, 5)),
          restitution: Math.max(0, Math.min(props.restitution, 2))
      };

      const rb = this.world.rigidBodies.get(e);
      if (rb) {
          this.physicsService.updateBodyMaterial(rb.handle, safeProps);
          this.world.physicsProps.add(e, safeProps);
      }
  }

  undo() { console.log('Undo triggered'); }
  redo() { console.log('Redo triggered'); }

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
