import * as THREE from 'three';
import { SceneContext } from '../../engine/level/scene-context';
import { EngineService } from '../../services/engine.service';
import { yieldToMain } from '../../engine/utils/thread.utils';
import { ProceduralUtils } from '../../engine/utils/procedural.utils';

/**
 * ProvingGroundsAlgorithm: Constructing the Prove-and-Verify Environment.
 * RUN_INDUSTRY: Standardized training zones for movement and combat.
 */
export class ProvingGroundsAlgorithm {
  private static readonly _rot = new THREE.Euler();
  private static readonly _scale = { x: 1, y: 1, z: 1 };

  static async generate(ctx: SceneContext, engine: EngineService) {
      engine.state.setLoadingStage('NEURAL MAPPING');
      
      // 1. Foundation
      const floorId = ctx.spawn('terrain-platform', 0, 0, 0, { alignToBottom: true });
      ctx.modify(floorId, { scale: { x: 15, y: 2, z: 15 } }); // 150m x 150m
      engine.ops.setEntityName(floorId, 'TEST_RANGE_BEDROCK');
      
      await yieldToMain();

      // 2. The Nexus (Spawn Hub)
      this.generateNexus(ctx, 0, 0);
      
      // 3. The Ballistics Range (North Sector)
      engine.state.setLoadingStage('CALIBRATING RANGE');
      this.generateRange(ctx, engine, 0, -20);
      
      // 4. The Stress Pit (East Sector)
      engine.state.setLoadingStage('STABILIZING STRESS PIT');
      this.generateStressPit(ctx, engine, 25, 10);

      // 5. Ambient Environment
      this.addLighting(engine);
  }

  private static generateNexus(ctx: SceneContext, x: number, z: number) {
      // Primary Pad
      const pad = ctx.spawn('terrain-platform', x, 0.1, z, { alignToBottom: true });
      ctx.modify(pad, { scale: 1.5 });
      
      // Logistics Stacks
      const c1 = ctx.spawn('prop-crate', x - 4, 1, z - 2);
      const c2 = ctx.spawn('prop-crate', x - 4, 1, z - 4);
      const c3 = ctx.spawn('prop-crate', x - 4, 2.5, z - 3);
      
      // Add integrity to crates so they can be smashed
      // Lowered thresholds to match new 40kg mass. 
      // 40kg * 10m/s deltaV = 400 impulse. Threshold 150 allows breaking on heavy impact.
      [c1, c2, c3].forEach(c => ctx.engine.entityMgr.world.integrity.add(c, 100, 150));
      
      ctx.spawn('prop-barrel', x + 4, 1, z - 3);
      ctx.spawn('prop-barrel', x + 4.2, 1, z - 1);
  }

  private static generateRange(ctx: SceneContext, engine: EngineService, x: number, zStart: number) {
      const distances = [10, 25, 45];
      
      // Training Unit (The Dummy)
      const dummyId = ctx.spawn('robot-actor', x, 0.5, zStart - 15, { alignToBottom: true });
      engine.ops.setEntityName(dummyId, 'TRAINING_UNIT_01');
      // RUN_REPAIR: Set high health and high threshold so it reacts but doesn't die easily
      engine.entityMgr.world.integrity.add(dummyId, 5000, 200); 
      
      // Targets
      distances.forEach((dist, i) => {
          const z = zStart - dist;
          
          // Target Pillar
          ctx.spawn('prop-pillar', x + 5, 0.1, z, { alignToBottom: true, scale: 0.5 });
          ctx.spawn('prop-pillar', x - 5, 0.1, z, { alignToBottom: true, scale: 0.5 });

          // Reactive Target (Fragile Sphere)
          const targetId = ctx.spawn('shape-sphere-lg', x, 2.5, z);
          ctx.modify(targetId, { scale: 0.5 });
          engine.ops.setEntityName(targetId, `TARGET_${dist}M`);
          
          // Ensure it shatters easily
          // Mass ~50kg. Threshold 20 means very fragile.
          engine.entityMgr.world.integrity.add(targetId, 50, 20);

          const light = new THREE.PointLight(0x0ea5e9, 2.0, 5);
          light.position.set(x, 4, z);
          // FIX: Access scene service through sys
          engine.sys.scene.getScene().add(light);
      });
  }

  private static generateStressPit(ctx: SceneContext, engine: EngineService, x: number, z: number) {
      // Debris Wall for destruction testing
      for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 5; col++) {
              const b = ctx.spawn('prop-cinderblock', x + (col * 0.5), 0.2 + (row * 0.3), z);
              // Cinderblocks are small and fragile. Low mass (5kg).
              // Threshold 10 -> Very brittle.
              engine.entityMgr.world.integrity.add(b, 20, 10);
          }
      }
      
      // Glass Panes (Primary Destruct Target)
      const g1 = ctx.spawn('prop-glass-pane', x + 8, 1, z, { rotation: new THREE.Euler(0, Math.PI/4, 0) });
      const g2 = ctx.spawn('prop-glass-pane', x + 8, 1, z + 4, { rotation: new THREE.Euler(0, -Math.PI/4, 0) });
      
      // Glass is very fragile. Single shot breaks it (Damage > 1).
      engine.entityMgr.world.integrity.add(g1, 1, 5);
      engine.entityMgr.world.integrity.add(g2, 1, 5);
  }

  private static addLighting(engine: EngineService) {
      // FIX: Access scene service through sys
      const scene = engine.sys.scene.getScene();
      
      // Range High-Bay Light
      const bayLight = new THREE.SpotLight(0xffffff, 20, 60, 0.4, 0.5, 1);
      bayLight.position.set(0, 30, -30);
      bayLight.target.position.set(0, 0, -30);
      scene.add(bayLight);
      scene.add(bayLight.target);
  }
}