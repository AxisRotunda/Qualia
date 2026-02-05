import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';
import { ProceduralUtils } from '../../engine/utils/procedural.utils';
import { yieldToMain } from '../../engine/utils/thread.utils';

export const WATER_SCENE: ScenePreset = {
    id: 'island-sanctuary',
    label: 'Island Sanctuary',
    description: 'A serene tropical atoll. Features accurate ocean physics, coastal vegetation, and rugged interior.',
    theme: 'desert',
    previewColor: 'from-cyan-400 to-blue-600',

    preloadAssets: [
        'terrain-water-ocean',
        'hero-palm',
        'bush-fern',
        'rock-sandstone',
        'prop-crate',
        'prop-barrel'
    ],

    load: async (ctx, engine) => {
        const waterLevel = 0.8;

        // 1. Environment: Tropical Day
        // Warmer, brighter light than default desert
        ctx.atmosphere('clear')
            .weather('clear')
            .time(11.0)
            .light({
                dirIntensity: 4.0,
                ambientIntensity: 1.4,
                dirColor: '#fffef5'
            })
            .water(waterLevel, 1.0)
            .gravity(-9.81);

        if (!engine.texturesEnabled()) engine.viewport.toggleTextures();

        // 2. The Ocean Floor & Atoll
        // Increased chunk size to cover the 80m radius ring
        // Increased center resolution for smooth coastlines
        await ctx.terrain({
            id: 'Tropical_Atoll',
            type: 'islands',
            chunkSize: 256,
            center: { x: 0, z: 0 },
            materialId: 'mat-sand-tropical',
            physicsMaterial: 'sandstone',
            resolution: 128
        });

        // 3. The Ocean Surface
        const oceanId = ctx.spawn('terrain-water-ocean', 0, waterLevel, 0);

        const meshRef = engine.world.meshes.get(oceanId);
        if (meshRef) {
            meshRef.mesh.renderOrder = 10; // Draw after terrain
            meshRef.mesh.castShadow = false;
            meshRef.mesh.receiveShadow = true;
            meshRef.mesh.updateMatrixWorld(true);
        }

        await yieldToMain();

        // 4. Biota Scatter (Palms & Ferns)
        const count = 120;
        const ringRadius = 80;
        const spread = 35; // Wider spread to cover the new plateau

        for (let i = 0; i < count; i++) {
            // Distribute around the ring
            const angle = Math.random() * Math.PI * 2;
            // Bias distance to be on the ring
            const dist = ringRadius + (Math.random() - 0.5) * spread;
            const x = Math.cos(angle) * dist;
            const z = Math.sin(angle) * dist;

            const h = ProceduralUtils.getTerrainHeight(x, z, 'islands');

            // Vegetation Zone: Inland (Plateau)
            // Ensure we are above water but not too high on cliffs
            if (h > waterLevel + 0.5 && h < 12.0) {
                const rnd = Math.random();
                const scale = 0.8 + rnd * 0.7;
                const rot = new THREE.Euler(
                    (rnd - 0.5) * 0.2,
                    rnd * Math.PI * 2,
                    (rnd - 0.5) * 0.2
                );

                // Palm Trees vs Ferns
                if (rnd > 0.3) {
                    ctx.spawn('hero-palm', x, 0, z, {
                        alignToBottom: true,
                        snapToSurface: true,
                        snapOffset: 0.0, // Fixed: Corrected snap offset
                        scale,
                        rotation: rot
                    });
                } else {
                    ctx.spawn('bush-fern', x, 0, z, {
                        alignToBottom: true,
                        snapToSurface: true,
                        snapOffset: 0.0, // Fixed: Corrected snap offset
                        scale: scale * 1.2,
                        rotation: rot
                    });
                }
            }
            // Rock Zone: Shoreline (Only on land)
            else if (h >= waterLevel && h < waterLevel + 1.5) { // Fixed: Only spawn on land
                const rScale = 0.5 + Math.random() * 2.0;
                const rot = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

                ctx.spawn('rock-sandstone', x, 0, z, {
                    snapToSurface: true,
                    snapOffset: 0.0, // Fixed: Corrected snap offset
                    scale: rScale,
                    rotation: rot
                });
            }

            if (i % 20 === 0) await yieldToMain();
        }

        // 5. Debris (Washed Up on the beach)
        for (let i = 0; i < 3; i++) {
            // Place on the ring
            const angle = Math.random() * Math.PI * 2;
            const dist = ringRadius + (Math.random() - 0.5) * 10;
            const x = Math.cos(angle) * dist;
            const z = Math.sin(angle) * dist;

            // Ensure it's on land
            const h = ProceduralUtils.getTerrainHeight(x, z, 'islands');
            if (h > waterLevel && h < 2.0) {
                ctx.spawn('prop-crate', x, h + 0.5, z);
            }
        }

        // 6. Player Start (On the ring)
        engine.input.setMode('walk');
        const startAngle = Math.PI / 4;
        const startDist = ringRadius;
        const startX = Math.cos(startAngle) * startDist;
        const startZ = Math.sin(startAngle) * startDist;
        const startY = ProceduralUtils.getTerrainHeight(startX, startZ, 'islands') + 2.0;

        const cam = engine.sys.scene.getCamera();
        cam.position.set(startX, startY, startZ);
        cam.lookAt(0, 2, 0); // Look at lagoon
    }
};
