
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { GameSystem } from '../system';
import { EntityStoreService } from '../ecs/entity-store.service';
import { EngineStateService } from '../engine-state.service';
import { CameraManagerService } from '../graphics/camera-manager.service';
import { AnimationRef, Entity } from '../schema';

/**
 * AnimationSystem: Updates per-entity AnimationMixers.
 * Priority 350: Post-Physics, Pre-Render.
 * RUN_INDUSTRY: Implements Distance-Based Throttling (LOD).
 */
@Injectable({
    providedIn: 'root'
})
export class AnimationSystem implements GameSystem {
    readonly priority = 350;

    private entityStore = inject(EntityStoreService);
    private state = inject(EngineStateService);
    private cameraManager = inject(CameraManagerService);

    // Cached frame state
    private dtSec = 0;
    private frameCount = 0;
    private readonly _camPos = new THREE.Vector3();
    private readonly _entPos = new THREE.Vector3();

    // Distances squared for performance
    private readonly LOD_1_SQ = 30 * 30; // 30m
    private readonly LOD_2_SQ = 70 * 70; // 70m

    // RUN_OPT: Bound callback to avoid closure allocation per frame per entity
    private readonly updateEntity = (animRef: AnimationRef, entity: Entity) => {
        // 1. Culling Check
        const meshRef = this.entityStore.world.meshes.get(entity);
        if (meshRef && !meshRef.mesh.visible) return;

        // 2. Distance Check (LOD)
        // Retrieve position directly from TransformStore (Zero-alloc copy)
        this.entityStore.world.transforms.copyPosition(entity, this._entPos);
        const distSq = this._camPos.distanceToSquared(this._entPos);

        // 3. Throttling Logic
        // Near: Update every frame
        // Mid (30-70m): Update every 2nd frame
        // Far (>70m): Update every 4th frame
        if (distSq > this.LOD_1_SQ) {
            if (distSq > this.LOD_2_SQ) {
                if (this.frameCount % 4 !== (entity % 4)) return; // Spread load based on entity ID
                animRef.mixer.update(this.dtSec * 4);
            } else {
                if (this.frameCount % 2 !== (entity % 2)) return;
                animRef.mixer.update(this.dtSec * 2);
            }
        } else {
            animRef.mixer.update(this.dtSec);
        }
    };

    update(dt: number): void {
    // Skip updates if the engine is loading or the main menu is blocking
        if (this.state.loading()) return;

        this.frameCount++;

        // Scale dt based on simulation time scale
        this.dtSec = (dt / 1000) * this.state.timeScale();

        // Update camera position cache for this frame
        this.cameraManager.getCamera().getWorldPosition(this._camPos);

        // Iterate efficiently using the bound callback
        this.entityStore.world.animations.forEach(this.updateEntity);
    }
}
