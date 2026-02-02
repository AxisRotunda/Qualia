import * as THREE from 'three';
import { SceneContext } from '../../engine/level/scene-context';
import { EngineService } from '../../services/engine.service';
import { yieldToMain } from '../../engine/utils/thread.utils';
import { ProceduralUtils } from '../../engine/utils/procedural.utils';
import { RuinsGrammarAlgorithm } from './ruins-grammar.algorithm';

/**
 * DesertAlgorithm: Tiered Biome engine for Oasis Mirage.
 * Part of RUN_BIOME Phase 55.0 / RUN_GRAMMAR Phase 56.0.
 * RUN_INDUSTRY: Ground snapping integration.
 */
export class DesertAlgorithm {
  private static readonly _rot = new THREE.Euler();
  private static readonly _scale = { x: 1, y: 1, z: 1 };

  static async generate(ctx: SceneContext, engine: EngineService) {
      engine.state.setLoadingStage('GEOLOGICAL CORE');
      
      // 1. Dune Generation (Primary Heightfield)
      engine.state.setLoadingStage('SYNTHESIZING DUNES');
      await ctx.terrain({
          id: 'DuneSystem',
          type: 'dunes',
          chunkSize: 180,
          center: { x: 0, z: 0 },
          materialId: 'mat-sand',
          physicsMaterial: 'sandstone',
          resolution: 64 
      });

      // Removed artificial bedrock platform. Terrain handles stability.

      await yieldToMain();

      // 2. Central Oasis & Grammar-Based Ruins
      engine.state.setLoadingStage('RESERVING OASIS');
      this.generateOasis(ctx, engine);
      
      engine.state.setLoadingStage('EXECUTING RUINS GRAMMAR');
      // Ruins are placed at origin
      RuinsGrammarAlgorithm.generate(ctx, 0, 0, 15);

      await yieldToMain();

      // 3. Biome Scatter Protocol (Tiered Passes)
      const area = 220;
      
      // PASS 1: HERO (Palms)
      engine.state.setLoadingStage('DISTRIBUTING HERO BIOTA');
      await this.passHero(ctx, engine, area);
      await yieldToMain();

      // PASS 2: FILL (Boulders & Formations)
      engine.state.setLoadingStage('SYNTHESIZING GEOLOGY');
      await this.passFill(ctx, engine, area);
      await yieldToMain();

      // PASS 3: DETAIL (Surface Shards)
      engine.state.setLoadingStage('SCATTERING MICRO-DETAIL');
      await this.passDetail(ctx, engine, area);

      engine.state.setLoadingStage('STABILIZED');
  }

  private static generateOasis(ctx: SceneContext, engine: EngineService) {
      const waterY = -2.2;
      const waterId = ctx.spawn('terrain-water-lg', 0, waterY, 0);
      ctx.modify(waterId, { scale: 0.15 }); // 75m radius

      const meshRef = engine.world.meshes.get(waterId);
      if (meshRef) {
          const mat = meshRef.mesh.material as THREE.MeshPhysicalMaterial;
          mat.color.setHex(0x004d40); 
          mat.transmission = 0.8;
          meshRef.mesh.renderOrder = 1;
      }
  }

  /**
   * PASS 1: Hero Biota
   * Logic: Clump near water sources (Radial weight).
   * Constraint: Skip area reserved for RuinsGrammar to prevent clipping.
   */
  private static async passHero(ctx: SceneContext, engine: EngineService, area: number) {
      const count = 50;
      for (let i = 0; i < count; i++) {
          const x = (Math.random() - 0.5) * area;
          const z = (Math.random() - 0.5) * area;
          
          const dist = Math.sqrt(x*x + z*z);
          
          // Reserved Zone: Skip if inside the Ruins Altar foundation (15m base)
          if (dist < 12) continue; 
          
          // Range check: Only spawn in habitable oasis zone
          if (dist > 100) continue; 

          const proximityMask = 1.0 - (dist / 100); 
          const rnd = Math.random();

          // Cluster palms based on distance from water
          if (rnd < proximityMask * 0.8) {
              const scale = 0.7 + rnd * 1.0;
              this._rot.set((rnd-0.5)*0.1, rnd*Math.PI*2, (rnd-0.5)*0.1);
              // Snap to dune surface
              ctx.spawn('hero-palm', x, 0, z, { alignToBottom: true, snapToSurface: true, scale, rotation: this._rot });
          }
          
          if (i % 20 === 0) await yieldToMain();
      }
  }

  private static async passFill(ctx: SceneContext, engine: EngineService, area: number) {
      const count = 80;
      for (let i = 0; i < count; i++) {
          const x = (Math.random() - 0.5) * area;
          const z = (Math.random() - 0.5) * area;
          
          const dist = Math.sqrt(x*x + z*z);
          // Skip the central oasis area for boulders
          if (dist < 25) continue;

          // Accumulated geology along dune ridges
          const ridgeMask = ProceduralUtils.ridgedNoise(x * 0.04, z * 0.04, 2);
          const rnd = Math.random();

          if (ridgeMask > 0.6) {
              const scale = 1.0 + rnd * 2.5;
              this._rot.set(rnd*Math.PI, rnd*Math.PI, 0);
              // Embed boulders slightly
              ctx.spawn('rock-sandstone', x, 0, z, { snapToSurface: true, snapOffset: -0.5, rotation: this._rot });
          }

          if (i % 30 === 0) {
              engine.state.setLoadingProgress(70 + (i / count) * 15);
              await yieldToMain();
          }
      }
  }

  private static async passDetail(ctx: SceneContext, engine: EngineService, area: number) {
      ctx.scatter(60, area, (x, z) => {
          const dist = Math.sqrt(x*x + z*z);
          // Don't scatter small junk inside the spring
          if (dist < 20) return;

          const rnd = Math.random();
          if (rnd > 0.7) {
              const sid = ctx.spawn('prop-shard-metal', x, 0, z, { snapToSurface: true, scale: 0.4 + rnd });
              const sm = engine.world.meshes.get(sid);
              if (sm) {
                  // FIX: Access material service through sys
                  sm.mesh.material = engine.sys.materials.getMaterial('mat-sandstone');
              }
          } else if (rnd > 0.5) {
              // Cinderblock / Ancient brick
              ctx.spawn('prop-cinderblock', x, 0, z, { snapToSurface: true, scale: 0.8 });
          }
      });
  }
}