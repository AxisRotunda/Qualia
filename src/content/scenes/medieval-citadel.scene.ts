
import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';
import { MedievalAlgorithm } from '../algorithms/medieval.algorithm';

/**
 * Medieval Citadel Scene
 * Protocol: RUN_SCENE_OPT V2.0
 */
export const MEDIEVAL_CITADEL_SCENE: ScenePreset = {
    id: 'medieval-citadel',
    label: 'Citadel Dawn',
    description: 'A fortified mountain stronghold. Stone towers and battlements overlooking an ancient forest basin.',
    theme: 'forest',
    previewColor: 'from-amber-600 to-stone-900',

    preloadAssets: [
        'gen-castle-tower',
        'gen-castle-wall',
        'hero-tree',
        'prop-barrel',
        'gen-prop-crate-ind',
        'rock-01'
    ],

    load: async (ctx, engine) => {
        // 1. Environment: Golden Hour Citadel
        ctx.atmosphere('citadel')
           .weather('clear')
           .time(18.5) // Early sunset
           .light({
               dirIntensity: 4.0,
               ambientIntensity: 0.8,
               dirColor: '#ffbb66'
           })
           .gravity(-9.81)
           .cameraPreset('side');

        if (!engine.texturesEnabled()) engine.viewport.toggleTextures();

        // 2. Build the Kingdom
        await MedievalAlgorithm.generate(ctx, engine);

        // 3. Entrance sequence
        engine.input.setMode('walk');
        
        const cam = engine.sys.scene.getCamera();
        cam.position.set(60, 10, 60);
        cam.lookAt(0, 5, 0);

        engine.tweenCamera({
            pos: { x: 35, y: 14, z: 35 }, // Vantage point on a tower
            lookAt: { x: 0, y: 5, z: 0 },
            duration: 4.5
        });
    }
};
