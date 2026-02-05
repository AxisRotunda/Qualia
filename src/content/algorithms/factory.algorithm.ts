import * as THREE from 'three';
import { SceneContext } from '../../engine/level/scene-context';
import { EngineService } from '../../services/engine.service';
import { yieldToMain } from '../../engine/utils/thread.utils';

/**
 * FactoryAlgorithm: Generates the Sector 7 Industrial Complex.
 * Refactored for RUN_SCENE_OPT: Enhanced instancing and light path consolidation.
 */
export class FactoryAlgorithm {
    static async generate(ctx: SceneContext, engine: EngineService) {
        const width = 80;
        const depth = 110;
        const wallH = 18;

        // 1. Structural Shell (Foundation & Walls)
        engine.state.setLoadingStage('REINFORCING STRUCTURE');
        await this.generateShell(ctx, width, depth, wallH);
        await yieldToMain();

        // 2. The Extraction Zone (Acid Vats)
        engine.state.setLoadingStage('STABILIZING CHEMICAL VATS');
        await this.generateAcidZone(ctx, engine, -25, 0);
        await yieldToMain();

        // 3. The Processing Spine (Heavy Machinery)
        engine.state.setLoadingStage('CALIBRATING HEAVY SYSTEMS');
        await this.generateProcessingSpine(ctx, engine, 0, 0);
        await yieldToMain();

        // 4. The Catwalk System (Verticality)
        engine.state.setLoadingStage('WELDING CATWALKS');
        await this.generateCatwalks(ctx, width, depth, 5.5);
        await yieldToMain();

        // 5. The Storage Zone (Logistics)
        engine.state.setLoadingStage('INVENTORIZING SECTOR 7');
        await this.generateStorageZone(ctx, 25, 0);
        await yieldToMain();

        // 6. Final Details (Cables & Strobes)
        engine.state.setLoadingStage('INITIALIZING KERNEL');
        await this.scatterFactoryDebris(ctx, width, depth);
    }

    private static async generateShell(ctx: SceneContext, width: number, depth: number, height: number) {
        // Floor & Ceiling
        for (let x = -width / 2; x < width / 2; x += 4) {
            for (let z = -depth / 2; z < depth / 2; z += 4) {
                ctx.spawn('structure-floor-linoleum', x + 2, 0, z + 2, { alignToBottom: true });
                ctx.spawn('structure-ceiling', x + 2, height - 0.1, z + 2);
            }
            // Horizontal strip yielding
            if (x % 16 === 0) await yieldToMain();
        }

        // Perimeter Walls
        const rot90 = new THREE.Euler(0, Math.PI / 2, 0);
        for (let y = 0; y < height; y += 5) {
            for (let x = -width / 2; x < width / 2; x += 4) {
                ctx.spawn('structure-wall-interior', x + 2, y, -depth / 2, { alignToBottom: true });
                ctx.spawn('structure-wall-interior', x + 2, y, depth / 2, { alignToBottom: true });
            }
            for (let z = -depth / 2; z < depth / 2; z += 4) {
                ctx.spawn('structure-wall-interior', -width / 2, y, z + 2, { alignToBottom: true, rotation: rot90 });
                ctx.spawn('structure-wall-interior', width / 2, y, z + 2, { alignToBottom: true, rotation: rot90 });
            }
            await yieldToMain();
        }
    }

    private static async generateAcidZone(ctx: SceneContext, engine: EngineService, centerX: number, centerZ: number) {
        const vatSpacing = 18;
        const vatCount = 4;

        // Consolidated Area Light for the zone (Motivation)
        const zoneGlow = new THREE.PointLight(0x22c55e, 5, 60);
        zoneGlow.position.set(centerX, 5, centerZ);
        // FIX: Access scene service through sys
        engine.sys.scene.getScene().add(zoneGlow);

        for (let i = 0; i < vatCount; i++) {
            const z = centerZ - (vatCount * vatSpacing / 2) + (i * vatSpacing) + vatSpacing / 2;

            // 1. Recessed Floor
            for (let dx = -4; dx <= 4; dx += 4) {
                for (let dz = -4; dz <= 4; dz += 4) {
                    ctx.spawn('structure-floor-linoleum', centerX + dx, -2.5, z + dz, { alignToBottom: true });
                }
            }

            // 2. Acid Surface
            const acidId = ctx.spawn('terrain-water-lg', centerX, -2.2, z);
            ctx.modify(acidId, { scale: { x: 0.02, y: 1.0, z: 0.02 } });

            const meshRef = engine.world.meshes.get(acidId);
            if (meshRef) {
                // FIX: Access material service through sys
                meshRef.mesh.material = engine.sys.materials.getMaterial('mat-acid');
                meshRef.mesh.renderOrder = 5;
            }

            // 3. Local localized subtle glow
            const localGlow = new THREE.PointLight(0x22c55e, 4, 10);
            localGlow.position.set(centerX, 0.5, z);
            // FIX: Access scene service through sys
            engine.sys.scene.getScene().add(localGlow);

            // 4. Vat Supports
            [[-5, -5], [5, -5], [-5, 5], [5, 5]].forEach(([sx, sz]) => {
                ctx.spawn('prop-pillar', centerX + sx, 0, z + sz, { alignToBottom: true, scale: 0.6 });
            });

            await yieldToMain();
        }
    }

