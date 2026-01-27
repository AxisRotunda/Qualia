
import { Injectable, signal, inject } from '@angular/core';
import { PhysicsService, PhysicsBodyDef } from './physics.service';
import { SceneService } from './scene.service';
import { CameraControlService, CameraViewPreset } from './camera-control.service';
import { FlyControlsService } from './fly-controls.service';
import { EntityLibraryService } from './entity-library.service';
import { SceneRegistryService } from './scene-registry.service';
import { ParticleService } from './particle.service';
import { World, Entity } from '../engine/core';
import * as THREE from 'three';

export interface DebugState {
    paused: boolean;
    bodyCount: number;
    singleUpdate: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class EngineService {
  public world = new World();
  
  private isRunning = false;
  private lastTime = 0;
  private frameCount = 0;
  private lastFpsTime = 0;
  
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  // Signals
  fps = signal(0);
  physicsTime = signal(0);
  renderTime = signal(0);
  objectCount = signal(0);
  loading = signal(true);
  selectedEntity = signal<Entity | null>(null);
  
  isPaused = signal(false);
  gravityY = signal(-9.81);
  wireframe = signal(false);
  texturesEnabled = signal(false);
  transformMode = signal<'translate' | 'rotate' | 'scale'>('translate');
  
  mode = signal<'edit' | 'explore'>('edit');
  
  canUndo = signal(false);
  canRedo = signal(false);

  // Invariant Monitor Signal
  debugInfo = signal<DebugState>({ paused: false, bodyCount: 0, singleUpdate: null });

  private sceneRegistry = inject(SceneRegistryService);

  constructor(
    public physicsService: PhysicsService,
    public sceneService: SceneService,
    private cameraControl: CameraControlService,
    private flyControls: FlyControlsService,
    public entityLib: EntityLibraryService,
    private particleService: ParticleService
  ) {
      // Expose debug tools globally
      (window as any).qualiaDebug = {
          spawnAll: () => this.debugSpawnAllTemplates(),
          validate: () => this.debugValidateScene()
      };
  }

  async init(canvas: HTMLCanvasElement) {
    try {
      await this.physicsService.init();
      this.sceneService.init(canvas);
      
      // Coherence Check
      this.entityLib.validateTemplates(this.sceneService);
      
      this.cameraControl.init(this.sceneService.getCamera(), canvas);
      this.flyControls.init(this.sceneService.getCamera(), canvas);

      this.loading.set(false);
      this.startLoop();
      
      // Default initial scene
      this.sceneRegistry.loadScene(this, 'city');
    } catch (err) {
      console.error("Engine Init Failed", err);
    }
  }

  toggleMode() {
      const current = this.mode();
      const canvas = this.sceneService.getDomElement();

      if (current === 'edit') {
          this.mode.set('explore');
          this.cameraControl.setEnabled(false);
          this.flyControls.enable();
          this.selectedEntity.set(null); 
          canvas.requestPointerLock();
      } else {
          this.mode.set('edit');
          this.flyControls.disable();
          this.cameraControl.setEnabled(true);
          document.exitPointerLock();
      }
  }

  private startLoop() {
    this.isRunning = true;
    
    const loop = (time: number) => {
      if (!this.isRunning) return;
      requestAnimationFrame(loop);

      const dt = time - this.lastTime;
      this.lastTime = time;
      this.updateStats(time);

      let singleUpdateTarget: string | null = null;

      // 1. Camera & Controls Update
      if (this.mode() === 'explore') {
          this.flyControls.update(dt);
      } else {
          // Disable orbit controls if dragging gizmo
          const dragging = this.sceneService.isDraggingGizmo();
          this.cameraControl.setEnabled(!dragging);
          this.cameraControl.update();
      }
      
      this.particleService.update(dt);

      // 2. State Invariants
      if (!this.isPaused()) {
        // --- RUNNING STATE: Physics -> Mesh (O(N)) ---
        const pStart = performance.now();
        this.physicsService.step();
        this.physicsTime.set(Math.round((performance.now() - pStart) * 100) / 100);

        // Sync all bodies
        this.world.rigidBodies.forEach((rb, entity) => {
          // Skip selected if dragging (Gizmo has priority)
          if (this.mode() === 'edit' && this.sceneService.isDraggingGizmo() && this.selectedEntity() === entity) return;

          const pose = this.physicsService.getBodyPose(rb.handle);
          if (pose) {
            const transform = this.world.transforms.get(entity);
            if (transform) {
                // Physics -> ECS
                transform.position = pose.p;
                transform.rotation = pose.q;

                // ECS -> Mesh
                const meshRef = this.world.meshes.get(entity);
                if (meshRef) {
                    meshRef.mesh.position.set(transform.position.x, transform.position.y, transform.position.z);
                    meshRef.mesh.quaternion.set(transform.rotation.x, transform.rotation.y, transform.rotation.z, transform.rotation.w);
                    meshRef.mesh.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);
                }
            }
          }
        });

      } else {
          // --- PAUSED STATE: Mesh -> Physics (O(1)) ---
          // Only update if editing (dragging gizmo)
          if (this.mode() === 'edit' && this.sceneService.isDraggingGizmo()) {
              const entity = this.selectedEntity();
              if (entity !== null) {
                  this.updateSingleEntityPose(entity);
                  singleUpdateTarget = `Entity_${entity}`;
              }
          }
      }

      // Update Invariant Monitor
      this.debugInfo.set({
          paused: this.isPaused(),
          bodyCount: this.world.rigidBodies.size, // Accessing internal map size (O(1))
          singleUpdate: singleUpdateTarget
      });
      
      // 3. Visuals
      if (this.selectedEntity() !== null) {
        this.sceneService.updateSelectionHelper();
      }

      const rStart = performance.now();
      this.sceneService.render();
      this.renderTime.set(Math.round((performance.now() - rStart) * 100) / 100);
    };
    
    requestAnimationFrame(loop);
  }

