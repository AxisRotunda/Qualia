
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { SceneContext } from '../../level/scene-context';
import { CityGridService } from './city-grid.service';
import { CITY_CONFIG } from './city.config';

@Injectable({
    providedIn: 'root'
})
export class RoadNetworkService {
    private readonly CFG = CITY_CONFIG;

    constructor(private grid: CityGridService) {}

    generateGrid(ctx: SceneContext, radiusBlocks: number, yOffset: number = 0.01) {
        const blockSize = this.CFG.BLOCK_SIZE;
        const limit = radiusBlocks * blockSize;
        const step = blockSize;

        for (let x = -limit; x <= limit; x += step) {
            for (let z = -limit; z <= limit; z += step) {
                const isMainX = (Math.abs(x) % (blockSize * 4) === 0);
                const isMainZ = (Math.abs(z) % (blockSize * 4) === 0);
                if (isMainX || isMainZ) {
                    this.placeRoadNode(ctx, x, z, isMainX, isMainZ, yOffset);
                }
            }
        }
    }

    private placeRoadNode(ctx: SceneContext, x: number, z: number, isMainX: boolean, isMainZ: boolean, y: number) {
        const currentType = this.grid.get(x, z);
        if (currentType === 'reserved') return;

        if (isMainX && isMainZ) {
            ctx.spawn(this.CFG.ASSETS.INTERSECTION.id, x, y, z, { alignToBottom: true });
            this.grid.mark(x, z, 'intersection');
            if (Math.random() > 0.5) {
                ctx.spawn('prop-sensor-unit', x - 6, y + 0.1, z - 6, { alignToBottom: true });
            }
        } else if (isMainX) {
            ctx.spawn(this.CFG.ASSETS.ROAD_STRAIGHT.id, x, y, z, {
                alignToBottom: true,
                rotation: new THREE.Euler(0, Math.PI / 2, 0)
            });
            this.grid.mark(x, z, 'road');
        } else if (isMainZ) {
            ctx.spawn(this.CFG.ASSETS.ROAD_STRAIGHT.id, x, y, z, { alignToBottom: true });
            this.grid.mark(x, z, 'road');
        }
    }
}
