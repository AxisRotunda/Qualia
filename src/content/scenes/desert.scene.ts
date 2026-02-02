import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';
import { DesertAlgorithm } from '../algorithms/desert.algorithm';

/**
 * Oasis Mirage Scene
 * Remade for RUN_SCENE_OPT Phase 54.0 / 56.0.
 * Focus: High-Contrast atmospheric lighting and stable heightfield physics.
 */
export const DESERT_SCENE: ScenePreset = {
  id: 'desert', 
  label: 'Oasis Mirage', 
  description: 'Sweltering sand dunes surrounding a hidden spring. High-fidelity terrain with low-friction sandstone dynamics.', 
  theme: 'desert', 
  previewColor: 'from-orange-400 to-amber-200',
  
  preloadAssets: [
      'hero-palm',
      'rock-sandstone',
      'terrain-water-lg',
      'terrain-platform',
      'structure-monolith',
      'gen-ruin-slab',
      'gen-ruin-wall'
  ],

  load: async (ctx, engine) => {
      // 1. Environment: Extreme Heat profile
      ctx.atmosphere('desert')
         .weather('clear')
         .time(15.5) // Afternoon sun
         .light({
             dirIntensity: 4.5, 
             ambientIntensity: 0.6, 
             dirColor: '#fff8e1' 
         })
         .water(-2.5, 0.4) // Steady oasis waves
         .gravity(-9.81)
         .cameraPreset('side');

      if (!engine.texturesEnabled()) engine.viewport.toggleTextures();

      // 2. Execute Reconstruction Algorithm
      await DesertAlgorithm.generate(ctx, engine);

      // 3. Cinematic Entrance
      engine.input.setMode('walk');
      // FIX: Access scene service through sys
      const cam = engine.sys.scene.getCamera();
      cam.position.set(45, 10, 45);
      cam.lookAt(0, 2, 0);

      engine.tweenCamera({
          pos: { x: 28, y: 3.5, z: 28 },
          lookAt: { x: 0, y: 0, z: 0 },
          duration: 3.0
      });
  }
};