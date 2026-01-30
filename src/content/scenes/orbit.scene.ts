
import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';

export const ORBIT_SCENE: ScenePreset = {
  id: 'orbit', 
  label: 'Orbital Station', 
  description: 'Zero-G environment with asteroids and structures.', 
  theme: 'space', 
  previewColor: 'from-slate-800 to-black',
  load: (engine, lib) => {
      engine.sceneService.setAtmosphere('space');
      engine.particleService.setWeather('clear', engine.sceneService.getScene());
      engine.setGravity(0);
      engine.setMode('explore'); 

      lib.spawnFromTemplate(engine.entityMgr, 'building-tall', new THREE.Vector3(0, 0, 0));
      
      for(let i=0; i<8; i++) {
         const angle = (i/8) * Math.PI * 2;
         const x = Math.cos(angle) * 15;
         const z = Math.sin(angle) * 15;
         const rot = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -angle, Math.PI/2));
         lib.spawnFromTemplate(engine.entityMgr, 'prop-pillar', new THREE.Vector3(x, 0, z), rot);
      }

      for(let i=0; i<30; i++) {
          const x = (Math.random() - 0.5) * 100;
          const y = (Math.random() - 0.5) * 100;
          const z = (Math.random() - 0.5) * 100;
          
          if (Math.sqrt(x*x + y*y + z*z) < 25) continue;

          const id = lib.spawnFromTemplate(engine.entityMgr, 'hero-rock', new THREE.Vector3(x, y, z));
          
          const t = engine.world.transforms.get(id);
          if (t) {
            t.scale = {x: 2+Math.random(), y: 2+Math.random(), z: 2+Math.random()};
            const q = new THREE.Quaternion().random();
            t.rotation = {x: q.x, y: q.y, z: q.z, w: q.w};
            
            const rb = engine.world.rigidBodies.get(id);
            const def = engine.world.bodyDefs.get(id);
            if (rb && def) {
                engine.physicsService.updateBodyScale(rb.handle, def, t.scale);
                engine.physicsService.updateBodyTransform(rb.handle, t.position, t.rotation);
            }
          }
      }
  }
};
