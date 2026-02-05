import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';
import { ProvingGroundsAlgorithm } from '../algorithms/proving-grounds.algorithm';

export const DEBUG_SCENE: ScenePreset = {
    id: 'proving-grounds',
    label: 'Proving Grounds',
    description: 'Elite training simulation for kinetic verification and neural calibration.',
    theme: 'default',
    previewColor: 'from-cyan-900 to-slate-950',

    preloadAssets: [
        'prop-crate',
        'prop-barrel',
        'prop-pillar',
        'prop-cinderblock',
        'prop-glass-pane',
        'shape-sphere-lg',
        'terrain-platform',
        'robot-actor'
    ],

    load: async (ctx, engine) => {
        // 1. Environment Setup
        ctx.atmosphere('city') // Uses hazy lighting for simulation feel
            .weather('clear')
            .time(12)
            .light({
                dirIntensity: 1.5,
                ambientIntensity: 0.8,
                dirColor: '#ffffff'
            })
            .gravity(-9.81)
            .cameraPreset('side');

        if (!engine.texturesEnabled()) engine.viewport.toggleTextures();

        // 2. Procedural Generation
        await ProvingGroundsAlgorithm.generate(ctx, engine);

        // 3. Finalize
        engine.input.setMode('walk');
        // FIX: Access scene service through sys
        const cam = engine.sys.scene.getCamera();
        cam.position.set(0, 1.7, 8);
        cam.lookAt(0, 1.7, -10);
    }
};
