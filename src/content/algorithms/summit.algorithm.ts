import * as THREE from 'three';
import { SceneContext } from '../../engine/level/scene-context';
import { EngineService } from '../../services/engine.service';
import { yieldToMain } from '../../engine/utils/thread.utils';
import { ProceduralUtils } from '../../engine/utils/procedural.utils';

/**
 * SummitAlgorithm: Implements the "Obsidian Pass" biome logic.
 * RUN_OPT: Uses scratch objects to avoid object churn during scatter loop.
 * RUN_BIOME: Alpine/Volcanic theme enforcement.
 * RUN_INDUSTRY: Ground snapping enforcement.
 */
export class SummitAlgorithm {
  // RUN_OPT: Pre-allocated scratch objects
  private static readonly _rot = new THREE.Euler();
  private static readonly _scale = { x: 1, y: 1, z: 1 };

  static async generate(ctx: SceneContext, engine: EngineService) {
    engine.state.setLoadingStage('GEOLOGICAL ANALYSIS');
    
    // 1. Terrain Pass (Rugged Highlands)
    // Darker, rougher rock material for volcanic feel
    await ctx.terrain({
      id: 'Highlands',
      type: 'standard',
      chunkSize: 160,
      center: { x: 0, z: 0 },
      materialId: 'mat-rock',
      physicsMaterial: 'basalt',
      resolution: 80
    });

    await yieldToMain();

    // 2. Tier 1: Hero Infrastructure
    engine.state.setLoadingStage('DEPLOYING STATION ALPHA');
    
    // Landing Pad (Snap to ground + offset for foundation)
    const pad = ctx.spawn('terrain-platform', -25, 0, 15, { alignToBottom: true, snapToSurface: true, snapOffset: 0.5 });
    ctx.modify(pad, { scale: 2.0 });
    engine.ops.setEntityName(pad, 'LZ_ALPHA');
    
    // Main Outpost
    const outpost = ctx.spawn('research-station-v2', 0, 0, 0, { alignToBottom: true, snapToSurface: true });
    ctx.modify(outpost, { scale: 1.5 });
    engine.ops.setEntityName(outpost, 'SUMMIT_LAB_HQ');
    
    // Perimeter Lights (Red Warning Beacons)
    const corners = [[-10, -10], [10, -10], [-10, 10], [10, 10]];
    corners.forEach(([lx, lz], i) => {
        // Snap beacons to terrain
        const beacon = ctx.spawn('prop-sensor-unit', lx, 0, lz, { alignToBottom: true, scale: 0.5, snapToSurface: true });
        
        // Retrieve snapped position for light placement
        const t = engine.entityMgr.world.transforms.get(beacon);
        const yPos = t ? t.position.y : 5;

        const light = new THREE.PointLight(0xff0000, 2.0, 10);
        light.position.set(lx, yPos + 3, lz);
        // FIX: Access scene service through sys
        engine.sys.scene.getScene().add(light);
    });

    // 3. Tier 2: Obsidian Monoliths (Replaced Office Towers)
    engine.state.setLoadingStage('CRYSTALLIZING MONOLITHS');
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const dist = 50 + Math.random() * 30;
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;
        
        // Use 'hero-ice-spire' geometry but re-materialized
        // Snap to surface to ensure they emerge from the rock
        const spire = ctx.spawn('hero-ice-spire', x, 0, z, { alignToBottom: true, snapToSurface: true, snapOffset: -1.0 });
        
        // Randomized jagged scaling
        this._scale.x = 0.8 + Math.random() * 0.6;
        this._scale.y = 1.2 + Math.random() * 0.8;
        this._scale.z = this._scale.x;
        
        // Random lean
        this._rot.set((Math.random()-0.5)*0.2, Math.random()*Math.PI*2, (Math.random()-0.5)*0.2);

        ctx.modify(spire, { 
            scale: this._scale,
            rotation: this._rot
        });
        
        // Material Override -> Obsidian
        const meshRef = engine.world.meshes.get(spire);
        if (meshRef) {
            // FIX: Access material service through sys
            meshRef.mesh.material = engine.sys.materials.getMaterial('mat-obsidian');
        }
        
        // Context: Research Equipment attached to anomaly
        if (Math.random() > 0.3) {
            const sensor = ctx.spawn('prop-sensor-unit', x + 3, 0, z + 3, { alignToBottom: true, snapToSurface: true });
            ctx.modify(sensor, { scale: 0.7 });
        }
    }

    await yieldToMain();

    // 4. Tier 3: Alpine Ecosystem
    engine.state.setLoadingStage('DISTRIBUTING ECOSYSTEM');
    const natureArea = 180;
    const natureCount = 120;
    
    for (let i = 0; i < natureCount; i++) {
        const x = (Math.random() - 0.5) * natureArea;
        const z = (Math.random() - 0.5) * natureArea;
        const dist = Math.sqrt(x*x + z*z);
        
        // Clear zone around base
        if (dist < 35) continue;

        const mask = ProceduralUtils.noise(x * 0.03, z * 0.03);
        const rnd = Math.random();

        if (mask > 0.4) {
            // Flora: Pines instead of Oaks
            const scale = 0.7 + rnd * 1.0;
            if (rnd > 0.65) {
                // Volcanic Rock Clusters
                this._rot.set(rnd * Math.PI, rnd * Math.PI, 0);
                const rock = ctx.spawn('rock-01', x, 0, z, { 
                    alignToBottom: true, 
                    snapToSurface: true,
                    scale: scale * 1.5,
                    rotation: this._rot
                });
                // Darken rock for basalt look
                const rockMesh = engine.world.meshes.get(rock);
                if (rockMesh && rockMesh.mesh.material instanceof THREE.MeshStandardMaterial) {
                     // FIX: Access material service through sys
                     rockMesh.mesh.material = engine.sys.materials.getMaterial('mat-concrete'); // Darker grey
                }
            } else {
                // Hardy Pines
                ctx.spawn('hero-pine', x, 0, z, { alignToBottom: true, snapToSurface: true, scale });
            }
        }

        if (i % 40 === 0) {
            engine.state.setLoadingProgress(50 + (i/natureCount) * 40);
            await yieldToMain();
        }
    }

    // 5. Tier 4: Scree & Shards (Detail)
    engine.state.setLoadingStage('SCATTERING SCREE');
    ctx.scatter(60, 120, (x, z) => {
        const dist = Math.sqrt(x*x + z*z);
        if (dist < 20) return;
        
        const r = Math.random();
        if (r > 0.8) {
            // Obsidian Shard
            const shard = ctx.spawn('hero-ice-chunk', x, 0, z, { alignToBottom: true, snapToSurface: true, scale: 0.3 + Math.random() * 0.4 });
            const meshRef = engine.world.meshes.get(shard);
            if (meshRef) {
                // FIX: Access material service through sys
                meshRef.mesh.material = engine.sys.materials.getMaterial('mat-obsidian');
            }
        } else if (r > 0.5) {
            // Small Rocks (Re-used Cinderblock geometry for performance, re-skinned)
            // Use physics drop (spawn high) or snap
            const pebble = ctx.spawn('prop-cinderblock', x, 0, z, { snapToSurface: true, snapOffset: 0.1, scale: 0.5 + r * 0.5 });
            const pMesh = engine.world.meshes.get(pebble);
            // FIX: Access material service through sys
            if(pMesh) pMesh.mesh.material = engine.sys.materials.getMaterial('mat-rock');
        }
    });

    await yieldToMain();
    engine.state.setLoadingStage('VANTAGE SYNC');
  }
}