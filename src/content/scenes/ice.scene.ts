
import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';

export const ICE_SCENE: ScenePreset = {
  id: 'ice', 
  label: 'Glacial Field', 
  description: 'Procedural snow terrain populated with crystalline ice formations.', 
  theme: 'ice', 
  previewColor: 'from-cyan-800 to-blue-950',
  
  load: async (ctx, engine) => {
      // 1. Environment Setup
      // High contrast "Blizzard" atmosphere with cold blue lighting
      ctx.atmosphere('blizzard')
         .weather('snow')
         .time(8.5) // Morning sun for long shadows
         .light({
             dirIntensity: 2.0, 
             ambientIntensity: 0.5, 
             dirColor: '#e0f2fe' // Pale Blue
         })
         .gravity(-9.81)
         .cameraPreset('front');

      if (!engine.texturesEnabled()) engine.viewport.toggleTextures();

      engine.state.loadingStage.set('FREEZING TERRAIN');

      // 2. Procedural Terrain (Standard Noise for Rugged/Mountainous look)
      await ctx.terrain({
          id: 'Glacier',
          type: 'standard', // 'standard' uses domain warping for rocky/icy shapes
          chunkSize: 120,
          center: { x: 0, z: 0 },
          materialId: 'mat-snow',
          physicsMaterial: 'ice', // Low friction
          resolution: 64
      });

      engine.state.loadingStage.set('CRYSTALLIZING');

      // 3. Hero Feature: Massive central spire
      const spireId = ctx.spawn('hero-ice-spire', 0, -2, 0);
      ctx.modify(spireId, { scale: 1.5 });

      // 4. Scatter: Ice Shards
      ctx.scatter(40, 60, (x, z) => {
          // Keep center clear
          if (Math.abs(x) < 8 && Math.abs(z) < 8) return;

          const scale = 0.8 + Math.random() * 1.5;
          const rot = new THREE.Euler(
              (Math.random() - 0.5) * 0.5, 
              Math.random() * Math.PI * 2, 
              (Math.random() - 0.5) * 0.5
          );
          
          // 'ice-01' is a jagged procedural convex hull
          ctx.spawn('ice-01', x, 5, z, { 
              alignToBottom: true, 
              scale, 
              rotation: rot 
          });
      });

      // 5. Scatter: Ancient Cube Artifacts (for visual contrast)
      ctx.scatter(8, 50, (x, z) => {
          if (Math.abs(x) < 15 && Math.abs(z) < 15) return;
          
          // Dynamic glass blocks that can be pushed
          ctx.spawn('prop-glass-block', x, 5, z);
      });

      // 6. Player Start
      engine.input.setMode('walk');
      const cam = engine.sceneService.getCamera();
      cam.position.set(0, 2, 35);
      cam.lookAt(0, 5, 0);
  },

  onUpdate: (dt, totalTime, engine) => {
      // No custom loop logic needed for static ice demo
  }
};
