
import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';
import { CityAlgorithm } from '../algorithms/city.algorithm';
import { CityTrafficLogic } from '../algorithms/city-traffic.logic';

// Module-scoped logic instance
let traffic: CityTrafficLogic | null = null;

export const CITY_SCENE: ScenePreset = {
  id: 'city', 
  label: 'Metropolis', 
  description: 'Dense urban center with procedural zoning, grid infrastructure, and elevated highways.', 
  theme: 'city', 
  previewColor: 'from-blue-700 to-slate-900',
  
  // Preload heavy procedural assets to ensure smooth loading bar progress.
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
      // Reset logic
      if (traffic) traffic.dispose();
      traffic = null;

      ctx.atmosphere('city')
         .weather('clear')
         .time(19.5) // Evening for traffic glow visibility
         .gravity(-9.81);
      
      // Enable slow day/night cycle for atmosphere
      engine.env.toggleDayNightCycle(true);
      engine.env.setCycleSpeed(0.02); // Very slow drift
         
      // Start with overview
      engine.input.setCameraPreset('top');

      if (!engine.texturesEnabled()) engine.viewport.toggleTextures();

      // Delegate procedural generation to Algorithm (v2.0)
      await CityAlgorithm.generate(ctx, engine);

      // Initialize Traffic
      traffic = new CityTrafficLogic(engine);
      traffic.init();

      // Smooth transition to street view
      engine.input.setMode('walk');
      engine.tweenCamera({
          pos: { x: 12, y: 1.7, z: 12 },
          lookAt: { x: 0, y: 5, z: 100 },
          duration: 2.0
      });
  },

  onUpdate: (dt, totalTime, engine) => {
      if (traffic) {
          traffic.update(dt, totalTime);
      }
  }
};
