
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
      const t = store.world.transforms.get(entity);
      if (!t) return;

      // 1. Handle Scale (Requires Physics Rebuild)
      if (props.scale !== undefined) {
          const s = typeof props.scale === 'number' 
              ? { x: props.scale, y: props.scale, z: props.scale } 
              : props.scale;
          
          // Update ECS
          t.scale = { ...s };
          
          // Update Physics Collider
          const rb = store.world.rigidBodies.get(entity);
          const def = store.world.bodyDefs.get(entity);
          if (rb && def) {
              this.engine.sys.physicsFactory['shapes'].updateBodyScale(rb.handle, def, t.scale);
          }
      }

      // 2. Handle Transform (Position / Rotation)
      let updatePhysicsTransform = false;

      if (props.position) {
          t.position = { ...props.position };
          updatePhysicsTransform = true;
      }

      if (props.rotation) {
          if (props.rotation instanceof THREE.Euler) {
              const q = new THREE.Quaternion().setFromEuler(props.rotation);
              t.rotation = { x: q.x, y: q.y, z: q.z, w: q.w };
          } else {
              t.rotation = { x: props.rotation.x, y: props.rotation.y, z: props.rotation.z, w: props.rotation.w };
          }
          updatePhysicsTransform = true;
      }

      // Sync Physics Body Position/Rotation
      if (updatePhysicsTransform) {
          const rb = store.world.rigidBodies.get(entity);
          if (rb) {
              this.engine.physicsService.world.updateBodyTransform(rb.handle, t.position, t.rotation);
          }
      }

      // 3. Sync Visuals Immediately (Avoids 1-frame lag)
      const meshRef = store.world.meshes.get(entity);
      if (meshRef) {
          meshRef.mesh.position.set(t.position.x, t.position.y, t.position.z);
          meshRef.mesh.quaternion.set(t.rotation.x, t.rotation.y, t.rotation.z, t.rotation.w);
          meshRef.mesh.scale.set(t.scale.x, t.scale.y, t.scale.z);
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
