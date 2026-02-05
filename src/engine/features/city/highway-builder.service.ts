
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { SceneContext } from '../../level/scene-context';
import { CityGridService } from './city-grid.service';
import { CITY_CONFIG } from './city.config';

@Injectable({
    providedIn: 'root'
})
export class HighwayBuilderService {
    private readonly CFG = CITY_CONFIG;

    constructor(private grid: CityGridService) {}

    buildSpine(ctx: SceneContext, startX: number, endX: number, z: number) {
        const segmentLen = this.CFG.ASSETS.HIGHWAY_STRAIGHT.length;
        const alignedStart = Math.floor(startX / segmentLen) * segmentLen;
        const alignedEnd = Math.ceil(endX / segmentLen) * segmentLen;

        for (let x = alignedStart; x <= alignedEnd; x += segmentLen) {
            ctx.spawn(
                this.CFG.ASSETS.HIGHWAY_STRAIGHT.id,
                x,
                this.CFG.HIGHWAY_Y,
                z,
                { alignToBottom: true }
            );

            this.grid.markRect(x, z, segmentLen, 20, 'highway');

            // Add structural supports
            if (x % (segmentLen * 2) === 0) {
                ctx.spawn(
                    this.CFG.ASSETS.HIGHWAY_PILLAR.id,
                    x,
                    0,
                    z,
                    { alignToBottom: true }
                );
                this.grid.mark(x, z, 'reserved');
            }

            // Randomly add exit ramps at 150m intervals
            if (Math.abs(x) > 60 && x % 150 === 0) {
                this.buildExit(ctx, x, z);
            }
        }
    }

    private buildExit(ctx: SceneContext, x: number, z: number) {
        const rampLen = this.CFG.ASSETS.RAMP.length;
        const offsetZ = 20; // Distance from highway spine

        // 1. Connection Platform at Highway level
        ctx.spawn('terrain-road', x, this.CFG.HIGHWAY_Y, z - 13.5, { alignToBottom: true });

        // 2. The Ramp itself (Spawns at midpoint of slope)
        // Height is 12, length 30. Slope is approx 21 degrees.
        const rot = new THREE.Euler(0, Math.PI, 0); // Face South (away from -90)
        ctx.spawn(this.CFG.ASSETS.RAMP.id, x, 0, z - 15 - rampLen / 2, { alignToBottom: true, rotation: rot });

        // 3. Structural supports for the ramp
        ctx.spawn(this.CFG.ASSETS.HIGHWAY_PILLAR.id, x, 0, z - 13.5, { alignToBottom: true, scale: 1 });

        // 4. Grid reservations
        this.grid.markRect(x, z - 15 - rampLen / 2, 15, rampLen, 'highway');
        this.grid.mark(x, z - 15 - rampLen, 'intersection'); // Mark ground junction
    }
}