  // Optimized O(1) update for the single entity being edited
  private updateSingleEntityPose(entity: Entity) {
      const meshRef = this.world.meshes.get(entity);
      const transform = this.world.transforms.get(entity);
      
      if (meshRef && transform) {
          // 1. Mesh (Modified by Gizmo) -> ECS
          const mesh = meshRef.mesh;
          
          // Update ECS transform
          transform.position = { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z };
          transform.rotation = { x: mesh.quaternion.x, y: mesh.quaternion.y, z: mesh.quaternion.z, w: mesh.quaternion.w };
          transform.scale = { x: mesh.scale.x, y: mesh.scale.y, z: mesh.scale.z };
          
          // 2. ECS -> Physics
          const rb = this.world.rigidBodies.get(entity);
          const def = this.world.bodyDefs.get(entity);
          if (rb) {
              this.physicsService.updateBodyTransform(rb.handle, transform.position, transform.rotation);
              if (def) this.physicsService.updateBodyScale(rb.handle, def, transform.scale);
          }
      }
  }

  // --- Entity Management ---

  private destroyEntityInternal(e: Entity) {
    if (this.selectedEntity() === e) this.selectedEntity.set(null);
    const rb = this.world.rigidBodies.get(e);
    if (rb) this.physicsService.removeBody(rb.handle);
    const meshRef = this.world.meshes.get(e);
    if (meshRef) this.sceneService.removeMesh(meshRef.mesh);
    this.world.destroyEntity(e);
  }

  spawnBox() {
     const pos = new THREE.Vector3((Math.random()-0.5)*5, 10 + Math.random()*5, (Math.random()-0.5)*5);
     this.entityLib.spawnFromTemplate(this, 'prop-crate', pos);
  }

  spawnSphere() {
      // Replaced with template spawn for consistency
      const pos = new THREE.Vector3((Math.random()-0.5)*5, 10 + Math.random()*5, (Math.random()-0.5)*5);
      this.entityLib.spawnFromTemplate(this, 'prop-barrel', pos);
  }

  spawnFromTemplate(id: string) {
      const pos = this.raycastGround() ?? new THREE.Vector3(0, 5, 0);
      this.entityLib.spawnFromTemplate(this, id, pos);
  }
  
  loadScene(id: string) {
      this.sceneRegistry.loadScene(this, id);
  }

  deleteEntity(e: Entity) {
    this.destroyEntityInternal(e);
    this.updateCount();
  }

