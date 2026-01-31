
import * as THREE from 'three';
import { SceneContext } from '../../engine/level/scene-context';
import { EngineService } from '../../services/engine.service';
import { yieldToMain } from '../../engine/utils/thread.utils';
import { CityGridService } from '../../engine/features/city-grid.service';
import { HighwayBuilderService } from '../../engine/features/highway-builder.service';
import { RoadNetworkService } from '../../engine/features/road-network.service';
import { CITY_CONFIG } from '../../config/asset-registry';

export class CityAlgorithm {
  
  static async generate(ctx: SceneContext, engine: EngineService) {
      // 1. Initialize Services (Transient for this generation)
      // Since these are simple logic classes without heavy state dependency, we instantiate them.
      const grid = new CityGridService();
      const highwayBuilder = new HighwayBuilderService(grid);
      const networkBuilder = new RoadNetworkService(grid);

      engine.state.loadingStage.set('PLANNING ZONES');
      grid.reset();

      // Config
      const cityRadius = 360; 
      const highwayZ = -90; // Offset highway from center

      // 2. Phase I: Infrastructure (The Skeleton)
      engine.state.loadingStage.set('ERECTING HIGHWAY');
      
      // Highway Spine (X-Axis)
      highwayBuilder.buildSpine(ctx, -cityRadius - 60, cityRadius + 60, highwayZ);
      await yieldToMain();

      // Road Network
      engine.state.loadingStage.set('PAVING STREETS');
      networkBuilder.generateGrid(ctx, 12); // 12 blocks radius
      await yieldToMain();

      // 3. Phase II: Parcels (The Flesh)
      engine.state.loadingStage.set('ZONING LOTS');
      
      // Iterate Grid for empty spots
      const step = CITY_CONFIG.GRID_UNIT;
      const range = cityRadius;

      for (let x = -range; x <= range; x += step) {
          
          // Yield occasionally
          if (x % (step * 10) === 0) {
             engine.state.loadingProgress.set(30 + ((x + range) / (range * 2)) * 60);
             await yieldToMain();
          }

          for (let z = -range; z <= range; z += step) {
              
              // Check if space is occupied by Infra
              if (!grid.isFree(x, z)) {
                  // If it's just a 'highway' shadow (overhead), we can build low structures or props
                  if (grid.get(x, z) === 'highway') {
                      this.fillUnderpass(ctx, x, z);
                  }
                  continue;
              }

              // Determine Zone Logic
              const dist = Math.sqrt(x*x + z*z);
              
              // Seed based on coordinates for deterministic look
              const seed = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
              const rnd = seed - Math.floor(seed);

              this.spawnParcel(ctx, x, z, dist, rnd);
          }
      }

      // 4. Final Polish
      engine.state.loadingStage.set('FINALIZING');
      ctx.spawn('structure-monolith', 0, 0, 0, { alignToBottom: true, scale: 2 });
  }

  private static spawnParcel(ctx: SceneContext, x: number, z: number, dist: number, rnd: number) {
      // Rotation aligned to grid (0, 90, 180, 270)
      const rotY = Math.floor(rnd * 4) * (Math.PI / 2);
      const rot = new THREE.Euler(0, rotY, 0);

      // Zoning Rules
      if (dist < 100) {
          // Downtown (Dense, Tall)
          if (rnd > 0.6) {
              ctx.spawn('building-skyscraper', x, 0, z, { alignToBottom: true, rotation: rot });
          } else if (rnd > 0.3) {
              ctx.spawn('building-tall', x, 0, z, { alignToBottom: true, rotation: rot });
          } else {
              // Plaza
              ctx.spawn('terrain-platform', x, 0.2, z, { alignToBottom: true });
              ctx.spawn('prop-scifi-hub', x, 0, z, { alignToBottom: true }); // Using hub as plaza feature
          }
      } else if (dist < 250) {
          // Midtown (Medium, Commercial)
          if (rnd > 0.7) {
              ctx.spawn('building-wide', x, 0, z, { alignToBottom: true, rotation: rot });
          } else if (rnd > 0.4) {
              ctx.spawn('building-small', x, 0, z, { alignToBottom: true, rotation: rot });
          } else {
              // Parking / Open
              ctx.spawn('terrain-road', x, 0, z, { alignToBottom: true, scale: 1 }); // Asphalt lot
              if (rnd > 0.2) ctx.spawn('prop-crate', x, 0, z, { alignToBottom: true });
          }
      } else {
          // Outskirts (Industrial, Sparse)
          if (rnd > 0.8) {
              ctx.spawn('building-small', x, 0, z, { alignToBottom: true, rotation: rot });
          } else if (rnd > 0.5) {
              // Industrial props
              ctx.spawn('terrain-platform', x, 0.1, z, { alignToBottom: true });
              ctx.spawn('prop-crate', x, 1, z, { alignToBottom: true });
          }
      }
  }

  private static fillUnderpass(ctx: SceneContext, x: number, z: number) {
      // Add gloom lights or debris under highway
      if (Math.random() > 0.8) {
          ctx.spawn('prop-barrel', x, 0, z, { alignToBottom: true });
      }
      // Occasional light
      if (Math.random() > 0.95) {
          ctx.spawn('prop-sensor-unit', x, 0, z, { alignToBottom: true });
      }
  }
}
