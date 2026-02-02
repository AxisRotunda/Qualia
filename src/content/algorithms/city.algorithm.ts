
import * as THREE from 'three';
import { SceneContext } from '../../engine/level/scene-context';
import { EngineService } from '../../services/engine.service';
import { yieldToMain } from '../../engine/utils/thread.utils';
import { CityGridService } from '../../engine/features/city/city-grid.service';
import { HighwayBuilderService } from '../../engine/features/city/highway-builder.service';
import { RoadNetworkService } from '../../engine/features/city/road-network.service';
import { CITY_CONFIG } from '../../engine/features/city/city.config';
import { ProceduralUtils } from '../../engine/utils/procedural.utils';

/**
 * CityAlgorithm: Procedural growth engine for Metropolis.
 * RUN_OPT: Uses static scratch objects and ProceduralUtils for shared noise.
 */
export class CityAlgorithm {
  // RUN_OPT: Module-level scratch objects
  private static readonly _rot = new THREE.Euler();
  private static readonly _scale = { x: 1, y: 1, z: 1 };
  
  private static readonly LAYER_BASE = 0.0;
  private static readonly LAYER_ROAD = 0.02;
  private static readonly LAYER_BUILDING = 0.0;
  private static readonly LAYER_PROPS = 0.04;

  static async generate(ctx: SceneContext, engine: EngineService) {
    const grid = new CityGridService();
    const highwayBuilder = new HighwayBuilderService(grid);
    const networkBuilder = new RoadNetworkService(grid);

    engine.state.setLoadingStage('MAPPING BIOMES');
    grid.reset();

    const cityRadius = 320; 
    const highwayZ = -90; 

    // 1. MACRO FOUNDATION
    engine.state.setLoadingStage('STABILIZING FOUNDATION');
    const foundationSize = 400; 
    for (let fx = -1; fx <= 1; fx++) {
      for (let fz = -1; fz <= 1; fz++) {
        const fid = ctx.spawn('terrain-platform', fx * foundationSize, this.LAYER_BASE, fz * foundationSize, { alignToBottom: true });
        ctx.modify(fid, { scale: foundationSize / 10.0 });
        engine.ops.setEntityName(fid, `URBAN_SLAB_${fx}_${fz}`);
      }
    }

    await yieldToMain();

    engine.state.setLoadingStage('INFRASTRUCTURE PHASE');
    highwayBuilder.buildSpine(ctx, -cityRadius - 60, cityRadius + 60, highwayZ);
    await yieldToMain();

    engine.state.setLoadingStage('NETWORK SYNTHESIS');
    networkBuilder.generateGrid(ctx, 14, this.LAYER_ROAD); 
    await yieldToMain();

    engine.state.setLoadingStage('STRUCTURAL GROUNDING');
    const step = CITY_CONFIG.GRID_UNIT;
    const range = cityRadius;

    for (let x = -range; x <= range; x += step) {
      if (x % (step * 4) === 0) {
        engine.state.setLoadingProgress(30 + ((x + range) / (range * 2)) * 60);
        await yieldToMain();
      }

      for (let z = -range; z <= range; z += step) {
        if (!grid.isFree(x, z)) {
          if (grid.get(x, z) === 'highway') {
            this.fillUnderpass(ctx, x, z);
          }
          continue;
        }
        
        const dist = Math.sqrt(x*x + z*z);
        const rnd = ProceduralUtils.random(x * 12.9898 + z * 78.233);
        
        this.processZoning(ctx, x, z, dist, rnd, highwayZ);
      }
    }

    engine.state.setLoadingStage('DETAIL SCATTER');
    await this.scatterUrbanDebris(ctx, cityRadius);

    engine.state.setLoadingStage('FINALIZING KERNEL');
    ctx.spawn('structure-monolith', 0, 0, 0, { alignToBottom: true, scale: 2 });
  }

  private static processZoning(ctx: SceneContext, x: number, z: number, dist: number, rnd: number, highwayZ: number) {
    const nx = x * 0.008;
    const nz = z * 0.008;
    
    const qx = ProceduralUtils.noise(nx + 1.1, nz + 2.4);
    const qz = ProceduralUtils.noise(nx + 4.5, nz + 0.9);
    let density = ProceduralUtils.noise(nx + qx * 2.0, nz + qz * 2.0);
    
    const radial = Math.max(0, 1.0 - (dist / 350));
    density = density * 0.5 + radial * 0.5;
    
    const distToHighway = Math.abs(z - highwayZ);
    if (distToHighway < 40) {
      density += 0.25 * (1.0 - distToHighway / 40);
    }

    const indMask = ProceduralUtils.noise(nx * 1.5 + 500, nz * 1.5 + 500); 
    if (indMask > 0.72 && dist > 80) {
      return this.spawnIndustrial(ctx, x, z, rnd);
    }

    const parkMask = ProceduralUtils.noise(nx * 2.5 + 120, nz * 2.5 + 120);
    if (parkMask > 0.78 && density < 0.9) {
      return this.spawnPark(ctx, x, z, rnd);
    }

    this.spawnDensityZone(ctx, x, z, density, rnd);
  }

