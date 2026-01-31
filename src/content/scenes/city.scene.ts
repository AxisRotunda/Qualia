
import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';
import { CityAlgorithm } from '../algorithms/city.algorithm';

export const CITY_SCENE: ScenePreset = {
  id: 'city', 
  label: 'Metropolis', 
  description: 'Dense urban center with procedural zoning, grid infrastructure, and elevated highways.', 
  theme: 'city', 
  previewColor: 'from-blue-700 to-slate-900',
  
  // Preload heavy procedural assets to prevent frame drops during placement
  preloadAssets: [
      'terrain-highway',
      'terrain-ramp',
      'terrain-intersection',
      'terrain-road',
      'terrain-roundabout',
      'gen-building-skyscraper',
      'gen-building-tall',
      'gen-building-wide',
      'gen-building-small',
      'prop-sensor-unit'
  ],

  load: async (ctx, engine) => {
      ctx.atmosphere('city')
         .weather('clear')
         .time(16.5) 
         .gravity(-9.81)
         .cameraPreset('top'); 

      if (!engine.texturesEnabled()) engine.viewport.toggleTextures();

      // Delegate procedural generation to Algorithm
      const cityRadius = await CityAlgorithm.generate(ctx, engine);

      // 6. View - Street Level for Immersion
      engine.input.setMode('walk');
      const cam = engine.sceneService.getCamera();
      // Position on a sidewalk intersection near center
      cam.position.set(12, 1.7, 12); 
      cam.lookAt(0, 5, 100);
  }
};
