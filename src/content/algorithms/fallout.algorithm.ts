
import * as THREE from 'three';
import { SceneContext } from '../../engine/level/scene-context';
import { EngineService } from '../../services/engine.service';
import { yieldToMain } from '../../engine/utils/thread.utils';
import { ProceduralUtils } from '../../engine/utils/procedural.utils';

/**
 * FalloutAlgorithm: Construction of the Ruined Perimeter.
 * Protocol: RUN_SCENE_OPT V2.0 (HYBRID Archetype)
 * Focus: High-entropy structural collapse and radioactive hazards.
 */
export class FalloutAlgorithm {
    private static readonly _rot = new THREE.Euler();
    private static readonly _scale = new THREE.Vector3();

    static async generate(ctx: SceneContext, engine: EngineService) {
        engine.state.setLoadingStage('MAPPING RADIATION ZONES');

        // 1. Terrain: Ash-covered Highlands
        await ctx.terrain({
            id: 'Wasteland_Core',
            type: 'standard',
            chunkSize: 180,
            center: { x: 0, z: 0 },
            materialId: 'mat-rock', 
            physicsMaterial: 'rock',
            resolution: 64
        });

        await yieldToMain();

        // 2. Toxic Accumulation (Acid Pools)
        engine.state.setLoadingStage('DEPOSITING TOXIC SLUDGE');
        this.generateSludge(ctx, engine);

        await yieldToMain();

        // 3. Ruined Grid (Structural Entropy)
        engine.state.setLoadingStage('CALIBRATING STRUCTURAL DECAY');
        await this.generateRuinedCity(ctx, engine, 120);

        // 4. Detail Passes
        engine.state.setLoadingStage('SCATTERING WASTELAND DEBRIS');
        await this.scatterDebris(ctx, 150);

        engine.state.setLoadingStage('STABILIZED');
    }

    private static generateSludge(ctx: SceneContext, engine: EngineService) {
        // Spawn central radioactive basin
        const sludgeY = -1.5;
        const sludgeId = ctx.spawn('terrain-water-lg', 0, sludgeY, 0);
        ctx.modify(sludgeId, { scale: 0.12 }); 

        const meshRef = engine.world.meshes.get(sludgeId);
        if (meshRef) {
            meshRef.mesh.material = engine.sys.materials.getMaterial('mat-acid');
            meshRef.mesh.renderOrder = 2;
        }

        // Toxic Glow
        const toxicLight = new THREE.PointLight(0x4ade80, 8.0, 45);
        toxicLight.position.set(0, 5, 0);
        engine.sys.scene.getScene().add(toxicLight);
    }

    private static async generateRuinedCity(ctx: SceneContext, engine: EngineService, area: number) {
        const step = 25;
        for (let x = -area; x <= area; x += step) {
            for (let z = -area; z <= area; z += step) {
                const dist = Math.sqrt(x*x + z*z);
                if (dist < 30) continue; // Keep crater clear

                const seed = ProceduralUtils.hash(x * 12.3, z * 91.1);
                const rnd = ProceduralUtils.random(seed);

                // High entropy zoning: Building vs Ruin vs Void
                if (rnd > 0.45) {
                    const isTall = rnd > 0.85;
                    const tpl = isTall ? 'building-tall' : 'building-small';
                    
                    // Collapsed Pose: Slanted rotation
                    this._rot.set(
                        (rnd - 0.5) * 0.15,
                        rnd * Math.PI,
                        (rnd - 0.5) * 0.15
                    );

                    const bid = ctx.spawn(tpl, x, 0, z, { 
                        alignToBottom: true, 
                        snapToSurface: true, 
                        rotation: this._rot,
                        scale: 0.8 + rnd * 0.4
                    });

                    // Material Decal: Force concrete material for "Ruined" look
                    const bm = engine.world.meshes.get(bid);
                    if (bm) bm.mesh.material = engine.sys.materials.getMaterial('mat-concrete');

                    // If tall, add interaction detail (Beacon)
                    if (isTall && rnd > 0.95) {
                        const light = new THREE.PointLight(0xff0000, 2, 10);
                        light.position.set(x, 25, z);
                        engine.sys.scene.getScene().add(light);
                    }
                } else if (rnd > 0.2) {
                    // Dead Flora Cluster
                    ctx.spawn('burnt-tree', x, 0, z, { alignToBottom: true, snapToSurface: true, scale: 1.2 + rnd });
                }
            }
            if (Math.abs(x) % 50 === 0) await yieldToMain();
        }
    }

    private static async scatterDebris(ctx: SceneContext, range: number) {
        ctx.scatter(80, range, (x, z) => {
            const dist = Math.sqrt(x*x + z*z);
            if (dist < 20) return;

            const rnd = Math.random();
            if (rnd > 0.8) {
                // Toxic Barrel
                const bid = ctx.spawn('prop-barrel', x, 0.5, z, { snapToSurface: true });
                const bm = ctx.engine.world.meshes.get(bid);
                if (bm) {
                    const mat = (ctx.engine.sys.materials.getMaterial('mat-rust') as THREE.Material).clone() as THREE.MeshStandardMaterial;
                    mat.emissive.setHex(0x22c55e); // Radioactive leak
                    mat.emissiveIntensity = 2.0;
                    bm.mesh.material = mat;
                }
            } else if (rnd > 0.4) {
                ctx.spawn('debris-cinderblock', x, 0.1, z, { snapToSurface: true, scale: 0.8 + rnd });
            } else {
                ctx.spawn('shape-cone', x, 0, z, { snapToSurface: true, alignToBottom: true });
            }
        });
    }
}
