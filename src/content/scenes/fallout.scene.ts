
import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';
import { FalloutAlgorithm } from '../algorithms/fallout.algorithm';

/**
 * Fallout Ruins Scene
 * Protocol: RUN_SCENE_OPT V2.0
 */
export const FALLOUT_SCENE: ScenePreset = {
    id: 'fallout-ruins',
    label: 'Dead Perimeter',
    description: 'Post-nuclear urban decay. Dense toxic fog, structural collapse, and radioactive hazards.',
    theme: 'city',
    previewColor: 'from-olive-900 to-black',

    preloadAssets: [
        'gen-building-tall',
        'gen-building-small',
        'burnt-tree',
        'prop-barrel',
        'debris-cinderblock',
        'terrain-water-lg',
        'shape-cone'
    ],

    load: async (ctx, engine) => {
        // 1. Environment: Toxic Apocalypse
        ctx.atmosphere('fallout')
            .weather('ash')
            .time(16.5) // Late afternoon "Sickly Hour"
            .light({
                dirIntensity: 0.5,
                ambientIntensity: 0.2,
                dirColor: '#e0d7a3'
            })
            .gravity(-9.81)
            .cameraPreset('side');

        if (!engine.texturesEnabled()) engine.viewport.toggleTextures();

        // 2. Build the Ruins
        await FalloutAlgorithm.generate(ctx, engine);

        // 3. Entrance sequence
        engine.input.setMode('walk');

        const cam = engine.sys.scene.getCamera();
        cam.position.set(40, 5, 40);
        cam.lookAt(0, 2, 0);

        engine.tweenCamera({
            pos: { x: 25, y: 1.7, z: 25 },
            lookAt: { x: 0, y: 5, z: 0 },
            duration: 4.0
        });
    }
};
