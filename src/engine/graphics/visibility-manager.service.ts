
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { EntityStoreService } from '../ecs/entity-store.service';
import { CameraManagerService } from './camera-manager.service';
import { EntityLifecycleService, EntityCreatedEvent, EntityDestroyedEvent } from '../ecs/entity-lifecycle.service';
import { SpatialGrid } from '../utils/spatial-grid';
import { EngineStateService } from '../engine-state.service';
import { Entity } from '../core';

@Injectable({
    providedIn: 'root'
})
export class VisibilityManagerService {
    private entityStore = inject(EntityStoreService);
    private cameraManager = inject(CameraManagerService);
    private lifecycle = inject(EntityLifecycleService);
    private state = inject(EngineStateService);

    // Spatial Partitioning for Static Objects
    private staticGrid = new SpatialGrid(32); // 32m chunks

    // Optimization: Use Array instead of Set for faster iteration in hot loop
    private dynamicEntities: Entity[] = [];
    private dynamicEntityIndices = new Int32Array(10000).fill(-1);

    // Config
    private readonly CULL_DIST = 150;
    private readonly CULL_DIST_SQ = this.CULL_DIST * this.CULL_DIST;
    private readonly SHADOW_CULL_DIST_SQ = 80 * 80; // ACTOR_OPTIM: Disable actor shadows > 80m
    private readonly UPDATE_THRESHOLD = 2.0;

    // State
    private lastUpdatePos = new THREE.Vector3(Infinity, Infinity, Infinity);

    // Cache the visible set to compare against
    private visibleSet = new Set<Entity>();

    // Scratch Context for Query Callbacks (Zero-Allocation)
    private _queryCamPos = new THREE.Vector3();
    private _queryDistSq = 0;
    private _scratchPos = { x: 0, y: 0, z: 0 };

    constructor() {
        this.lifecycle.onEntityCreated.subscribe(e => this.handleCreation(e));
        this.lifecycle.onEntityDestroyed.subscribe(e => this.handleDestruction(e));
        this.lifecycle.onWorldReset.subscribe(() => this.reset());
    }

    private handleCreation(event: EntityCreatedEvent) {
        const { entity, isStatic } = event;
        if (isStatic) {
            const t = this.entityStore.world.transforms.get(entity);
            if (t) {
                this.staticGrid.insert(entity, t.position.x, t.position.z);
            }
        } else {
            this.addDynamic(entity);
        }
    }

    private handleDestruction(event: EntityDestroyedEvent) {
        const entity = event.entity;
        this.staticGrid.remove(entity);
        this.removeDynamic(entity);
        this.visibleSet.delete(entity);
    }

    private reset() {
        this.staticGrid.clear();
        this.dynamicEntities.length = 0;
        this.dynamicEntityIndices.fill(-1);
        this.visibleSet.clear();
        this.lastUpdatePos.set(Infinity, Infinity, Infinity);
    }

    updateVisibility(): number {
        const cam = this.cameraManager.getCamera();
        const camPos = cam.position;

        // 1. Check if we need to update Static Culling
        const distMoved = camPos.distanceTo(this.lastUpdatePos);
        const updateStatic = distMoved > this.UPDATE_THRESHOLD;

        if (updateStatic) {
            this.lastUpdatePos.copy(camPos);
            this.cullStatic(camPos);
        }

        // 2. Always update Dynamic entities
        this.cullDynamic(camPos);

        return this.visibleSet.size;
    }

    private cullStatic(camPos: THREE.Vector3) {
    // A. Prune current visible static
        for (const entity of this.visibleSet) {
            if (this.isDynamic(entity)) continue;

            // Optimized check: Use copyPosition to avoid object allocation
            if (!this.entityStore.world.transforms.has(entity)) {
                this.visibleSet.delete(entity);
                continue;
            }

            this.entityStore.world.transforms.copyPosition(entity, this._scratchPos);

            const dx = this._scratchPos.x - camPos.x;
            const dz = this._scratchPos.z - camPos.z;
            if ((dx * dx + dz * dz) > this.CULL_DIST_SQ) {
                this.setVisible(entity, false);
                this.visibleSet.delete(entity);
            }
        }

        // B. Query Grid & Add new visible
        this._queryCamPos.copy(camPos);
        this._queryDistSq = this.CULL_DIST_SQ;

        this.staticGrid.query(camPos.x, camPos.z, this.CULL_DIST, this.onStaticQueryHit);
    }

