
import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';

export const ORBIT_SCENE: ScenePreset = {
  id: 'orbit', 
  label: 'Orbital Station', 
  description: 'Zero-G environment with asteroids and structures.', 
  theme: 'space', 
  previewColor: 'from-slate-800 to-black',
  load: (ctx, engine) => {
      ctx.atmosphere('space')
         .weather('clear')
         .gravity(0);
         
      engine.input.setMode('explore'); 

      ctx.spawn('building-tall', 0, 0, 0);
      
      for(let i=0; i<8; i++) {
         const angle = (i/8) * Math.PI * 2;
         const x = Math.cos(angle) * 15;
         const z = Math.sin(angle) * 15;
         const rot = new THREE.Euler(0, -angle, Math.PI/2);
         ctx.spawn('prop-pillar', x, 0, z, { rotation: rot });
      }

      for(let i=0; i<30; i++) {
          const x = (Math.random() - 0.5) * 100;
          const y = (Math.random() - 0.5) * 100;
          const z = (Math.random() - 0.5) * 100;
          
          if (Math.sqrt(x*x + y*y + z*z) < 25) continue;

          const id = ctx.spawn('hero-rock', x, y, z);
          
          // Use safe modify API to ensure Convex Hulls are correctly scaled in Physics
          const scale = 2 + Math.random();
          const q = new THREE.Quaternion().random();
          
          ctx.modify(id, {
              scale: { x: scale, y: scale, z: scale },
              rotation: q
          });
      }
  }
};
