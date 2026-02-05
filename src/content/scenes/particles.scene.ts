
import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';

export const PARTICLES_SCENE: ScenePreset = {
    id: 'particles',
    label: 'Pillars & Particles',
    description: 'Visual physics performance test.',
    theme: 'default',
    previewColor: 'from-violet-600 to-purple-900',
    load: (ctx, engine) => {
        ctx.atmosphere('night')
            .weather('rain')
            .cameraPreset('top')
            .gravity(-9.81);

        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            ctx.spawn('prop-pillar', Math.cos(angle) * 15, 4, Math.sin(angle) * 15);
        }
        ctx.spawn('building-tall', 0, 10, 0);
    }
};
