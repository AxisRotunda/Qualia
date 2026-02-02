import * as THREE from 'three';
import { SceneContext } from '../../engine/level/scene-context';
import { EngineService } from '../../services/engine.service';
import { yieldToMain } from '../../engine/utils/thread.utils';
import { ProceduralUtils } from '../../engine/utils/procedural.utils';

/**
 * ParkVolcanoAlgorithm: Yellowstone-inspired Natural Reserve.
 * Features: Central Caldera, Geyser Basins, Pine Forests, and Thermal Pools.
 */
export class ParkVolcanoAlgorithm {
  private static readonly _rot = new THREE.Euler();
  private static readonly _scale = { x: 1, y: 1, z: 1 };

  static async generate(ctx: SceneContext, engine: EngineService) {
      engine.state.setLoadingStage('MAGMATIC UPLIFT');

      // 1. Terrain: Volcanic Caldera
      await ctx.terrain({
          id: 'Caldera_Basin',
          type: 'volcano',
          chunkSize: 200,
          center: { x: 0, z: 0 },
          materialId: 'mat-rock', 
          physicsMaterial: 'rock',
          resolution: 80
      });

      await yieldToMain();

      // 2. The Magma Core (Inside Crater)
      // Visual only - glow
      const magmaLight = new THREE.PointLight(0xff4500, 5.0, 100);
      magmaLight.position.set(0, 15, 0); // Inside the cone
      // FIX: Access scene service through sys
      engine.sys.scene.getScene().add(magmaLight);
      
      // Spawn magma plane
      const magmaId = ctx.spawn('terrain-platform', 0, 10, 0); // High up in the cone
      ctx.modify(magmaId, { scale: 3.0 });
      const magmaRef = engine.world.meshes.get(magmaId);
      // FIX: Access material service through sys
      if (magmaRef) magmaRef.mesh.material = engine.sys.materials.getMaterial('mat-magma');

      // 3. Geyser Basin (The Flats)
      engine.state.setLoadingStage('HYDROTHERMAL VENTS');
      const basinCenter = { x: 60, z: 60 };
      
      // Prismatic Spring
      const springId = ctx.spawn('terrain-water-lg', basinCenter.x, 2.0, basinCenter.z);
      ctx.modify(springId, { scale: 0.08 }); // ~40m
      const springRef = engine.world.meshes.get(springId);
      // FIX: Access material service through sys
      if (springRef) springRef.mesh.material = engine.sys.materials.getMaterial('mat-thermal-water');

      // Vents around the spring
      for(let i=0; i<8; i++) {
          const angle = (i/8) * Math.PI*2;
          const dist = 15 + Math.random() * 10;
          const gx = basinCenter.x + Math.cos(angle) * dist;
          const gz = basinCenter.z + Math.sin(angle) * dist;
          
          const ventId = ctx.spawn('geyser-vent', gx, 0, gz, { alignToBottom: true, snapToSurface: true });
          ctx.modify(ventId, { scale: 1.5 + Math.random() });
          
          // Steam emitter (Prop for now)
          // Ideally use ParticleSystem, but for now just visual marker or light
          const steamLight = new THREE.PointLight(0xaaddff, 1.0, 10);
          steamLight.position.set(gx, 5, gz);
          // FIX: Access scene service through sys
          engine.sys.scene.getScene().add(steamLight);
      }

      await yieldToMain();

      // 4. Burnt Forest (Danger Zone)
      engine.state.setLoadingStage('SCORCHED EARTH');
      const burnRadius = 120;
      
      const burnCount = 60;
      for(let i=0; i<burnCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 30 + Math.random() * 50; // Near volcano base
          const x = Math.cos(angle) * dist;
          const z = Math.sin(angle) * dist;
          
          const height = ProceduralUtils.getTerrainHeight(x, z, 'volcano'); // Use volcano height logic approximation or snap
          // Actually better to snap
          this._rot.set((Math.random()-0.5)*0.2, Math.random()*Math.PI*2, (Math.random()-0.5)*0.2);
          
          ctx.spawn('burnt-tree', x, 0, z, { alignToBottom: true, snapToSurface: true, rotation: this._rot, scale: 0.8 + Math.random() * 0.5 });
          
          if (i % 20 === 0) await yieldToMain();
      }

      // 5. Living Forest (Outer Rim)
      engine.state.setLoadingStage('ECOSYSTEM RECOVERY');
      const pineCount = 100;
      for(let i=0; i<pineCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 90 + Math.random() * 60; // Farther out
          const x = Math.cos(angle) * dist;
          const z = Math.sin(angle) * dist;
          
          // Avoid the geyser basin
          const distToBasin = Math.sqrt(Math.pow(x - basinCenter.x, 2) + Math.pow(z - basinCenter.z, 2));
          if (distToBasin < 30) continue;

          this._rot.set(0, Math.random()*Math.PI*2, 0);
          ctx.spawn('hero-pine', x, 0, z, { alignToBottom: true, snapToSurface: true, rotation: this._rot, scale: 0.8 + Math.random() * 0.8 });
          
          if (i % 20 === 0) await yieldToMain();
      }

      engine.state.setLoadingStage('PARK SERVICES');
      
      // Ranger Station (Outpost)
      const outpostX = -60;
      const outpostZ = -60;
      ctx.spawn('terrain-platform', outpostX, 0, outpostZ, { alignToBottom: true, snapToSurface: true, scale: 2.0 });
      ctx.spawn('research-station-v2', outpostX, 0, outpostZ, { alignToBottom: true, snapToSurface: true, snapOffset: 0.5 });
      
      // Solar array
      ctx.spawn('prop-sensor-unit', outpostX + 10, 0, outpostZ, { alignToBottom: true, snapToSurface: true });
      ctx.spawn('prop-sensor-unit', outpostX + 12, 0, outpostZ + 2, { alignToBottom: true, snapToSurface: true });

      // Path markers
      const pathCount = 10;
      for(let i=0; i<pathCount; i++) {
          const t = i / pathCount;
          const x = -60 + (t * 120); // Path from outpost towards basin?
          const z = -60 + (t * 120);
          
          ctx.spawn('prop-cinderblock', x, 0, z, { alignToBottom: true, snapToSurface: true, scale: 0.5 });
      }
  }
}