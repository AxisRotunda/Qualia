import * as THREE from 'three';
import { SceneContext } from '../../engine/level/scene-context';
import { EngineService } from '../../services/engine.service';
import { yieldToMain } from '../../engine/utils/thread.utils';
import { ProceduralUtils } from '../../engine/utils/procedural.utils';
import { Entity } from '../../engine/core';

/**
 * EdenAlgorithm: Optimized biological environment generator.
 * Target: Mobile-Safe (Low entity count, reduced terrain resolution).
 * Refactored Phase 61.5: Unified biota placement and luminescence pass.
 * RUN_INDUSTRY: Ground snapping via Raycasting.
 */
export class EdenAlgorithm {
  private static readonly _rot = new THREE.Euler();
  private static coreLight: THREE.PointLight | null = null;
  
  static async generate(ctx: SceneContext, engine: EngineService) {
      engine.state.setLoadingStage('STABILIZING BIOME');

      // 1. Foundation & Terrain
      await ctx.terrain({
          id: 'Eden_Basin',
          type: 'standard', 
          chunkSize: 160,
          center: { x: 0, z: 0 },
          materialId: 'mat-forest',
          physicsMaterial: 'rock',
          resolution: 48 
      });

      // Removed artificial platform. Terrain handles collision.

      await yieldToMain();

      // 2. Flora Distribution (Optimized Pass)
      engine.state.setLoadingStage('GERMINATING FLORA');
      const range = 80;
      
      // Hero Biota
      for (let i = 0; i < 20; i++) {
          this.placeBiota(ctx, 'hero-tree', range, 12, 1.2);
          if (i % 5 === 0) await yieldToMain();
      }

      // Fill Biota
      for (let i = 0; i < 15; i++) {
          this.placeBiota(ctx, 'hero-palm', range, 15, 0.8, true);
      }

      await yieldToMain();

      // 3. Luminescence Pass (Bio-Shards)
      engine.state.setLoadingStage('SCATTERING PHOTONS');
      this.generateBioShards(ctx, engine, 30, range);

      // 4. Geological Details
      engine.state.setLoadingStage('SCATTERING GEOLOGY');
      ctx.scatter(20, range, (x, z) => {
          if (Math.sqrt(x*x + z*z) < 10) return;
          this._rot.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
          ctx.spawn('rock-01', x, 0, z, { alignToBottom: true, snapToSurface: true, scale: 0.8 + Math.random(), rotation: this._rot });
      });

      // 5. Fauna
      engine.state.setLoadingStage('INITIALIZING AGENTS');
      this.spawnDrones(ctx, 3);

      // 6. Central Feature
      const reactorId = ctx.spawn('structure-monolith', 0, 0, 0, { alignToBottom: true, snapToSurface: true });
      ctx.modify(reactorId, { scale: 1.2 });
      engine.ops.setEntityName(reactorId, 'BIO_CORE');
      
      this.coreLight = new THREE.PointLight(0x4ade80, 2.0, 40);
      this.coreLight.position.set(0, 8, 0);
      // FIX: Access scene service through sys
      engine.sys.scene.getScene().add(this.coreLight);
  }

  private static placeBiota(ctx: SceneContext, tpl: string, range: number, deadzone: number, scaleBase: number, jitterRoll = false) {
      const x = (Math.random() - 0.5) * range;
      const z = (Math.random() - 0.5) * range;
      if (Math.sqrt(x*x + z*z) < deadzone) return;

      const scale = 0.7 + Math.random() * scaleBase;
      
      if (jitterRoll) {
          this._rot.set((Math.random()-0.5)*0.2, Math.random()*Math.PI*2, (Math.random()-0.5)*0.2);
      } else {
          this._rot.set(0, Math.random() * Math.PI * 2, 0);
      }

      // Use snapToSurface instead of ProceduralUtils.getTerrainHeight
      ctx.spawn(tpl, x, 0, z, { alignToBottom: true, snapToSurface: true, scale, rotation: this._rot });
  }

  private static generateBioShards(ctx: SceneContext, engine: EngineService, count: number, range: number) {
      for (let i = 0; i < count; i++) {
          const x = (Math.random() - 0.5) * range;
          const z = (Math.random() - 0.5) * range;
          if (Math.sqrt(x*x + z*z) < 15) continue;

          const shardId = ctx.spawn('prop-shard-glass', x, 0, z, { alignToBottom: true, snapToSurface: true });
          
          ctx.modify(shardId, { scale: 0.5 + Math.random() * 1.5 });
          
          const meshRef = engine.world.meshes.get(shardId);
          if (meshRef) {
              // FIX: Access material service through sys
              meshRef.mesh.material = engine.sys.materials.getMaterial('mat-glow-blue');
              // Tint emerald for Eden
              (meshRef.mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x22c55e);
          }
      }
  }

  private static spawnDrones(ctx: SceneContext, count: number) {
      for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const x = Math.cos(angle) * 15;
          const z = Math.sin(angle) * 15;
          
          // Get ground height via utility to set initial target
          const groundY = ProceduralUtils.getTerrainHeight(x, z, 'standard');
          
          const agentId = ctx.spawn('robot-actor', x, groundY + 1, z, { alignToBottom: true });
          ctx.modify(agentId, { scale: 0.4 });
          
          ctx.engine.world.agents.add(agentId, 3.5);
          ctx.engine.ops.setEntityName(agentId, `BIO_DRONE_${i}`);
          
          ctx.engine.world.kinematicControllers.add(agentId, {
              targetPosition: { x, y: groundY + 1, z },
              targetRotation: { x: 0, y: 0, z: 0, w: 1 }
          });
      }
  }

  static onUpdate(dt: number, totalTime: number, engine: EngineService) {
      if (this.coreLight) {
          this.coreLight.intensity = 1.5 + Math.sin(totalTime * 0.0015) * 0.8;
      }
  }
}