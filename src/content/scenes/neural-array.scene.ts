import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';

export const NEURAL_ARRAY_SCENE: ScenePreset = {
    id: 'neural-array',
    label: 'Neural Array',
    description: 'A deep-space computational hub featuring a recursive grid of monoliths and low-gravity data clusters.',
    theme: 'space',
    previewColor: 'from-indigo-900 to-black',

    preloadAssets: [
        'building-skyscraper',
        'prop-pillar',
        'prop-crate',
        'prop-sensor-unit'
    ],

    load: (ctx, engine) => {
        // 1. Environment Setup
        ctx.atmosphere('space')
            .weather('clear')
            .light({
                dirIntensity: 0.5,
                ambientIntensity: 0.1,
                dirColor: '#38bdf8'
            })
            .gravity(-2.0) // Low gravity for floating feel
            .cameraPreset('top');

        if (!engine.texturesEnabled()) engine.viewport.toggleTextures();

        // 2. The Array Grid
        // 7x7 grid of monoliths with height variance
        ctx.grid(7, 7, 20, (x, z, col, row) => {
            const distFromCenter = Math.sqrt(x * x + z * z);
            const heightFactor = Math.max(0.5, 2.0 - (distFromCenter / 40));

            // Foundation
            ctx.spawn('terrain-platform', x, 0, z, { alignToBottom: true, scale: 1.5 });

            // Monolith
            const mid = ctx.spawn('building-tall', x, 0.5, z, { alignToBottom: true });
            ctx.modify(mid, { scale: { x: 0.8, y: heightFactor, z: 0.8 } });

            // Data Modules (Unstable Stacks)
            if (distFromCenter > 15 && (col + row) % 2 === 0) {
                for (let i = 0; i < 3; i++) {
                    ctx.spawn('prop-crate', x + (i * 0.1), 5 + (i * 2), z, { scale: 0.8 });
                }
            }

            // Connecting Conduits (Visual cables)
            if (col < 6) {
                const cableId = ctx.spawn('prop-pillar', x + 10, 2, z);
                ctx.modify(cableId, {
                    rotation: new THREE.Euler(0, 0, Math.PI / 2),
                    scale: { x: 0.05, y: 2.5, z: 0.05 }
                });
            }
        });

        // 3. The Central Hub
        const coreId = ctx.spawn('building-skyscraper', 0, 0, 0, { alignToBottom: true });
        ctx.modify(coreId, { scale: 1.2 });
        engine.ops.setEntityName(coreId, 'NEURAL_CORE_01');

        // 4. Ambient Particle Glows
        const coreLight = new THREE.PointLight(0x0ea5e9, 5.0, 30);
        coreLight.position.set(0, 10, 0);
        // FIX: Access scene service through sys
        engine.sys.scene.getScene().add(coreLight);

        // 5. Player Entrance
        engine.input.setMode('explore');
        // FIX: Access scene service through sys
        const cam = engine.sys.scene.getCamera();
        cam.position.set(40, 20, 40);
        cam.lookAt(0, 10, 0);
    },

    onUpdate: (dt, totalTime, engine) => {
        // Dynamic pulsing logic could go here if not handled by global material system
    }
};
