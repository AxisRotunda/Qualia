import { ScenePreset } from '../../data/scene-types';
import { IceAlgorithm } from '../algorithms/ice.algorithm';

export const ICE_SCENE: ScenePreset = {
    id: 'ice',
    label: 'Frozen Tundra',
    description: 'A frozen wasteland. Low friction surfaces and crystalline structures.',
    theme: 'ice',
    previewColor: 'from-cyan-800 to-blue-950',

    preloadAssets: [
        'hero-ice-spire',
        'ice-01',
        'prop-ice-block',
        'terrain-ice',
        'prop-crate',
        'prop-glass-pane',
        'prop-cinderblock'
    ],

    load: async (ctx, engine) => {
        // 1. Atmosphere
        ctx.atmosphere('ice')
            .weather('snow')
            .time(14.0) // Afternoon sun glinting off ice
            .gravity(-9.81)
            .cameraPreset('side');

        if (!engine.texturesEnabled()) engine.viewport.toggleTextures();

        // 2. Algorithm
        await IceAlgorithm.generate(ctx, engine);

        // 3. Player
        engine.input.setMode('walk');
        // FIX: Access scene service through sys
        const cam = engine.sys.scene.getCamera();
        cam.position.set(0, 2, 35); // Start further back to see the spire
        cam.lookAt(0, 5, 0);
    }
};
