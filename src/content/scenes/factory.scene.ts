import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';
import { FactoryAlgorithm } from '../algorithms/factory.algorithm';

export const FACTORY_SCENE: ScenePreset = {
  id: 'factory-depths',
  label: 'Sector 7 Depths',
  description: 'A subterranean industrial complex housing unstable chemical compounds and heavy processing units.',
  theme: 'default',
  previewColor: 'from-orange-900 to-green-950',
  
  preloadAssets: [
      'structure-wall-interior',
      'structure-floor-linoleum',
      'prop-pillar',
      'prop-barrel',
      'prop-crate',
      'terrain-water-lg',
      'building-small',
      'terrain-platform',
      'structure-railing-ind',
      'structure-stairs-ind'
  ],

  load: async (ctx, engine) => {
      // 1. Environment: Subterranean Fog & Static Lighting
      ctx.atmosphere('factory')
         .weather('ash')
         .time(0) // Constant artificial night
         .light({
             dirIntensity: 0.15,
             ambientIntensity: 0.05,
             dirColor: '#ff6600' // Distant furnace glow
         })
         .gravity(-9.81)
         .cameraPreset('front');

      if (!engine.texturesEnabled()) engine.viewport.toggleTextures();

      // 2. Build World
      await FactoryAlgorithm.generate(ctx, engine);

      // 3. Player Start
      engine.input.setMode('walk');
      // FIX: Access scene service through sys
      const cam = engine.sys.scene.getCamera();
      cam.position.set(0, 1.7, 35);
      cam.lookAt(0, 5, 0);
  }
};