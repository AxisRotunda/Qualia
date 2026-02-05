import { ScenePreset } from '../../data/scene-types';
import { EdenAlgorithm } from '../algorithms/eden.algorithm';

export const EDEN_COMPLEX_SCENE: ScenePreset = {
    id: 'eden-complex',
    label: 'Eden Bio-Dome',
    description: 'Botanical research zone. Optimized for performance stability.',
    theme: 'forest',
    previewColor: 'from-emerald-900 to-green-950',

    preloadAssets: [
        'hero-tree',
        'hero-palm',
        'rock-01',
        'robot-actor',
        'structure-monolith',
        'terrain-platform',
        'prop-shard-glass'
    ],

    load: async (ctx, engine) => {
        // 1. Environment Synthesis
        ctx.atmosphere('forest')
            .weather('clear')
            .time(10.0)
            .light({
                dirIntensity: 3.5,
                ambientIntensity: 0.8,
                dirColor: '#e8fce7'
            })
            .gravity(-9.81)
            .cameraPreset('top');

        if (!engine.texturesEnabled()) engine.viewport.toggleTextures();

        // 2. Execute Optimized Algorithm
        await EdenAlgorithm.generate(ctx, engine);

        // 3. Entrance Sequence
        engine.input.setMode('walk');
        // FIX: Access scene service through sys
        const cam = engine.sys.scene.getCamera();
        cam.position.set(0, 2, 40);
        cam.lookAt(0, 5, 0);

        engine.tweenCamera({
            pos: { x: 0, y: 1.7, z: 30 },
            lookAt: { x: 0, y: 2, z: 0 },
            duration: 3.0
        });
    },

    onUpdate: (dt, totalTime, engine) => {
        EdenAlgorithm.onUpdate(dt, totalTime, engine);
    }
};