    private onStaticQueryHit = (entity: number): void => {
        if (this.visibleSet.has(entity)) return;

        if (!this.entityStore.world.transforms.has(entity)) return;

        this.entityStore.world.transforms.copyPosition(entity, this._scratchPos);

        const dx = this._scratchPos.x - this._queryCamPos.x;
        const dz = this._scratchPos.z - this._queryCamPos.z;

        if ((dx * dx + dz * dz) <= this._queryDistSq) {
            this.setVisible(entity, true);
            this.visibleSet.add(entity);
        }
    };

    private cullDynamic(camPos: THREE.Vector3) {
        const len = this.dynamicEntities.length;
        const playerEntity = this.state.playerEntity();
        const isFP = this.state.viewMode() === 'fp';

        for (let i = 0; i < len; i++) {
            const entity = this.dynamicEntities[i];

            // --- FIRST-PERSON HYGIENE (RUN_ACTOR) ---
            // Hide player model completely if camera is inside them
            if (entity === playerEntity && isFP) {
                this.setVisible(entity, false);
                this.visibleSet.delete(entity);
                continue;
            }

            // Always show selected (except when player in FP)
            if (this.entityStore.selectedEntity() === entity) {
                this.setVisible(entity, true);
                this.visibleSet.add(entity);
                continue;
            }

            if (!this.entityStore.world.transforms.has(entity)) continue;

            this.entityStore.world.transforms.copyPosition(entity, this._scratchPos);

            const dx = this._scratchPos.x - camPos.x;
            const dy = this._scratchPos.y - camPos.y;
            const dz = this._scratchPos.z - camPos.z;
            const distSq = dx * dx + dy * dy + dz * dz;

            const isVisible = distSq <= this.CULL_DIST_SQ;

            this.setVisible(entity, isVisible);

            if (isVisible) {
                this.visibleSet.add(entity);

                // ACTOR_OPTIM: Shadow Culling for distant actors
                const meshRef = this.entityStore.world.meshes.get(entity);
                if (meshRef) {
                    meshRef.mesh.castShadow = distSq < this.SHADOW_CULL_DIST_SQ;
                }
            } else {
                this.visibleSet.delete(entity);
            }
        }
    }

    private setVisible(entity: Entity, visible: boolean) {
        // RUN_INDUSTRY: User overrides priority
        if (this.entityStore.hidden.has(entity)) {
            visible = false;
        }

        const meshRef = this.entityStore.world.meshes.get(entity);
        if (meshRef) {
            meshRef.mesh.visible = visible;
        }
    }

    // --- Dynamic Array Management ---

    private addDynamic(entity: Entity) {
        this.ensureCapacity(entity);
        if (this.dynamicEntityIndices[entity] !== -1) return;

        const idx = this.dynamicEntities.length;
        this.dynamicEntities.push(entity);
        this.dynamicEntityIndices[entity] = idx;
    }

    private removeDynamic(entity: Entity) {
        if (entity >= this.dynamicEntityIndices.length) return;

        const idx = this.dynamicEntityIndices[entity];
        if (idx === -1) return;

        const lastIdx = this.dynamicEntities.length - 1;
        const lastEntity = this.dynamicEntities[lastIdx];

        if (idx !== lastIdx) {
            this.dynamicEntities[idx] = lastEntity;
            this.dynamicEntityIndices[lastEntity] = idx;
        }

        this.dynamicEntities.pop();
        this.dynamicEntityIndices[entity] = -1;
    }

    private isDynamic(entity: Entity): boolean {
        if (entity >= this.dynamicEntityIndices.length) return false;
        return this.dynamicEntityIndices[entity] !== -1;
    }

    private ensureCapacity(entityId: number) {
        if (entityId >= this.dynamicEntityIndices.length) {
            let newSize = this.dynamicEntityIndices.length;
            while (newSize <= entityId) newSize *= 2;

            const newArr = new Int32Array(newSize).fill(-1);
            newArr.set(this.dynamicEntityIndices);
            this.dynamicEntityIndices = newArr;
        }
    }
}
