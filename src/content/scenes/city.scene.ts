
import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';
import { CityAlgorithm } from '../algorithms/city.algorithm';

export const CITY_SCENE: ScenePreset = {
  id: 'city', 
  label: 'Metropolis', 
  description: 'Dense urban center with procedural zoning, grid infrastructure, and elevated highways.', 
  theme: 'city', 
  previewColor: 'from-blue-700 to-slate-900',
  
  // Preload heavy procedural assets
  preloadAssets: [
      'terrain-highway',
      'terrain-ramp',
      'terrain-intersection',
      'terrain-road',
      'gen-building-skyscraper',
      'gen-building-tall',
      'gen-building-wide',
      'gen-building-small',
      'prop-sensor-unit',
      'prop-pillar'
  ],

  load: async (ctx, engine) => {
      ctx.atmosphere('city')
         .weather('clear')
         .time(16.5) 
         .gravity(-9.81);
         
      // Start with overview
      engine.input.setCameraPreset('top');

      if (!engine.texturesEnabled()) engine.viewport.toggleTextures();

      // Delegate procedural generation to Algorithm (v2.0)
      await CityAlgorithm.generate(ctx, engine);

      // Smooth transition to street view
      engine.input.setMode('walk');
      engine.tweenCamera({
          pos: { x: 12, y: 1.7, z: 12 },
          lookAt: { x: 0, y: 5, z: 100 },
          duration: 2.0
      });
  }
};
