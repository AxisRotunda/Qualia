
import { Injectable, inject, signal } from '@angular/core';
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
import { Entity } from '../schema';
import { GameSystem } from '../system';

export interface TerrainLayerConfig {
    id: string;
    type: 'standard' | 'dunes' | 'islands' | 'volcano';
    materialId: string;
    physicsMaterial: string;
    chunkSize: number;
    center: { x: number, z: number };
    centerResolution: number;
    edgeResolution: number;
}

@Injectable({
    providedIn: 'root'
})
export class TerrainManagerService implements GameSystem {
    // Priority: Run just before RenderSystem (900)
    readonly priority = 890;

    private terrainGen = inject(NatureTerrainService);
    private sceneGraph = inject(SceneGraphService);
    private physicsFactory = inject(PhysicsFactoryService);
    private materials = inject(MaterialService);
    private physics = inject(PhysicsService);
    private entityStore = inject(EntityStoreService);
    private state = inject(EngineStateService);
    private cameraManager = inject(CameraManagerService);
    private lifecycle = inject(EntityLifecycleService);

    private readonly chunks: THREE.Mesh[] = [];
    private readonly meshPool: THREE.Mesh[] = [];

    private readonly frustum = new THREE.Frustum();
    private readonly projScreenMatrix = new THREE.Matrix4();

    // Industry: Track active type for global verification
    public readonly activeTerrainType = signal<'standard' | 'dunes' | 'islands' | 'volcano'>('standard');

    // RUN_OPT: Static offsets to prevent allocation churn
    private static readonly GRID_OFFSETS = [
        [-1, -1], [0, -1], [1, -1],
        [-1, 0],           [1, 0],
        [-1, 1],  [0, 1],  [1, 1]
    ];

    constructor() {
        this.lifecycle.onWorldReset.subscribe(() => {
            this.purgeAllChunks();
        });
    }

    update(dt: number, totalTime: number): void {
        if (this.state.loading()) return;

        const len = this.chunks.length;
        if (len === 0) return;

        const camera = this.cameraManager.getCamera();
        if (!camera) return;

        // Update Frustum once per system cycle
        this.projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
        this.frustum.setFromProjectionMatrix(this.projScreenMatrix);

        for (let i = 0; i < len; i++) {
            const mesh = this.chunks[i];
            const worldBox = mesh.userData.worldBox as THREE.Box3;
            if (worldBox) {
                mesh.visible = this.frustum.intersectsBox(worldBox);
            }
        }
    }

    async generateSurroundingGrid(config: TerrainLayerConfig) {
        if (!Number.isFinite(config.chunkSize) || config.chunkSize <= 0) {
            throw new Error('Invalid terrain chunkSize');
        }

        // Update global state for RepairSystem access
        this.activeTerrainType.set(config.type);

        // 1. Core Center Chunk
        await this.createChunk(config, 0, 0, true);

        // 2. Surroundings (Batched & Yielding)
        const surroundings = TerrainManagerService.GRID_OFFSETS;
        for (let i = 0; i < surroundings.length; i += 2) {
            const batch = surroundings.slice(i, i + 2);
            await Promise.all(batch.map(([ox, oz]) => this.createChunk(config, ox, oz, false)));
            await yieldToMain();
        }
    }

