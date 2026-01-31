
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { NatureTerrainService } from '../../services/generators/nature/nature-terrain.service';
import { SceneGraphService } from '../graphics/scene-graph.service';
import { PhysicsFactoryService } from '../../services/factories/physics-factory.service';
import { MaterialService } from '../../services/material.service';
import { PhysicsService } from '../../services/physics.service';
import { EntityStoreService } from '../ecs/entity-store.service';
import { EngineStateService } from '../engine-state.service';
import { CameraManagerService } from '../graphics/camera-manager.service';
import { EntityLifecycleService } from '../ecs/entity-lifecycle.service';
import { yieldToMain } from '../utils/thread.utils';

export interface TerrainLayerConfig {
    id: string;
    type: 'standard' | 'dunes';
    materialId: string;
    physicsMaterial: string;
    chunkSize: number;
    center: { x: number, z: number };
    // LOD Settings
    centerResolution: number; // Segments for center chunk
    edgeResolution: number;   // Segments for surrounding chunks
}

@Injectable({
  providedIn: 'root'
})
export class TerrainManagerService {
  private terrainGen = inject(NatureTerrainService);
  private sceneGraph = inject(SceneGraphService);
  private physicsFactory = inject(PhysicsFactoryService);
  private materials = inject(MaterialService);
  private physics = inject(PhysicsService);
  private entityStore = inject(EntityStoreService);
  private state = inject(EngineStateService);
  private cameraManager = inject(CameraManagerService);
  private lifecycle = inject(EntityLifecycleService);

  // Culling State
  private readonly chunks: THREE.Mesh[] = [];
  private readonly frustum = new THREE.Frustum();
  private readonly projScreenMatrix = new THREE.Matrix4();
  private cullingActive = false;

  constructor() {
      // Clear chunks on world reset to prevent memory leaks
      this.lifecycle.onWorldReset.subscribe(() => {
          this.chunks.length = 0;
      });
      
      // Start the specialized culling loop
      this.startCullingLoop();
  }

  private startCullingLoop() {
      if (this.cullingActive) return;
      this.cullingActive = true;

      const tick = () => {
          this.updateCulling();
          requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
  }

  private updateCulling() {
      if (this.chunks.length === 0) return;

      const camera = this.cameraManager.getCamera();
      if (!camera) return;

      // Update Frustum from Camera
      this.projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      this.frustum.setFromProjectionMatrix(this.projScreenMatrix);

      // Perform AABB Culling
      for (const mesh of this.chunks) {
          const worldBox = mesh.userData['worldBox'] as THREE.Box3;
          if (worldBox) {
              // Set visibility directly. 
              // Note: mesh.frustumCulled is set to false in creation to avoid double-checking.
              mesh.visible = this.frustum.intersectsBox(worldBox);
          }
      }
  }

  async generateSurroundingGrid(config: TerrainLayerConfig) {
      // 3x3 Grid
      // Center: 0,0
      // Surroundings: -1,-1 to 1,1
      
      // 1. Generate Center (High LOD, Physics, Shadows)
      await this.createChunk(config, 0, 0, true);

      // 2. Generate Surroundings (Low LOD, Visual Only, No Shadows)
      const surroundings = [
          [-1, -1], [0, -1], [1, -1],
          [-1, 0],           [1, 0],
          [-1, 1],  [0, 1],  [1, 1]
      ];

      // Yield to let UI render before heavy batch
      await yieldToMain();

      for (const [ox, oz] of surroundings) {
          await this.createChunk(config, ox, oz, false);
          // Yield occasionally to prevent freeze
          if (Math.random() > 0.6) await yieldToMain();
      }
  }

  private async createChunk(config: TerrainLayerConfig, cx: number, cz: number, isCenter: boolean) {
      const offsetX = config.center.x + (cx * config.chunkSize);
      const offsetZ = config.center.z + (cz * config.chunkSize);
      
      const resolution = isCenter ? config.centerResolution : config.edgeResolution;
      const lodStep = isCenter ? 1 : 4; // Higher step = lower detail for edge

      // Worker Call
      const { heights, normals } = await this.terrainGen.generateHeightDataAsync(
          config.chunkSize, 
          config.chunkSize, 
          resolution, 
          resolution, 
          offsetX, 
          offsetZ, 
          lodStep, 
          config.type
      );

      // Visual Mesh via Service
      // Note: Geo segments must match data resolution adjusted by LOD step
      const geoSegments = Math.floor(resolution / lodStep);
      
      const geo = this.terrainGen.createTerrainGeometry(
          config.chunkSize, 
          config.chunkSize, 
          geoSegments, 
          geoSegments, 
          heights, 
          normals
      );

      // Calculate World Bounding Box for Culling before creating Mesh
      // Geo is rotated -90 X inside createTerrainGeometry, so Y is Up.
      geo.computeBoundingBox();

      const mat = this.materials.getMaterial(config.materialId);
      const mesh = new THREE.Mesh(geo, mat);
      
      mesh.position.set(offsetX, 0, offsetZ);
      mesh.updateMatrixWorld(true); // Force matrix update to calc world AABB
      
      // Cache World AABB for fast culling
      if (geo.boundingBox) {
          const worldBox = geo.boundingBox.clone().applyMatrix4(mesh.matrixWorld);
          // Expand slightly to avoid flickering at edges
          worldBox.expandByScalar(0.5);
          mesh.userData['worldBox'] = worldBox;
      }
      
      // Disable Three.js internal sphere culling in favor of our AABB culling
      mesh.frustumCulled = false;
      
      // Optimization: Shadows only on center chunk
      mesh.castShadow = isCenter;
      mesh.receiveShadow = true;

      this.sceneGraph.addEntity(mesh);
      this.chunks.push(mesh);

      // ECS & Physics (Center Only)
      if (isCenter) {
          // Physics Body
          const bodyDef = this.physicsFactory.createHeightfield(
              offsetX, 0, offsetZ,
              geoSegments + 1, geoSegments + 1,
              heights,
              { x: config.chunkSize, y: 1, z: config.chunkSize }
          );

          // Apply Material Props
          // We assume a generic 'ground' friction if not fully specified, but allow override
          const physMat = this.physics.materials.getMaterialData(config.physicsMaterial);
          this.physics.materials.updateBodyMaterial(bodyDef.handle, { 
              friction: physMat.friction, 
              restitution: physMat.restitution 
          });

          // Create Entity
          const ent = this.entityStore.world.createEntity();
          this.entityStore.world.rigidBodies.add(ent, { handle: bodyDef.handle });
          this.entityStore.world.meshes.add(ent, { mesh });
          this.entityStore.world.transforms.add(ent, { 
              position: {x: offsetX, y: 0, z: offsetZ}, 
              rotation: {x: 0, y: 0, z: 0, w: 1}, 
              scale: {x: 1, y: 1, z: 1} 
          });
          this.entityStore.world.bodyDefs.add(ent, bodyDef);
          this.entityStore.world.names.add(ent, `${config.id} Chunk ${cx},${cz}`);
          
          // Register
          this.physics.registry.register(bodyDef.handle, ent);
          this.entityStore.objectCount.update(c => c + 1);
      }
  }
}
