
import * as THREE from 'three';
import { SceneContext } from '../../engine/level/scene-context';
import { EngineService } from '../../services/engine.service';
import { yieldToMain } from '../../engine/utils/thread.utils';
import { ProceduralUtils } from '../../engine/utils/procedural.utils';

/**
 * IceAlgorithm: Procedural generation for the Glacial Field.
 * Focus: Stability, low-friction physics demonstration, and clean visual hierarchy.
 * Updated: RUN_FAUNA (Sentries & Penguins) & RUN_FLORA (Border Pines & Bushes).
 */
export class IceAlgorithm {
    private static readonly _rot = new THREE.Euler();

    static async generate(ctx: SceneContext, engine: EngineService) {
        engine.state.setLoadingStage('FREEZING OCEAN');

        // 1. Terrain: Standard generation with Snow/Ice physics
        // Resolution 64 is safe for mobile and provides enough detail for dunes/drifts.
        await ctx.terrain({
            id: 'Glacial_Basin',
            type: 'standard',
            chunkSize: 160,
            center: { x: 0, z: 0 },
            materialId: 'mat-snow', 
            physicsMaterial: 'ice', // Low friction surface
            resolution: 64
        });

        // 2. Frozen Lake Foundation
        // A large flat collider to ensure perfectly smooth sliding gameplay in the valleys
        const lakeId = ctx.spawn('terrain-ice', 0, -2.5, 0);
        ctx.modify(lakeId, { scale: { x: 8, y: 1, z: 8 } }); // 160m x 160m plane
        engine.ops.setEntityName(lakeId, 'FROZEN_LAKE_BED');

        await yieldToMain();

        // 3. Central Spire (Hero Asset)
        engine.state.setLoadingStage('FORMING SPIRE');
        const spireId = ctx.spawn('hero-ice-spire', 0, 0, 0, { alignToBottom: true, snapToSurface: true });
        ctx.modify(spireId, { scale: 1.8 });
        engine.ops.setEntityName(spireId, 'ZERO_POINT_SPIRE');

        // 4. Scatter Ice Shards (Visual Noise)
        engine.state.setLoadingStage('SCATTERING SHARDS');
        const count = 40;
        const range = 70;

        for(let i=0; i<count; i++) {
            const x = (Math.random() - 0.5) * range * 2;
            const z = (Math.random() - 0.5) * range * 2;
            
            const dist = Math.sqrt(x*x + z*z);
            if (dist < 15) continue; // Keep center clearing open

            // Grouping logic via noise to create natural clusters
            const noise = ProceduralUtils.noise(x * 0.05, z * 0.05);
            
            if (noise > 0.3) {
                this._rot.set(
                    (Math.random()-0.5) * 0.5, 
                    Math.random() * Math.PI * 2, 
                    (Math.random()-0.5) * 0.5
                );
                const scale = 0.5 + Math.random() * 1.5;
                
                ctx.spawn('ice-01', x, 0, z, { 
                    alignToBottom: true, 
                    snapToSurface: true, 
                    snapOffset: -0.5, // Embed slightly into the snow
                    scale, 
                    rotation: this._rot 
                });
            }
        }

        await yieldToMain();

        // 5. Physics Props (Pure Ice Blocks only - Cleaned up industrial debris)
        engine.state.setLoadingStage('PLACING ARTIFACTS');
        
        // Ice Blocks (Low friction vs Low friction)
        ctx.spawn('prop-ice-block', 6, 2, 6);
        ctx.spawn('prop-ice-block', -6, 2, 6);
        
        // Removed Crate, Cinderblock, Glass Pane to fit "Pure Nature/Research" theme.

        // 6. RUN_FLORA: Hardy Border Pines and Tundra bushes
        engine.state.setLoadingStage('GERMINATING FLORA');
        await this.passFlora(ctx, engine);

        // 7. RUN_FAUNA: Glacial Sentries and Penguins
        engine.state.setLoadingStage('ACTIVATING FAUNA');
        this.passFauna(ctx);
        this.passPenguins(ctx);
    }

    private static async passFlora(ctx: SceneContext, engine: EngineService) {
        const count = 30;
        const radius = 90;
        
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + (Math.random() * 0.5);
            const dist = 65 + Math.random() * 25; // 65m - 90m radius (Outer rim)
            
            const x = Math.cos(angle) * dist;
            const z = Math.sin(angle) * dist;

            // Only spawn on "high" ground (skip valleys)
            const height = ProceduralUtils.getTerrainHeight(x, z, 'standard');
            if (height < 2.0) continue;

            const scale = 0.8 + Math.random() * 0.6;
            this._rot.set(0, Math.random() * Math.PI * 2, 0);

            // Mix Pines and Bushes
            const type = Math.random() > 0.7 ? 'bush-tundra' : 'hero-pine';
            const finalScale = type === 'bush-tundra' ? scale * 1.5 : scale;

            ctx.spawn(type, x, 0, z, { 
                alignToBottom: true, 
                snapToSurface: true, 
                scale: finalScale, 
                rotation: this._rot 
            });

            if (i % 10 === 0) await yieldToMain();
        }
    }

    private static passFauna(ctx: SceneContext) {
        // Spawn patrol drones on the ice lake
        const sentryCount = 3;
        for (let i = 0; i < sentryCount; i++) {
            const angle = (i / sentryCount) * Math.PI * 2;
            const x = Math.cos(angle) * 20;
            const z = Math.sin(angle) * 20;

            const entity = ctx.spawn('robot-actor', x, 2, z, { alignToBottom: true });
            
            ctx.modify(entity, { scale: 0.5 });
            ctx.engine.ops.setEntityName(entity, `GLACIAL_SENTRY_${i+1}`);

            // Register AI
            ctx.engine.world.agents.add(entity, 3.5); // Speed 3.5 m/s
            
            // Register Kinematics
            ctx.engine.world.kinematicControllers.add(entity, {
                targetPosition: { x, y: 0, z },
                targetRotation: { x: 0, y: 0, z: 0, w: 1 }
            });
        }
    }

    private static passPenguins(ctx: SceneContext) {
        const penguinCount = 12;
        const groupCenter = { x: -15, z: -15 };
        
        for (let i = 0; i < penguinCount; i++) {
            const x = groupCenter.x + (Math.random() - 0.5) * 12;
            const z = groupCenter.z + (Math.random() - 0.5) * 12;
            
            const entity = ctx.spawn('fauna-penguin', x, 0.5, z, { alignToBottom: true, snapToSurface: true });
            ctx.engine.ops.setEntityName(entity, `PENGUIN_${i+1}`);
            
            // Waddle Logic
            ctx.engine.world.agents.add(entity, 1.0 + Math.random() * 0.5); // Slow speed
            
            ctx.engine.world.kinematicControllers.add(entity, {
                targetPosition: { x, y: 0, z },
                targetRotation: { x: 0, y: 0, z: 0, w: 1 }
            });
        }
    }
}
