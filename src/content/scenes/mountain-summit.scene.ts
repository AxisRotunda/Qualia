import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';
import { SummitAlgorithm } from '../algorithms/summit.algorithm';

export const MOUNTAIN_SUMMIT_SCENE: ScenePreset = {
    id: 'mountain-summit',
    label: 'Obsidian Pass',
    description: 'A high-altitude research station nestled within sharp volcanic rock formations and domain-warped highlands.',
    theme: 'default',
    previewColor: 'from-slate-900 to-indigo-950',

    preloadAssets: [
        'rock-01',
        'hero-pine',
        'research-station-v2',
        'prop-sensor-unit',
        'hero-ice-spire',
        'hero-ice-chunk',
        'gen-platform'
    ],

    load: async (ctx, engine) => {
        // 1. Environment Setup
        ctx.atmosphere('summit')
            .weather('clear')
            .time(8.5) // Early morning for crisp shadows
            .light({
                dirIntensity: 4.5,
                ambientIntensity: 0.4,
                dirColor: '#fffbeb'
            })
            .gravity(-9.81)
            .cameraPreset('side');

        if (!engine.texturesEnabled()) engine.viewport.toggleTextures();

        // 2. Delegate to Biome Algorithm
        await SummitAlgorithm.generate(ctx, engine);

        // 3. Cinematic Entrance
        engine.input.setMode('walk');
        // FIX: Access scene service through sys
        const cam = engine.sys.scene.getCamera();
        cam.position.set(45, 12, 45);
        cam.lookAt(0, 10, 0);

        engine.tweenCamera({
            pos: { x: 22, y: 8, z: 22 },
            lookAt: { x: 0, y: 5, z: 0 },
            duration: 3.5
        });
    },

    onUpdate: (dt, totalTime, engine) => {
        // Subtle pulse on the obsidian monoliths handled by material shader (if active)
        // but we can add beacon rotation here if needed later.
    }
};
