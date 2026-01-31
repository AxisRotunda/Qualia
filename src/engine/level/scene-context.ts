
import * as THREE from 'three';
import { EngineService } from '../../services/engine.service';
import { SpawnOptions } from '../../services/factories/template-factory.service';
import { Entity } from '../core';
import { TerrainLayerConfig } from '../features/terrain-manager.service';

export interface ModifyProps {
    position?: { x: number, y: number, z: number };
    rotation?: THREE.Euler | THREE.Quaternion;
    scale?: { x: number, y: number, z: number } | number;
}

export class SceneContext {
  constructor(public engine: EngineService) {}

  // --- Environment ---

  atmosphere(preset: 'clear'|'fog'|'night'|'forest'|'ice'|'space'|'city'|'blizzard'|'desert') {
    this.engine.env.setAtmosphere(preset);
    return this;
  }

  weather(type: 'clear' | 'snow' | 'rain' | 'ash') {
    this.engine.env.setWeather(type);
    return this;
  }

  time(hour: number) {
    this.engine.env.setTimeOfDay(hour);
    return this;
  }

  light(settings: { dirIntensity?: number; ambientIntensity?: number; dirColor?: string }) {
    this.engine.env.setLightSettings(settings);
    return this;
  }

  gravity(g: number) {
    this.engine.sim.setGravity(g);
    return this;
  }

  /**
   * Configures the global water simulation.
   * @param level Y-level of the water surface. Pass null to disable.
   * @param timeScale Speed of wave animation (default 1.0)
   */
  water(level: number | null, timeScale: number = 1.0) {
      this.engine.state.waterLevel.set(level);
      this.engine.state.waveTimeScale.set(timeScale);
      return this;
  }

  // --- Entity Management ---

  spawn(templateId: string, x: number, y: number, z: number, options?: SpawnOptions & { rotation?: THREE.Euler }): Entity {
    const pos = new THREE.Vector3(x, y, z);
    const rot = options?.rotation 
      ? new THREE.Quaternion().setFromEuler(options.rotation) 
      : undefined;
    
    // Access template via exposed library on EngineService Facade
    const tpl = this.engine.library.getTemplate(templateId); 
    
    if (tpl) {
        return this.engine.sys.entityFactory.spawn(
          this.engine.entityMgr, 
          tpl, 
          pos, 
          rot, 
          options
        );
    } else {
        console.warn(`SceneContext: Template '${templateId}' not found.`);
        return -1;
    }
  }

  modify(entity: Entity, props: ModifyProps) {
      this.applyModification(entity, props);
  }

  modifyBatch(entities: Entity[], props: ModifyProps) {
      for (const entity of entities) {
          this.applyModification(entity, props);
      }
  }

  private applyModification(entity: Entity, props: ModifyProps) {
      const store = this.engine.entityMgr;
      
      // We check existence
      if (!store.world.transforms.has(entity)) return;

      // 1. Handle Scale (Requires Physics Rebuild)
      if (props.scale !== undefined) {
          const s = typeof props.scale === 'number' 
              ? { x: props.scale, y: props.scale, z: props.scale } 
              : props.scale;
          
          // Update ECS
          store.world.transforms.setScale(entity, s.x, s.y, s.z);
          
          // Update Physics Collider
          const rb = store.world.rigidBodies.get(entity);
          const def = store.world.bodyDefs.get(entity);
          if (rb && def) {
              this.engine.sys.physicsFactory['shapes'].updateBodyScale(rb.handle, def, s);
          }
      }

      // 2. Handle Transform (Position / Rotation)
      let updatePhysicsTransform = false;
      let pos = { x: 0, y: 0, z: 0 };
      let rot = { x: 0, y: 0, z: 0, w: 1 };
      
      // Get current values first (Snapshot)
      const current = store.world.transforms.get(entity)!;
      pos = { ...current.position };
      rot = { ...current.rotation };

      if (props.position) {
          pos = { ...props.position };
          store.world.transforms.setPosition(entity, pos.x, pos.y, pos.z);
          updatePhysicsTransform = true;
      }

      if (props.rotation) {
          if (props.rotation instanceof THREE.Euler) {
              const q = new THREE.Quaternion().setFromEuler(props.rotation);
              rot = { x: q.x, y: q.y, z: q.z, w: q.w };
          } else {
              rot = { x: props.rotation.x, y: props.rotation.y, z: props.rotation.z, w: props.rotation.w };
          }
          store.world.transforms.setRotation(entity, rot.x, rot.y, rot.z, rot.w);
          updatePhysicsTransform = true;
      }

      // Sync Physics Body Position/Rotation
      if (updatePhysicsTransform) {
          const rb = store.world.rigidBodies.get(entity);
          if (rb) {
              this.engine.physicsService.world.updateBodyTransform(rb.handle, pos, rot);
          }
      }

      // 3. Sync Visuals Immediately (Avoids 1-frame lag)
      const meshRef = store.world.meshes.get(entity);
      if (meshRef) {
          // Re-read scale as it might have changed in step 1
          const updated = store.world.transforms.get(entity)!;
          
          meshRef.mesh.position.set(pos.x, pos.y, pos.z);
          meshRef.mesh.quaternion.set(rot.x, rot.y, rot.z, rot.w);
          meshRef.mesh.scale.set(updated.scale.x, updated.scale.y, updated.scale.z);
          meshRef.mesh.updateMatrix();
      }
  }

  // --- Terrain ---

  async terrain(config: Omit<TerrainLayerConfig, 'centerResolution' | 'edgeResolution'> & { resolution?: number }) {
      const fullConfig: TerrainLayerConfig = {
          centerResolution: 100, // Default for mobile optimization
          edgeResolution: 50,
          ...config
      };
      
      if (config.resolution) {
          fullConfig.centerResolution = config.resolution;
          fullConfig.edgeResolution = Math.floor(config.resolution / 2);
      }

      await this.engine.terrain.generateSurroundingGrid(fullConfig);
      return this;
  }

  // --- Utilities ---

  grid(cols: number, rows: number, step: number, callback: (x: number, z: number, col: number, row: number) => void) {
    const offsetX = (cols * step) / 2;
    const offsetZ = (rows * step) / 2;
    
    for(let i=0; i<cols; i++) {
        for(let j=0; j<rows; j++) {
            const x = i * step - offsetX;
            const z = j * step - offsetZ;
            callback(x, z, i, j);
        }
    }
  }

  scatter(count: number, range: number, callback: (x: number, z: number) => void) {
      for(let i=0; i<count; i++) {
          const x = (Math.random() - 0.5) * range;
          const z = (Math.random() - 0.5) * range;
          callback(x, z);
      }
  }

  // --- Camera ---

  cameraPreset(preset: 'top' | 'front' | 'side') {
      this.engine.input.setCameraPreset(preset);
      return this;
  }

  cameraLookAt(x: number, y: number, z: number, dist: number = 20) {
      const cam = this.engine.sceneService.getCamera();
      cam.position.set(x, y + (dist * 0.5), z + dist);
      cam.lookAt(x, y, z);
      return this;
  }
}
