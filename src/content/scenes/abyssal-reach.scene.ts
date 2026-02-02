import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';
import { AbyssalAlgorithm } from '../algorithms/abyssal.algorithm';

/**
 * Abyssal Reach Scene
 * Protocol: RUN_SCENE_OPT V2.0
 * Archetype: HYBRID (Deep Sea City)
 */
export const ABYSSAL_REACH_SCENE: ScenePreset = {
  id: 'abyssal-reach',
  label: 'Abyssal Reach',
  description: 'A deep-sea research outpost submerged in the hadopelagic zone. High-pressure obsidian monoliths with intense thermal luminescence.',
  theme: 'city',
  previewColor: 'from-cyan-950 to-black',
  
  preloadAssets: [
      'hero-ice-spire', // Core geometry for Obsidian Monoliths
      'rock-sandstone',
      'structure-piling',
      'prop-sensor-unit',
      'terrain-water-lg',
      'gen-scifi-hub',
      'robot-actor',
      'prop-pillar'
  ],

  load: async (ctx, engine) => {
      // 1. Extreme Hadopelagic Depth (300m below surface)
      const waterSurfaceY = 300; 

      // 2. Atmosphere Synthesis
      ctx.atmosphere('underwater')
         .weather('clear')
         .time(12.0)
         .light({
             dirIntensity: 0.1,    // Near-zero sunlight penetration
             ambientIntensity: 2.8, // High scatter from city bioluminescence
             dirColor: '#002233'
         })
         .water(waterSurfaceY, 0.15) // Deep, slow oceanic currents
         .gravity(-9.81)
         .cameraPreset('side');

      if (!engine.texturesEnabled()) engine.viewport.toggleTextures();

      // 3. Execute Optimized Abyssal Logic
      await AbyssalAlgorithm.generate(ctx, engine);

      // 4. Cinematic Entrance - Spawn at the Outpost
      engine.input.setMode('walk');
      
      const cam = engine.sys.scene.getCamera();
      // Start in front of the station hub
      cam.position.set(5, 2, 45);
      cam.lookAt(0, 1.8, 0);

      engine.tweenCamera({
          pos: { x: 0, y: 1.8, z: 35 },
          lookAt: { x: 0, y: 5, z: -20 },
          duration: 4.5
      });
  },

  onUpdate: (dt, totalTime, engine) => {
      // Dynamic pulsing of thermal vents and bioluminescent arrays
      const pulse = 2.0 + Math.sin(totalTime * 0.003) * 1.5;
      
      // Update lights by name group
      engine.sys.scene.getScene().traverse((obj) => {
          if (obj.name === 'Thermal_Vent_Light') {
              (obj as THREE.PointLight).intensity = pulse;
          }
          if (obj.name === 'Biolume_Array_Light') {
              (obj as THREE.PointLight).intensity = 1.0 + Math.sin(totalTime * 0.001) * 0.5;
          }
      });
  }
};