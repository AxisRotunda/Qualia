
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { SceneContext } from '../level/scene-context';
import { CityGridService } from './city-grid.service';
import { CITY_CONFIG } from '../../config/asset-registry';

@Injectable({
  providedIn: 'root'
})
export class RoadNetworkService {
  private readonly CFG = CITY_CONFIG;

  constructor(private grid: CityGridService) {}

  generateGrid(ctx: SceneContext, radiusBlocks: number) {
      const blockSize = this.CFG.BLOCK_SIZE; // 30
      const limit = radiusBlocks * blockSize;

      // Iterate Grid Lines (Arterials)
      // We skip every other 30m block to create 60m blocks for buildings
      // Actually, let's do a 4-block supergrid for main roads like the old algo
      // Old algo: (gx % 4 === 0)
      
      const step = blockSize; 

      for (let x = -limit; x <= limit; x += step) {
          for (let z = -limit; z <= limit; z += step) {
              
              const isMainX = (Math.abs(x) % (blockSize * 4) === 0);
              const isMainZ = (Math.abs(z) % (blockSize * 4) === 0);
              
              // Only place road if it's a main arterial
              if (isMainX || isMainZ) {
                  this.placeRoadNode(ctx, x, z, isMainX, isMainZ);
              }
          }
      }
  }

  private placeRoadNode(ctx: SceneContext, x: number, z: number, isMainX: boolean, isMainZ: boolean) {
      // Check collision with Highway (Hard Reserved)
      // 'highway' type in grid means "under the highway". We CAN place roads there (underpass).
      // 'reserved' means a pillar is there. We CANNOT place roads there.
      const currentType = this.grid.get(x, z);
      if (currentType === 'reserved') return;

      // Determine Type
      if (isMainX && isMainZ) {
          // Intersection
          ctx.spawn(this.CFG.ASSETS.INTERSECTION.id, x, 0, z, { alignToBottom: true });
          this.grid.mark(x, z, 'intersection');
          
          // Traffic Lights
          if (Math.random() > 0.5) {
             ctx.spawn('prop-sensor-unit', x - 6, 0, z - 6, { alignToBottom: true });
          }

      } else if (isMainX) {
          // Road running along Z axis (Visual rotation needed?)
          // Asset 'terrain-road' is 15x15. It has no direction unless it has stripes.
          // 'terrain-road' usually straight. 
          // If we want it to run along X line, it aligns X?
          // Wait, isMainX means x is fixed, z varies. So it's a Z-running road.
          // Rotate 90 deg.
          ctx.spawn(this.CFG.ASSETS.ROAD_STRAIGHT.id, x, 0, z, { 
              alignToBottom: true, 
              rotation: new THREE.Euler(0, Math.PI/2, 0) 
          });
          this.grid.mark(x, z, 'road');

      } else if (isMainZ) {
          // Road running along X axis
          ctx.spawn(this.CFG.ASSETS.ROAD_STRAIGHT.id, x, 0, z, { alignToBottom: true });
          this.grid.mark(x, z, 'road');
      }
  }
}
