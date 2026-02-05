import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';
import { ParkVolcanoAlgorithm } from '../algorithms/park-volcano.algorithm';

export const PARK_VOLCANO_SCENE: ScenePreset = {
    id: 'park-volcano',
    label: 'Caldera Reserve',
    description: 'Active volcanic park with hydrothermal basins, scorched forests, and a central magma cone.',
    theme: 'forest',
    previewColor: 'from-orange-800 to-green-900',

    preloadAssets: [
        'hero-pine',
        'burnt-tree',
        'geyser-vent',
        'rock-01',
        'research-station-v2',
        'prop-sensor-unit'
    ],

    load: async (ctx, engine) => {
        // 1. Atmosphere
        ctx.atmosphere('volcanic')
            .weather('ash')
            .time(16.5) // Late afternoon "Golden Hour" mixed with haze
            .gravity(-9.81)
            .cameraPreset('top');

        if (!engine.texturesEnabled()) engine.viewport.toggleTextures();

        // 2. Algorithm
        await ParkVolcanoAlgorithm.generate(ctx, engine);

        // 3. Start at Ranger Station
        engine.input.setMode('walk');
        // FIX: Access scene service through sys
        const cam = engine.sys.scene.getCamera();
        cam.position.set(-65, 5, -65);
        cam.lookAt(0, 10, 0);

        engine.tweenCamera({
            pos: { x: -60, y: 3, z: -55 },
            lookAt: { x: 0, y: 15, z: 0 }, // Look at volcano peak
            duration: 4.0
        });
    },

    onUpdate: (dt, totalTime, engine) => {
        // Geyser particle/light pulsation logic could go here
        const intensity = 1.0 + Math.sin(totalTime * 0.005) * 0.5;
        // If we tracked specific lights, update them.
    }
};
