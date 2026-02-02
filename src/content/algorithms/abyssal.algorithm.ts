import * as THREE from 'three';
import { SceneContext } from '../../engine/level/scene-context';
import { EngineService } from '../../services/engine.service';
import { yieldToMain } from '../../engine/utils/thread.utils';
import { ProceduralUtils } from '../../engine/utils/procedural.utils';

/**
 * AbyssalAlgorithm: Generates dense deep-sea architectural clusters.
 * Protocol: RUN_ARCH V1.4
 * Focus: High-pressure obsidian structures, fixed grounding, and bioluminescent networks.
 */
export class AbyssalAlgorithm {
  private static readonly _rot = new THREE.Euler();
  private static readonly _scale = new THREE.Vector3();

  static async generate(ctx: SceneContext, engine: EngineService) {
      engine.state.setLoadingStage('MAPPING HADAL PLAIN');

      // 1. Seafloor Pass (Basalt Basin)
      await ctx.terrain({
          id: 'Abyssal_Basin',
          type: 'standard', 
          chunkSize: 250,
          center: { x: 0, z: 0 },
          materialId: 'mat-rock',
          physicsMaterial: 'basalt',
          resolution: 80
      });

      await yieldToMain();

      // 2. Central Nexus (Outpost Spawn Hub)
      engine.state.setLoadingStage('GROUNDING PRESSURE LOCKS');
      const hubId = ctx.spawn('gen-scifi-hub', 0, 0, 0, { alignToBottom: true, snapToSurface: true });
      ctx.modify(hubId, { scale: 1.8 });
      engine.ops.setEntityName(hubId, 'ABYSS_STATION_CORE');

      // Intensive Outpost Bioluminescence
      const coreLight = new THREE.PointLight(0x00ffff, 15, 120);
      coreLight.position.set(0, 15, 0);
      engine.sys.scene.getScene().add(coreLight);

      await yieldToMain();

      // 3. Hadal Spire Clusters (Obsidian Monoliths)
      // RUN_ARCH: Replaces generic Office Buildings with Spire archetypes
      engine.state.setLoadingStage('CRYSTALLIZING HADAL SPIRES');
      const towerCount = 50;

      for (let i = 0; i < towerCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 35 + Math.random() * 95;
          const x = Math.cos(angle) * dist;
          const z = Math.sin(angle) * dist;

          if (dist < 32) continue;

          const rnd = Math.random();
          // Use 'ice-spire' geometry but re-materialize as Obsidian
          const spireId = ctx.spawn('hero-ice-spire', x, 0, z, { alignToBottom: true, snapToSurface: true });
          
          this._scale.set(
              0.8 + rnd * 0.4,
              1.2 + rnd * 1.5,
              0.8 + rnd * 0.4
          );
          
          this._rot.set(0, rnd * Math.PI, 0);

          ctx.modify(spireId, { 
              scale: this._scale, 
              rotation: this._rot,
              physicsMaterial: 'basalt' 
          });

          // Material Injection: Multi-slot Obsidian + Thermal Glow
          const meshRef = engine.world.meshes.get(spireId);
          if (meshRef) {
              const materials = engine.sys.materials;
              const bodyMat = materials.getMaterial('mat-obsidian');
              const glowMat = materials.getMaterial('mat-glow-orange').clone() as THREE.MeshStandardMaterial;
              glowMat.emissiveIntensity = 5.0;

              // Apply alternating segments for "Internal Core Glow" look
              meshRef.mesh.material = [bodyMat as THREE.Material, glowMat, bodyMat as THREE.Material];
          }

          // Thermal Vent Lighting
          if (rnd > 0.65) {
              const ventLight = new THREE.PointLight(0xf97316, 4.0, 22);
              ventLight.name = 'Thermal_Vent_Light';
              const t = engine.entityMgr.world.transforms.get(spireId);
              const ly = t ? t.position.y : 0;
              ventLight.position.set(x, ly + 6, z);
              engine.sys.scene.getScene().add(ventLight);
          }

          if (i % 10 === 0) {
              engine.state.setLoadingProgress(20 + (i / towerCount) * 50);
              await yieldToMain();
          }
      }

      // 4. Infrastructure Pass: Power Conduits & Piling Anchors
      engine.state.setLoadingStage('WIRING SEAFLOOR CONDUITS');
      await this.generateInfrastructure(ctx, 130);

      await yieldToMain();

      // 5. Detail: Hadal Rock Formations
      engine.state.setLoadingStage('GEOLOGICAL FRAGMENTATION');
      ctx.scatter(30, 150, (x, z) => {
          if (Math.sqrt(x*x + z*z) < 30) return;
          const rock = ctx.spawn('rock-sandstone', x, 0, z, { snapToSurface: true, alignToBottom: true, scale: 1.5 + Math.random() * 2 });
          const rm = engine.world.meshes.get(rock);
          if(rm) rm.mesh.material = engine.sys.materials.getMaterial('mat-obsidian');
      });

      // 6. Fauna: Hadal Drones
      engine.state.setLoadingStage('DEPLOYING DEPTH DRONES');
      this.spawnAbyssalDrones(ctx, 8);

      engine.state.setLoadingStage('STABILIZED');
  }

  private static async generateInfrastructure(ctx: SceneContext, range: number) {
      for(let i=0; i<18; i++) {
          const angle = (i / 18) * Math.PI * 2;
          const x = Math.cos(angle) * 75;
          const z = Math.sin(angle) * 75;
          
          // Heavy basalt pillars acting as mooring points
          const anchor = ctx.spawn('prop-pillar', x, 0, z, { snapToSurface: true, alignToBottom: true });
          ctx.modify(anchor, {
              rotation: new THREE.Euler(0, angle + Math.PI/2, Math.PI/2),
              scale: { x: 0.3, y: 8.0, z: 0.3 },
              physicsMaterial: 'lead'
          });

          ctx.spawn('structure-piling', x, 0, z, { alignToBottom: true, snapToSurface: true, scale: 1.8 });
          
          if (i % 6 === 0) await yieldToMain();
      }
  }

  private static spawnAbyssalDrones(ctx: SceneContext, count: number) {
      const radius = 45;
      for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const h = 14.0; // High hover depth

          const droneId = ctx.spawn('robot-actor', x, h, z, { alignToBottom: true });
          ctx.modify(droneId, { scale: 0.4 });
          ctx.engine.ops.setEntityName(droneId, `HADAL_DRONE_0x${i.toString(16)}`);

          ctx.engine.world.agents.add(droneId, 5.5);
          ctx.engine.world.kinematicControllers.add(droneId, {
              targetPosition: { x, y: h, z },
              targetRotation: { x: 0, y: 0, z: 0, w: 1 }
          });

          const light = new THREE.PointLight(0x00ffff, 2.5, 15);
          light.name = 'Biolume_Array_Light';
          const meshRef = ctx.engine.world.meshes.get(droneId);
          if (meshRef) meshRef.mesh.add(light);
      }
  }
}