import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';
import { InteriorAlgorithm } from '../algorithms/interior.algorithm';

export const INTERIOR_SCENE: ScenePreset = {
  id: 'interior-hotel', 
  label: 'Grand Hotel Lobby', 
  description: 'A lavish interior space with marble floors, grand staircases, and a mezzanine.', 
  theme: 'city', 
  previewColor: 'from-amber-700 to-yellow-900',
  load: (ctx, engine) => {
      // 1. Setup Environment
      ctx.atmosphere('city')
         .weather('clear')
         .light({
            dirIntensity: 0.5, 
            ambientIntensity: 0.7,
            dirColor: '#fff7ed' // Warm white
         })
         .gravity(-9.81);
      
      if (!engine.texturesEnabled()) engine.viewport.toggleTextures();

      // Delegate to Algorithm
      InteriorAlgorithm.generateLobby(ctx, engine);

      engine.input.setMode('walk');
      // FIX: Access scene service through sys
      const cam = engine.sys.scene.getCamera();
      cam.position.set(0, 1.7, 18);
      cam.lookAt(0, 1.7, 0);
  }
};