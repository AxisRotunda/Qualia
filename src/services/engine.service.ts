
import { Injectable, signal, computed } from '@angular/core';
import { PhysicsService, PhysicsBodyDef } from './physics.service';
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
  transformMode = signal<'translate' | 'rotate' | 'scale'>('translate');

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

      // Effect to disable OrbitControls when Gizmo is dragging
      const checkDragging = () => {
          if (this.sceneService.isDraggingGizmo()) {
              this.cameraControl.setEnabled(false);
          } else {
              this.cameraControl.setEnabled(true);
          }
      };
      // We can't use `effect` here easily without injection context, so we poll or use callback in loop
      // Better: SceneService exposes a signal.
      // But for now, we'll check it in the loop or use a primitive approach.
      // Actually, let's just check `isDraggingGizmo` in the update loop or subscription.
      
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

      // 1. Camera Control Check
      if (this.sceneService.isDraggingGizmo()) {
         this.cameraControl.setEnabled(false);
      } else {
         this.cameraControl.setEnabled(true);
      }

      // 2. Camera Update
      this.cameraControl.update();

      // 3. Physics Step
      if (!this.isPaused()) {
        const pStart = performance.now();
        this.physicsService.step();
        this.physicsTime.set(Math.round((performance.now() - pStart) * 100) / 100);

        // 4. System: Sync Physics -> ECS
        this.world.rigidBodies.forEach((rb, entity) => {
          // If we are dragging this entity with gizmo, DO NOT overwrite with physics
          if (this.sceneService.isDraggingGizmo() && this.selectedEntity() === entity) return;

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

      // 5. System: Sync ECS -> Render (AND Sync Gizmo -> Physics)
      this.world.meshes.forEach((meshRef, entity) => {
        const transform = this.world.transforms.get(entity);
        if (transform) {
            
          // If dragging gizmo, read FROM mesh TO physics/transform
          if (this.sceneService.isDraggingGizmo() && this.selectedEntity() === entity) {
              const mesh = meshRef.mesh;
              
              // Update Transform Component
              transform.position = { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z };
              transform.rotation = { x: mesh.quaternion.x, y: mesh.quaternion.y, z: mesh.quaternion.z, w: mesh.quaternion.w };
              transform.scale = { x: mesh.scale.x, y: mesh.scale.y, z: mesh.scale.z };
              
              // Force Update Physics Body
              const rb = this.world.rigidBodies.get(entity);
              const def = this.world.bodyDefs.get(entity);

              if (rb) {
                  this.physicsService.updateBodyTransform(rb.handle, transform.position, transform.rotation);
                  if (def) {
                      // Only update scale if changed significantly to avoid thrashing collider recreation
                      // For now, simpler to just do it.
                      this.physicsService.updateBodyScale(rb.handle, def, transform.scale);
                  }
              }

          } else {
              // Standard Sync: ECS -> Mesh
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

  stepSimulation() {
      if (!this.isPaused()) return; // Only step if paused
      
      this.physicsService.step();
      
      // Sync one frame
      this.world.rigidBodies.forEach((rb, entity) => {
          const pose = this.physicsService.getBodyPose(rb.handle);
          if (pose) {
            const transform = this.world.transforms.get(entity);
            if (transform) {
                transform.position = pose.p;
                transform.rotation = pose.q;
            }
          }
      });
      
      // Render sync happens in loop regardless
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
    this.setupEntity(entity, bodyDef, mesh, 'Box');
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
    this.setupEntity(entity, bodyDef, mesh, 'Sphere');
    this.updateCount();
  }
  
  private setupEntity(entity: Entity, bodyDef: PhysicsBodyDef, mesh: THREE.Mesh, baseName: string) {
    this.world.rigidBodies.add(entity, { handle: bodyDef.handle });
    this.world.meshes.add(entity, { mesh });
    this.world.transforms.add(entity, {
      position: bodyDef.position,
      rotation: bodyDef.rotation,
      scale: { x: 1, y: 1, z: 1 }
    });
    this.world.bodyDefs.add(entity, bodyDef);
    this.world.physicsProps.add(entity, { friction: 0.5, restitution: 0.7 });
    this.world.names.add(entity, `${baseName}_${entity}`);
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
      let typeName = 'Object';
      
      if (geo instanceof THREE.SphereGeometry) {
         bodyDef = this.physicsService.createSphere(x, y, z);
         typeName = 'Sphere';
      } else {
         bodyDef = this.physicsService.createBox(x, y, z);
         typeName = 'Box';
      }

      const mesh = this.sceneService.createMesh(bodyDef, color);
      const newEntity = this.world.createEntity();
      
      this.setupEntity(newEntity, bodyDef, mesh, typeName);
      
      // Copy scale/props override defaults
      const tNew = this.world.transforms.get(newEntity);
      if(tNew) tNew.scale = {...scale};

      const props = this.world.physicsProps.get(e);
      if (props) {
          this.world.physicsProps.add(newEntity, { ...props });
          this.physicsService.updateBodyMaterial(bodyDef.handle, props);
      }
      
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
    // If we are dragging gizmo, block raycast selection so we don't accidentally select background
    if (this.sceneService.isDraggingGizmo()) return this.selectedEntity();

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
  
  setTransformMode(mode: 'translate' | 'rotate' | 'scale') {
      this.transformMode.set(mode);
      this.sceneService.setTransformMode(mode);
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

  setEntityName(e: Entity, name: string) {
      this.world.names.add(e, name);
      // Force update UI if needed (signal based should handle it if consuming correctly)
      // Since world.names is a Map, we might need to signal update or rely on computed
      // The SceneTree uses computed off objectCount, which doesn't change on rename. 
      // We will add a signal trigger for metadata updates or just refresh the list.
      // For MVP, just update the map. The UI might need a trigger.
      this.objectCount.update(c => c); // Hack to trigger computed
  }
  
  getEntityName(e: Entity): string {
      return this.world.names.get(e) ?? `Entity_${e}`;
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