    private static async generateProcessingSpine(ctx: SceneContext, engine: EngineService, centerX: number, centerZ: number) {
        const unitSpacing = 15;
        const count = 5;

        for (let i = 0; i < count; i++) {
            const z = centerZ - (count * unitSpacing / 2) + (i * unitSpacing) + unitSpacing / 2;

            const base = ctx.spawn('building-small', centerX, 0, z, { alignToBottom: true });
            ctx.modify(base, { scale: { x: 1.2, y: 0.4, z: 0.8 } });
            const bm = engine.world.meshes.get(base);
            // FIX: Access material service through sys
            if (bm) bm.mesh.material = engine.sys.materials.getMaterial('mat-dark-metal');

            const piston = ctx.spawn('prop-pillar', centerX, 4, z);
            ctx.modify(piston, { scale: { x: 2.0, y: 0.8, z: 2.0 } });
            const pm = engine.world.meshes.get(piston);
            // FIX: Access material service through sys
            if (pm) pm.mesh.material = engine.sys.materials.getMaterial('mat-rust');

            const light = new THREE.PointLight(0x0ea5e9, 4, 12);
            light.position.set(centerX, 3.5, z);
            // FIX: Access scene service through sys
            engine.sys.scene.getScene().add(light);

            ctx.spawn('prop-monitor-triple', centerX + 3.5, 1.2, z, { rotation: new THREE.Euler(0, -Math.PI / 2, 0), alignToBottom: true });

            await yieldToMain();
        }
    }

    private static async generateCatwalks(ctx: SceneContext, width: number, depth: number, height: number) {
        const railRot90 = new THREE.Euler(0, Math.PI / 2, 0);

        const paths = [
            { x: 12, startZ: -depth / 2, endZ: depth / 2, isX: false },
            { x: -12, startZ: -depth / 2, endZ: depth / 2, isX: false }
        ];

        for (const p of paths) {
            for (let z = p.startZ + 5; z < p.endZ - 5; z += 10) {
                ctx.spawn('terrain-platform', p.x, height, z, { alignToBottom: true, scale: 1.0 });
                ctx.spawn('structure-railing-ind', p.x + 4.8, height + 0.1, z, { alignToBottom: true, rotation: railRot90 });
                ctx.spawn('structure-railing-ind', p.x - 4.8, height + 0.1, z, { alignToBottom: true, rotation: railRot90 });

                if (z % 30 === 0) await yieldToMain();
            }
        }

        ctx.spawn('structure-stairs-ind', 12, 0.1, 40, { alignToBottom: true, scale: 1.8 });
    }

    private static async generateStorageZone(ctx: SceneContext, centerX: number, centerZ: number) {
        await ctx.grid(3, 8, 8, (x, z) => {
            const rx = centerX + x;
            const rz = centerZ + z;

            const rnd = Math.random();
            if (rnd > 0.6) {
                ctx.spawn('prop-barrel', rx, 1, rz);
                if (rnd > 0.8) ctx.spawn('prop-barrel', rx, 2.8, rz);
            } else if (rnd > 0.2) {
                ctx.spawn('prop-crate', rx, 1, rz);
            }
        });
    }

    private static async scatterFactoryDebris(ctx: SceneContext, width: number, depth: number) {
        for (let i = 0; i < 20; i++) {
            const x = (Math.random() - 0.5) * (width - 10);
            const z = (Math.random() - 0.5) * (depth - 10);
            const cable = ctx.spawn('prop-pillar', x, 17.5, z);
            ctx.modify(cable, {
                rotation: new THREE.Euler(Math.PI / 2, Math.random() * Math.PI, 0),
                scale: { x: 0.05, y: 1.2, z: 0.05 }
            });
            if (i % 5 === 0) await yieldToMain();
        }

        ctx.scatter(40, 60, (x, z) => {
            const rnd = Math.random();
            if (rnd > 0.8) ctx.spawn('shape-cone', x, 0.5, z, { alignToBottom: true });
            else if (rnd > 0.5) ctx.spawn('prop-cinderblock', x, 0.1, z);
        });
    }
}
