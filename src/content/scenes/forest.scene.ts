
import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';

export const FOREST_SCENE: ScenePreset = {
  id: 'forest', 
  label: 'Deep Forest', 
  description: 'Dense woods with fallen logs, organic terrain, and dynamic lighting.', 
  theme: 'forest', 
  previewColor: 'from-emerald-700 to-green-900',
  load: (ctx, engine) => {
      ctx.atmosphere('forest')
         .weather('clear')
         .light({
            dirIntensity: 3.5, 
            ambientIntensity: 0.2,
            dirColor: '#ffc482' 
         })
         .time(17.5)
         .gravity(-9.81)
         .cameraPreset('side');

      if (!engine.texturesEnabled()) engine.viewport.toggleTextures();

      // 1. Forest Floor (Physical Ground)
      ctx.spawn('terrain-soil', 0, 0, 0, { alignToBottom: true });

      // 2. Procedural Vegetation Clustering
      const area = 180;
      const treeCount = 80;
      
      // Trees: Use noise to create clearings
      for(let i=0; i<treeCount; i++) {
          const x = (Math.random() - 0.5) * area;
          const z = (Math.random() - 0.5) * area;
          
          // Simple noise function for clustering
          const noise = Math.sin(x * 0.05) + Math.cos(z * 0.05) * Math.sin(x * 0.1);
          
          if (noise > -0.2) {
              const scale = 0.8 + Math.random() * 0.8; // Varied height
              const rot = new THREE.Euler(
                  (Math.random()-0.5)*0.1, 
                  Math.random()*Math.PI*2, 
                  (Math.random()-0.5)*0.1
              );
              
              ctx.spawn('hero-tree', x, 0.5, z, { alignToBottom: true, scale, rotation: rot });
          }
      }

      // Logs
      for(let i=0; i<20; i++) {
          const x = (Math.random() - 0.5) * area;
          const z = (Math.random() - 0.5) * area;
          
          const noise = Math.sin(x * 0.05) + Math.cos(z * 0.05);
          if (noise < 0.5) {
              const rot = new THREE.Euler(
                  Math.PI/2 + (Math.random()-0.5)*0.5, 
                  Math.random()*Math.PI, 
                  (Math.random()-0.5)*0.5
              );
              ctx.spawn('prop-log', x, 3.0 + Math.random()*2, z, { rotation: rot });
          }
      }

      // Rocks
      for(let i=0; i<40; i++) {
         const x = (Math.random() - 0.5) * area;
         const z = (Math.random() - 0.5) * area;
         
         const scale = 0.5 + Math.random() * 2.5;
         // Random rotation approx
         const rot = new THREE.Euler(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
         
         ctx.spawn('hero-rock', x, 1.0 + Math.random(), z, { alignToBottom: false, scale, rotation: rot });
      }

      // Position camera
      const cam = engine.sceneService.getCamera();
      cam.position.set(0, 2, 20);
      cam.lookAt(0, 4, 0);
  }
};