  private static spawnPark(ctx: SceneContext, x: number, z: number, rnd: number) {
    if (rnd > 0.4) {
      const scale = 0.8 + rnd * 0.5;
      const species = rnd > 0.8 ? 'hero-palm' : 'hero-tree';
      ctx.spawn(species, x, this.LAYER_PROPS, z, { alignToBottom: true, scale });
    } else if (rnd > 0.2) {
      ctx.spawn('prop-glass-block', x, this.LAYER_PROPS + 1.0, z, { alignToBottom: true, scale: 0.5 + rnd });
    }
  }

  private static spawnIndustrial(ctx: SceneContext, x: number, z: number, rnd: number) {
    this._rot.set(0, Math.floor(rnd * 4) * (Math.PI / 2), 0);
    if (rnd > 0.65) {
      ctx.spawn('building-wide', x, this.LAYER_BUILDING, z, { alignToBottom: true, rotation: this._rot });
    } else if (rnd > 0.3) {
      ctx.spawn('terrain-road', x, this.LAYER_ROAD, z, { alignToBottom: true });
      ctx.spawn('prop-crate', x + (rnd-0.5)*4, this.LAYER_PROPS, z + (rnd-0.5)*4, { alignToBottom: true });
    } else {
      ctx.spawn('prop-sensor-unit', x, this.LAYER_PROPS, z, { alignToBottom: true });
    }
  }

  private static spawnDensityZone(ctx: SceneContext, x: number, z: number, density: number, rnd: number) {
    this._rot.set(0, Math.floor(rnd * 4) * (Math.PI / 2), 0);
    
    if (density > 0.82) {
      if (rnd > 0.5) ctx.spawn('building-skyscraper', x, this.LAYER_BUILDING, z, { alignToBottom: true, rotation: this._rot });
      else if (rnd > 0.1) ctx.spawn('building-tall', x, this.LAYER_BUILDING, z, { alignToBottom: true, rotation: this._rot });
      else ctx.spawn('scifi-hub', x, this.LAYER_BUILDING, z, { alignToBottom: true });
    } 
    else if (density > 0.45) {
      if (rnd > 0.75) ctx.spawn('building-highway', x, this.LAYER_BUILDING, z, { alignToBottom: true, rotation: this._rot });
      else if (rnd > 0.35) ctx.spawn('building-small', x, this.LAYER_BUILDING, z, { alignToBottom: true, rotation: this._rot });
      else ctx.spawn('terrain-road', x, this.LAYER_ROAD, z, { alignToBottom: true }); 
    } 
    else {
      if (rnd > 0.9) ctx.spawn('building-small', x, this.LAYER_BUILDING, z, { alignToBottom: true, rotation: this._rot, scale: 0.8 });
      else if (rnd > 0.7) ctx.spawn('prop-pillar', x, this.LAYER_PROPS, z, { alignToBottom: true, scale: 0.6 });
    }
  }

  private static async scatterUrbanDebris(ctx: SceneContext, range: number) {
    const count = 200;
    for(let i=0; i<count; i++) {
      const x = (Math.random() - 0.5) * range * 2;
      const z = (Math.random() - 0.5) * range * 2;
      const noiseVal = ProceduralUtils.noise(x * 0.01, z * 0.01);
      
      if (noiseVal > 0.4 && noiseVal < 0.7) {
        const rnd = Math.random();
        if (rnd > 0.8) ctx.spawn('shape-cone', x, this.LAYER_PROPS, z, { alignToBottom: true });
        else if (rnd > 0.4) ctx.spawn('prop-cinderblock', x, this.LAYER_PROPS, z);
      }
      if (i % 50 === 0) await yieldToMain();
    }
  }

  private static fillUnderpass(ctx: SceneContext, x: number, z: number) {
    if (Math.random() > 0.85) ctx.spawn('prop-barrel', x, this.LAYER_PROPS, z, { alignToBottom: true });
    if (Math.random() > 0.97) ctx.spawn('prop-sensor-unit', x, this.LAYER_PROPS, z, { alignToBottom: true });
  }
}
