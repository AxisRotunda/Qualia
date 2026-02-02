import * as THREE from 'three';
import { SceneContext } from '../../engine/level/scene-context';
import { ProceduralUtils } from '../../engine/utils/procedural.utils';

/**
 * RuinsGrammarAlgorithm: Shape Grammar engine for Ancient Structures.
 * Part of RUN_GRAMMAR protocol.
 * Axiom -> Subdivide -> Terminate (Weathered).
 */
export class RuinsGrammarAlgorithm {
  private static readonly _rot = new THREE.Euler();
  private static readonly _scale = { x: 1, y: 1, z: 1 };

  /**
   * Generates a structural ruins complex based on a 3x3 subdivision grammar.
   * Updated for RUN_SCENE_OPT Phase 56.0 to remove out-of-place modern assets.
   */
  static generate(ctx: SceneContext, x: number, z: number, size: number) {
      // Pass 0: The Foundation Slab (Axiom)
      // Using structure-ruin-slab for a heavy, ancient stone base
      const baseId = ctx.spawn('structure-ruin-slab', x, -2.0, z, { alignToBottom: true });
      ctx.modify(baseId, { scale: size / 10.0 });
      ctx.engine.ops.setEntityName(baseId, 'ALTAR_FOUNDATION');

      // Grammar Execution: Subdivide space into 3x3 grid cells
      const cellSize = size / 3;
      const startX = x - size/2 + cellSize/2;
      const startZ = z - size/2 + cellSize/2;

      for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 3; col++) {
              const cx = startX + (col * cellSize);
              const cz = startZ + (row * cellSize);
              
              // Rule: Weathering/Entropy (Deterministic Skip)
              // Seed derived from local coordinates to ensure stability across reloads
              const seed = ProceduralUtils.hash(cx * 100, cz * 100);
              
              // 15% chance a cell is completely eroded
              if (seed < 0.15) continue; 

              this.applyCellGrammar(ctx, cx, cz, row, col, seed);
          }
      }
  }

  private static applyCellGrammar(ctx: SceneContext, x: number, z: number, row: number, col: number, seed: number) {
      // 1. Center Rule: The Focus Monolith
      if (row === 1 && col === 1) {
          const mid = ctx.spawn('structure-monolith', x, -0.8, z, { alignToBottom: true });
          const h = 8.0 + seed * 4.0;
          ctx.modify(mid, { 
              scale: { x: 0.8, y: h / 9.0, z: 0.8 },
              physicsMaterial: 'sandstone' // Ancient stone physics
          });
          
          const meshRef = ctx.engine.world.meshes.get(mid);
          if (meshRef) {
              // FIX: Access material service through sys
              meshRef.mesh.material = ctx.engine.sys.materials.getMaterial('mat-sandstone');
          }
          
          ctx.engine.ops.setEntityName(mid, 'NEXUS_ALTAR');
          return;
      }

      // 2. Corner Rule: Massive Guard Pillars
      const isCorner = (row === 0 || row === 2) && (col === 0 || col === 2);
      if (isCorner) {
          // Weathering: Corners often collapse partially
          const wallChance = ProceduralUtils.hash(x * 43, z * 91);
          if (wallChance > 0.4) {
              const pill = ctx.spawn('prop-pillar', x, 0.5, z, { alignToBottom: true });
              const h = 6.0 + seed * 4.0;
              // Scale pillar to look more ancient/thick
              this._scale.x = 1.4; this._scale.y = h / 8.0; this._scale.z = 1.4;
              ctx.modify(pill, { scale: this._scale, physicsMaterial: 'sandstone' });
              
              const pm = ctx.engine.world.meshes.get(pill);
              // FIX: Access material service through sys
              if (pm) pm.mesh.material = ctx.engine.sys.materials.getMaterial('mat-sandstone');
          } else {
              // Cell is ruined: place debris heap
              this.spawnDebrisCluster(ctx, x, z, seed);
          }
          return;
      }

      // 3. Edge Rule: Ancient Wall Segments
      // Replacedmodern 'building-small' with 'structure-ruin-wall'
      const edgeSeed = ProceduralUtils.hash(x * 77, z * 13);
      if (edgeSeed > 0.3) {
          const wall = ctx.spawn('structure-ruin-wall', x, 0, z, { alignToBottom: true });
          
          // Rotation logic: align to the perimeter of the 3x3 square
          const rotY = (row === 0 || row === 2) ? 0 : Math.PI/2;
          this._rot.set(0, rotY, 0);
          
          // Slight height variation to show age
          this._scale.x = 1.0; 
          this._scale.y = 0.8 + seed * 0.4; 
          this._scale.z = 1.0;
          
          ctx.modify(wall, { scale: this._scale, rotation: this._rot });
      } else {
          this.spawnDebrisCluster(ctx, x, z, seed);
      }
  }

  private static spawnDebrisCluster(ctx: SceneContext, x: number, z: number, seed: number) {
      // Scatter broken shards around a collapsed node
      const count = 3 + Math.floor(seed * 4);
      for(let i=0; i<count; i++) {
          const offX = (ProceduralUtils.random(seed + i) - 0.5) * 3;
          const offZ = (ProceduralUtils.random(seed + i * 2) - 0.5) * 3;
          ctx.spawn('prop-cinderblock', x + offX, 0.5, z + offZ, { scale: 0.8 + seed * 0.4 });
      }
  }
}