    private async createChunk(config: TerrainLayerConfig, cx: number, cz: number, isCenter: boolean) {
        const offsetX = config.center.x + (cx * config.chunkSize);
        const offsetZ = config.center.z + (cz * config.chunkSize);
        const resolution = isCenter ? config.centerResolution : config.edgeResolution;
        const lodStep = isCenter ? 1 : 4;

        const workerCornerX = offsetX - (config.chunkSize / 2);
        const workerCornerZ = offsetZ - (config.chunkSize / 2);

        const response = await this.terrainGen.generateHeightDataAsync(
            config.chunkSize, config.chunkSize, resolution, resolution, workerCornerX, workerCornerZ, lodStep, config.type as any
        );

        const { heights, normals, gridW, gridD } = response;

        if (!heights || heights.length === 0 || !Number.isFinite(heights[0])) {
            console.error(`[TERRAIN_STABILITY] Corrupt chunk detected at [${cx}, ${cz}]. Aborting synthesis.`);
            return;
        }

        const poolKey = `res_${resolution}`;
        let mesh = this.getFromPool(poolKey);

        if (mesh) {
            this.terrainGen.updateTerrainGeometry(mesh.geometry, heights, normals);
            mesh.material = this.materials.getMaterial(config.materialId);
        } else {
            const geo = this.terrainGen.createTerrainGeometry(config.chunkSize, config.chunkSize, gridW - 1, gridD - 1, heights, normals);
            const mat = this.materials.getMaterial(config.materialId);
            mesh = new THREE.Mesh(geo, mat);
            mesh.userData.poolKey = poolKey;
        }

        mesh.position.set(offsetX, 0, offsetZ);
        mesh.updateMatrixWorld(true);
        mesh.geometry.computeBoundingBox();

        if (mesh.geometry.boundingBox) {
            const worldBox = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);
            worldBox.expandByScalar(2.0); // Padding for wave height/displacement
            mesh.userData.worldBox = worldBox;
        }

        mesh.frustumCulled = false; // Manual system-level culling used instead
        mesh.castShadow = isCenter;
        mesh.receiveShadow = true;
        mesh.visible = true;

        this.sceneGraph.addEntity(mesh);
        this.chunks.push(mesh);

        if (isCenter) {
            this.registerPhysics(mesh, heights, gridW, gridD, config, offsetX, offsetZ);
        }
    }

    private registerPhysics(mesh: THREE.Mesh, heights: Float32Array, gridW: number, gridD: number, config: TerrainLayerConfig, offsetX: number, offsetZ: number) {
        try {
            const nr = Math.floor(gridD);
            const nc = Math.floor(gridW);

            // RUN_REPAIR: WASM Guard - heightfields require at least 2 rows and 2 cols
            if (nr < 2 || nc < 2) {
                console.warn(`[TERRAIN_STABILITY] Skipping physics for undersized chunk: ${nr}x${nc}`);
                return;
            }

            if (heights.length !== nr * nc) {
                console.error(`[TERRAIN_STABILITY] Buffer mismatch for chunk ${config.id}: Expected ${nr * nc}, got ${heights.length}`);
                return;
            }

            const bodyDef = this.physicsFactory.createHeightfield(
                offsetX, 0, offsetZ, nr, nc, heights, { x: config.chunkSize, y: 1, z: config.chunkSize }
            );
            const physMat = this.physics.materials.getMaterialData(config.physicsMaterial);
            this.physics.materials.updateBodyMaterial(bodyDef.handle, { friction: physMat.friction, restitution: physMat.restitution });

            const ent = this.entityStore.world.createEntity();
            this.entityStore.world.rigidBodies.add(ent, bodyDef.handle);
            this.entityStore.world.meshes.add(ent, { mesh });
            this.entityStore.world.transforms.add(ent, {
                position: { x: offsetX, y: 0, z: offsetZ },
                rotation: { x: 0, y: 0, z: 0, w: 1 },
                scale: { x: 1, y: 1, z: 1 }
            });
            this.entityStore.world.bodyDefs.add(ent, bodyDef);
            this.entityStore.world.names.add(ent, `${config.id}_CORE_HF`);
            this.physics.registry.register(bodyDef.handle, ent);
            this.entityStore.objectCount.update(c => c + 1);

            mesh.userData.entityId = ent;
        } catch (err) {
            console.error('[TERRAIN_STABILITY] Physics registration fault for chunk:', {
                id: config.id,
                dims: `${gridD}x${gridW}`,
                offset: `${offsetX}, ${offsetZ}`,
                error: err
            });
        }
    }

    private getFromPool(key: string): THREE.Mesh | null {
        for (let i = 0; i < this.meshPool.length; i++) {
            if (this.meshPool[i].userData.poolKey === key) {
                return this.meshPool.splice(i, 1)[0];
            }
        }
        return null;
    }

    private purgeAllChunks() {
        for (const mesh of this.chunks) {
            this.sceneGraph.removeEntity(mesh);
            mesh.userData.entityId = -1;
            mesh.visible = false;
            this.meshPool.push(mesh);
        }
        this.chunks.length = 0;
    }
}
