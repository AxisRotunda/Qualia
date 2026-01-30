
import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';

export const FOREST_SCENE: ScenePreset = {
  id: 'forest', 
  label: 'Deep Forest', 
  description: 'Dense woods with fallen logs and organic terrain.', 
  theme: 'forest', 
  previewColor: 'from-emerald-700 to-green-900',
  load: (engine, lib) => {
      engine.sceneService.setAtmosphere('forest');
      engine.particleService.setWeather('clear', engine.sceneService.getScene());
      
      for(let i=0; i<30; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 10 + Math.random() * 80;
          const x = Math.cos(angle) * dist;
          const z = Math.sin(angle) * dist;
          const rot = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.random()*Math.PI, 0));
          lib.spawnFromTemplate(engine.entityMgr, 'hero-tree', new THREE.Vector3(x, 0, z), rot);
      }

      for(let i=0; i<15; i++) {
          const x = (Math.random() - 0.5) * 80;
          const z = (Math.random() - 0.5) * 80;
          const rot = new THREE.Quaternion().setFromEuler(new THREE.Euler(
              Math.PI/2 + (Math.random()-0.5)*0.2, 
              Math.random()*Math.PI, 
              (Math.random()-0.5)*0.2
          ));
          lib.spawnFromTemplate(engine.entityMgr, 'prop-log', new THREE.Vector3(x, 1, z), rot);
      }

      for(let i=0; i<20; i++) {
         const x = (Math.random() - 0.5) * 100;
         const z = (Math.random() - 0.5) * 100;
         const scale = 0.8 + Math.random() * 1.5;
         const id = lib.spawnFromTemplate(engine.entityMgr, 'hero-rock', new THREE.Vector3(x, scale/2, z));
         
         const t = engine.world.transforms.get(id);
         if (t) t.scale = {x: scale, y: scale, z: scale};
         const body = engine.world.rigidBodies.get(id);
         const def = engine.world.bodyDefs.get(id);
         if(body && def) engine.physicsService.updateBodyScale(body.handle, def, t!.scale);
      }

      engine.setCameraPreset('side');
      engine.setGravity(-9.81);
  }
};
