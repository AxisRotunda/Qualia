
import * as THREE from 'three';
import { SceneContext } from '../../engine/level/scene-context';
import { EngineService } from '../../services/engine.service';
import { yieldToMain } from '../../engine/utils/thread.utils';
import { ProceduralUtils } from '../../engine/utils/procedural.utils';

/**
 * MedievalAlgorithm: Generates fortified stone structures and village clusters.
 */
export class MedievalAlgorithm {
    static async generate(ctx: SceneContext, engine: EngineService) {
        engine.state.setLoadingStage('GEOLOGICAL FOUNDATION');

        // 1. Primary Terrain
        await ctx.terrain({
            id: 'Citadel_Mount',
            type: 'standard',
            chunkSize: 200,
            center: { x: 0, z: 0 },
            materialId: 'mat-forest',
            physicsMaterial: 'rock',
            resolution: 80
        });

        await yieldToMain();

        // 2. The Defensive Ring (Citadel Wall)
        engine.state.setLoadingStage('RAISING DEFENSES');
        await this.generateFortifications(ctx, 40);

        await yieldToMain();

        // 3. The Central Keep
        engine.state.setLoadingStage('GROUNDING THE KEEP');
        const keepId = ctx.spawn('gen-castle-tower', 0, 0, 0, { alignToBottom: true, snapToSurface: true });
        ctx.modify(keepId, { scale: 1.5 });
        engine.ops.setEntityName(keepId, 'GREAT_KEEP_CORE');

        // 4. Village Scatter (Props & Flora)
        engine.state.setLoadingStage('SETTLING THE OUTSKIRTS');
        const outerRange = 100;

        // Nature
        for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 60 + Math.random() * 40;
            const x = Math.cos(angle) * dist;
            const z = Math.sin(angle) * dist;

            if (ProceduralUtils.noise(x * 0.1, z * 0.1) > 0.4) {
                ctx.spawn('hero-tree', x, 0, z, { alignToBottom: true, snapToSurface: true, scale: 0.8 + Math.random() });
            }
            if (i % 10 === 0) await yieldToMain();
        }

        // Logistics
        ctx.scatter(30, 50, (x, z) => {
            if (Math.sqrt(x * x + z * z) < 20) return;
            const rnd = Math.random();
            if (rnd > 0.6) {
                ctx.spawn('prop-barrel', x, 1, z, { snapToSurface: true });
            } else if (rnd > 0.3) {
                ctx.spawn('gen-prop-crate-ind', x, 1, z, { snapToSurface: true, scale: 0.8 });
            }
        });

        engine.state.setLoadingStage('STABILIZED');
    }

    private static async generateFortifications(ctx: SceneContext, radius: number) {
        const segments = 8;
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            // Towers at nodes
            ctx.spawn('gen-castle-tower', x, 0, z, { alignToBottom: true, snapToSurface: true });

            // Walls between nodes
            const nextAngle = ((i + 1) / segments) * Math.PI * 2;
            const midAngle = (angle + nextAngle) / 2;
            const midX = Math.cos(midAngle) * radius;
            const midZ = Math.sin(midAngle) * radius;

            const rot = new THREE.Euler(0, -midAngle + Math.PI / 2, 0);
            ctx.spawn('gen-castle-wall', midX, 0, midZ, { alignToBottom: true, snapToSurface: true, rotation: rot });

            await yieldToMain();
        }
    }
}
