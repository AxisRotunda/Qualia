
import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';
import { CityAlgorithm } from '../algorithms/city.algorithm';

export const CITY_SCENE: ScenePreset = {
    id: 'city',
    label: 'Urban Jungle',
    description: 'Dense urban center with procedural zoning, grid infrastructure, and elevated highways.',
    theme: 'city',
    previewColor: 'from-blue-700 to-slate-900',

    preloadAssets: [
        'gen-road-highway',
        'gen-road-ramp',
        'gen-road-intersection',
        'gen-road-straight',
        'gen-building-skyscraper',
        'gen-building-tall',
        'gen-building-wide',
        'gen-building-small',
        'gen-scifi-hub',
        'vehicle-traffic-puck'
    ],

    load: async (ctx, engine) => {
        ctx.atmosphere('city')
            .weather('clear')
            .time(19.5)
            .gravity(-9.81);

        engine.env.toggleDayNightCycle(true);
        engine.env.setCycleSpeed(0.02);

        engine.input.setCameraPreset('top');

        if (!engine.texturesEnabled()) engine.viewport.toggleTextures();

        // Procedural Generation
        await CityAlgorithm.generate(ctx, engine);

        // System Promotion:
        // CityTrafficSystem is registered in EngineRuntime.
        // It automatically detects the 'city' sceneId and starts simulation.

        engine.input.setMode('walk');
        engine.tweenCamera({
            pos: { x: 12, y: 1.7, z: 12 },
            lookAt: { x: 0, y: 5, z: 100 },
            duration: 2.0
        });
    }
};
