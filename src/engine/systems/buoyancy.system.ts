
import { Injectable, inject } from '@angular/core';
import { GameSystem } from '../system';
import { PhysicsService } from '../../services/physics.service';
import { EntityStoreService } from '../ecs/entity-store.service';
import { EngineStateService } from '../engine-state.service';
import { WATER_CONFIG } from '../../config/water.config';

/**
 * BuoyancySystem: CPU-side water simulation.
 * RUN_INDUSTRY: Replicates Shader wave math for exact pose parity.
 * RUN_OPT: Zero-allocation vector logic.
 */
@Injectable({
    providedIn: 'root'
})
export class BuoyancySystem implements GameSystem {
    readonly priority = 190;

    private physicsService = inject(PhysicsService);
    private entityStore = inject(EntityStoreService);
    private state = inject(EngineStateService);

    private readonly _impulse = { x: 0, y: 0, z: 0 };
    private readonly _pos = { x: 0, y: 0, z: 0 };
    private readonly _vel = { x: 0, y: 0, z: 0 };

    /**
   * Replicates getWave GLSL logic exactly.
   */
    getWaveHeight(x: number, z: number, time: number): number {
        const c = WATER_CONFIG;

        // Wave 1: Sine Swell (Roll)
        const p1 = (x * c.w1.dirX + z * c.w1.dirZ) * c.w1.freq + time * c.w1.speed;
        let h = Math.sin(p1) * c.w1.amp;

        // Wave 2: Surface Chop (Sharp peaks)
        const p2 = (x * c.w2.dirX + z * c.w2.dirZ) * c.w2.freq + time * c.w2.speed;
        const s2 = Math.sin(p2);
        h += (s2 * s2 * s2) * c.w2.amp;

        return h;
    }

    update(dt: number, totalTime: number) {
        const waterLevel = this.state.waterLevel();
        if (waterLevel === null) return;

        const world = this.physicsService.rWorld;
        if (!world) return;

        const timeScale = this.state.waveTimeScale();
        const time = (totalTime / 1000) * timeScale;
        const dtSec = (dt / 1000) * this.state.timeScale();

        const fluidDensity = 1025.0; // Salt water density
        const gravity = 9.81;

        this.entityStore.world.buoyant.forEach((isBuoyant, entity) => {
            if (!isBuoyant) return;

            const rbHandle = this.entityStore.world.rigidBodies.getHandle(entity);
            if (rbHandle === undefined) return;

            const body = world.getRigidBody(rbHandle);
            if (!body || body.isFixed() || body.isKinematic()) return;

            // RUN_REPAIR: Finite safety checks to prevent WASM panic
            if (!this.physicsService.world.copyBodyPosition(rbHandle, this._pos)) return;
            this.physicsService.world.copyBodyLinVel(rbHandle, this._vel);

            const density = this.entityStore.world.physicsProps.getDensity(entity);
            const mass = body.mass();

            if (mass <= 0 || density <= 0) return;

            const volumeTotal = mass / density;
            const characteristicLength = Math.max(0.1, Math.cbrt(volumeTotal));

            const waveHeight = this.getWaveHeight(this._pos.x, this._pos.z, time);
            const currentWaterLevel = waterLevel + waveHeight;

            // Check if submerged
            if (this._pos.y < currentWaterLevel) {
                const depth = currentWaterLevel - this._pos.y;

                // 1. Buoyant Upward Force
                // Ratio of object below surface
                const submergedRatio = Math.min(Math.max(depth / characteristicLength, 0), 1.0);
                const force = fluidDensity * (volumeTotal * submergedRatio) * gravity;

                const fy = force * dtSec;
                if (Number.isFinite(fy)) {
                    this._impulse.x = 0; this._impulse.y = fy; this._impulse.z = 0;
                    body.applyImpulse(this._impulse, true);

                    // 2. Dynamic Drag Force (Resistance)
                    const speedSq = this._vel.x * this._vel.x + this._vel.y * this._vel.y + this._vel.z * this._vel.z;
                    if (speedSq > 0.001) {
                        // Hydrodynamic resistance formula: -k * v^2
                        const drag = (0.05 * Math.sqrt(speedSq) + 0.08 * speedSq) * (characteristicLength * characteristicLength) * fluidDensity * dtSec;

                        if (Number.isFinite(drag)) {
                            this._impulse.x = -this._vel.x * drag;
                            this._impulse.y = -this._vel.y * drag;
                            this._impulse.z = -this._vel.z * drag;
                            body.applyImpulse(this._impulse, true);
                        }
                    }
                }
            }
        });
    }
}