  duplicateEntity(e: Entity) {
      const t = this.world.transforms.get(e);
      const meshRef = this.world.meshes.get(e);
      const oldDef = this.world.bodyDefs.get(e);
      const scale = t?.scale ?? { x: 1, y: 1, z: 1 };
      
      if (t && meshRef && oldDef) {
        const x = t.position.x + 1;
        const y = t.position.y;
        const z = t.position.z;
        const color = (meshRef.mesh.material as THREE.MeshStandardMaterial).color.getHex();
        
        let bodyDef;
        let typeName = 'Object';

        if (oldDef.type === 'sphere') {
           bodyDef = this.physicsService.createSphere(x, y, z, oldDef.radius, oldDef.mass);
           typeName = 'Sphere';
        } else if (oldDef.type === 'cylinder') {
            bodyDef = this.physicsService.createCylinder(x, y, z, oldDef.height!, oldDef.radius!, oldDef.mass);
            typeName = 'Cylinder';
        } else {
           bodyDef = this.physicsService.createBox(x, y, z, oldDef.size?.w, oldDef.size?.h, oldDef.size?.d, oldDef.mass);
           typeName = 'Box';
        }

        const mesh = this.sceneService.createMesh(bodyDef, { color }); 
        const newEntity = this.world.createEntity();
        
        this.world.rigidBodies.add(newEntity, { handle: bodyDef.handle });
        this.world.meshes.add(newEntity, { mesh });
        this.world.transforms.add(newEntity, { position: bodyDef.position, rotation: bodyDef.rotation, scale: {x:1,y:1,z:1} });
        this.world.bodyDefs.add(newEntity, bodyDef);
        this.world.physicsProps.add(newEntity, { friction: 0.5, restitution: 0.5 });
        this.world.names.add(newEntity, `${typeName}_${newEntity}`);
        
        const tNew = this.world.transforms.get(newEntity)!;
        tNew.scale = {...scale};
        this.physicsService.updateBodyScale(bodyDef.handle, bodyDef, scale);

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
    
    if (this.mode() === 'explore') this.toggleMode();

    this.updateCount();
  }

  // --- Debug / Regression Helpers ---
  
  debugSpawnAllTemplates() {
    this.reset();
    console.group('Debug: Spawn All Templates');
    let x = -10;
    this.entityLib.templates.forEach(tpl => {
      console.log(`Spawning ${tpl.id} [${tpl.materialId}] at x=${x}`);
      const ent = this.entityLib.spawnFromTemplate(this, tpl.id, new THREE.Vector3(x, 5, 0));
      // Visual verification of material assignment
      const meshRef = this.world.meshes.get(ent);
      if(meshRef) {
          const mat = meshRef.mesh.material as THREE.MeshStandardMaterial;
          console.log(` > Assigned Mat: color=${mat.color.getHexString()} rough=${mat.roughness}`);
      }
      x += 5;
    });
    console.groupEnd();
  }

  debugValidateScene() {
    console.group('Debug: Validate Scene');
    let errors = 0;
    this.world.entities.forEach(e => {
       const rb = this.world.rigidBodies.get(e);
       const mesh = this.world.meshes.get(e);
       if (!rb) { console.error(`Entity ${e} missing rigid body`); errors++; }
       if (!mesh) { console.error(`Entity ${e} missing mesh`); errors++; }
       
       if (mesh) {
           const mat = mesh.mesh.material as THREE.MeshStandardMaterial;
           if (!mat) { console.error(`Entity ${e} has no material`); errors++; }
       }
    });
    console.log(`Validation complete. ${this.world.entities.size} entities. ${errors} errors.`);
    console.groupEnd();
  }

  // --- Interaction ---

  raycastFromScreen(clientX: number, clientY: number): Entity | null {
    if (this.mode() === 'explore') return null;
    if (this.sceneService.isDraggingGizmo()) return this.selectedEntity();

    const domEl = this.sceneService.getDomElement();
    if (!domEl) return null;
    const rect = domEl.getBoundingClientRect();
    
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
    return intersects.length > 0 ? (meshToEntity.get(intersects[0].object.id) ?? null) : null;
  }
  
  raycastGround(): THREE.Vector3 | null {
      this.raycaster.setFromCamera(new THREE.Vector2(0,0), this.sceneService.getCamera());
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const target = new THREE.Vector3();
      return this.raycaster.ray.intersectPlane(plane, target);
  }

  focusSelectedEntity() {
      const e = this.selectedEntity();
      if (e === null) return;
      const t = this.world.transforms.get(e);
      if (t) this.cameraControl.focusOn(new THREE.Vector3(t.position.x, t.position.y, t.position.z));
  }

  togglePause() { this.isPaused.update(v => !v); }
  setPaused(val: boolean) { this.isPaused.set(val); }
  toggleWireframe() { this.wireframe.update(v => !v); this.sceneService.setWireframeForAll(this.wireframe()); }
  toggleTextures() { this.texturesEnabled.update(v => !v); this.sceneService.setTexturesEnabled(this.texturesEnabled()); }
  setTransformMode(mode: 'translate'|'rotate'|'scale') { this.transformMode.set(mode); this.sceneService.setTransformMode(mode); }
  setGravity(val: number) { this.gravityY.set(val); this.physicsService.setGravity(val); }
  
  setLightSettings(s: any) { this.sceneService.setLightSettings(s); }
  setCameraPreset(p: CameraViewPreset) { this.cameraControl.setPreset(p); }

  setEntityName(e: Entity, name: string) { this.world.names.add(e, name); this.objectCount.update(c=>c); }
  getEntityName(e: Entity): string { return this.world.names.get(e) ?? `Entity_${e}`; }

  updateEntityPhysics(e: Entity, props: {friction: number, restitution: number}) {
      const safe = { friction: Math.max(0, Math.min(props.friction, 5)), restitution: Math.max(0, Math.min(props.restitution, 2)) };
      const rb = this.world.rigidBodies.get(e);
      if(rb) {
          this.physicsService.updateBodyMaterial(rb.handle, safe);
          this.world.physicsProps.add(e, safe);
      }
  }
  
  undo() {}
  redo() {}
  resize(w: number, h: number) { this.sceneService.resize(w, h); }
  private updateStats(time: number) {
    this.frameCount++;
    if(time - this.lastFpsTime >= 1000) { this.fps.set(this.frameCount); this.frameCount=0; this.lastFpsTime=time; }
  }
  updateCount() { this.objectCount.set(this.world.entities.size); }
}
