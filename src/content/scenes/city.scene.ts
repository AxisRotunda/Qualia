
import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';
import { CityAlgorithm } from '../algorithms/city.algorithm';

export const CITY_SCENE: ScenePreset = {
  id: 'city', 
  label: 'Metropolis', 
  description: 'Dense urban center with elevated highway ring road, interchanges, and varied zoning.', 
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

      // 6. View
      engine.input.setMode('walk');
      const cam = engine.sceneService.getCamera();
      cam.position.set(0, 15, cityRadius + 10); 
      cam.lookAt(0, 5, 0);
  }
};
