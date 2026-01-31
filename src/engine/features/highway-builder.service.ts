
import { Injectable } from '@angular/core';
import { SceneContext } from '../level/scene-context';
import { CityGridService } from './city-grid.service';
import { CITY_CONFIG } from '../../config/asset-registry';

@Injectable({
  providedIn: 'root'
})
export class HighwayBuilderService {
  private readonly CFG = CITY_CONFIG;

  constructor(private grid: CityGridService) {}

  buildSpine(ctx: SceneContext, startX: number, endX: number, z: number) {
      const segmentLen = this.CFG.ASSETS.HIGHWAY_STRAIGHT.length;
      
      // Align startX to segment length to ensure continuity
      const alignedStart = Math.floor(startX / segmentLen) * segmentLen;
      const alignedEnd = Math.ceil(endX / segmentLen) * segmentLen;

      for (let x = alignedStart; x <= alignedEnd; x += segmentLen) {
          // 1. Spawn Highway Segment
          ctx.spawn(
              this.CFG.ASSETS.HIGHWAY_STRAIGHT.id, 
              x, 
              this.CFG.HIGHWAY_Y, 
              z, 
              { alignToBottom: true }
          );

          // 2. Reserve Grid Space (Highway Shadow)
          // Mark a buffer zone under highway to prevent building overlap
          this.grid.markRect(x, z, segmentLen, 20, 'highway');

          // 3. Spawn Pillars (Every 2nd segment for rhythm)
          // We check grid first to ensure we don't block an arterial road crossing
          if (x % (segmentLen * 2) === 0) {
              // Only place pillar if not crossing a road
              // We'll define road crossings in the network phase, but highway usually comes first.
              // So we reserve this spot as structure.
              const pid = ctx.spawn(
                  this.CFG.ASSETS.HIGHWAY_PILLAR.id, 
                  x, 
                  0, 
                  z, 
                  { alignToBottom: true }
              );
              // Scale pillar to reach from ground to highway underside
              // Highway Y is top of surface. Thickness ~1.5. 
              // Target height = 12 - 1.5 = 10.5
              // Pillar default height is 8 (cylinder template) or 1 (mesh).
              // Using prop-pillar (cylinder 1x8x1).
              // Scale Y = 10.5 / 8 = 1.3125
              // The building service logic scales pillars to 12?
              // Let's use hardcoded visual scale that looks good.
              ctx.modify(pid, { scale: { x: 2, y: 1.5, z: 2 } }); 
              
              this.grid.mark(x, z, 'reserved'); // Hard block
          }
      }
  }
}
