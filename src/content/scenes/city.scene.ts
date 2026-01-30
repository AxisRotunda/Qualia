
import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';

export const CITY_SCENE: ScenePreset = {
  id: 'city', 
  label: 'Metropolis', 
  description: 'Dense urban center with skyscrapers and asphalt canyons.', 
  theme: 'city', 
  previewColor: 'from-blue-600 to-indigo-900',
  load: (engine, lib) => {
      engine.sceneService.setAtmosphere('city'); 
      engine.particleService.setWeather('clear', engine.sceneService.getScene());
      
      if (!engine.texturesEnabled()) engine.toggleTextures();

      const blockSize = 24; 
      const gridSize = 8; 
      const offset = (gridSize * blockSize) / 2;

      for (let x = 0; x <= gridSize; x++) {
          for (let z = 0; z <= gridSize; z++) {
              const px = x * blockSize - offset;
              const pz = z * blockSize - offset;
              
              if (x < gridSize) {
                 const id = lib.spawnFromTemplate(engine.entityMgr, 'terrain-road', new THREE.Vector3(px + blockSize/2, 0.2, pz));
                 const t = engine.world.transforms.get(id);
                 if (t) {
                     t.scale.z = 1.6;
                     const rb = engine.world.rigidBodies.get(id);
                     const def = engine.world.bodyDefs.get(id);
                     if(rb && def) engine.physicsService.updateBodyScale(rb.handle, def, t.scale);
                 }
              }
              
              if (z < gridSize) {
                 const rot = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI/2, 0));
                 const id = lib.spawnFromTemplate(engine.entityMgr, 'terrain-road', new THREE.Vector3(px, 0.2, pz + blockSize/2), rot);
                 const t = engine.world.transforms.get(id);
                 if (t) {
                     t.scale.z = 1.6; 
                     const rb = engine.world.rigidBodies.get(id);
                     const def = engine.world.bodyDefs.get(id);
                     if(rb && def) engine.physicsService.updateBodyScale(rb.handle, def, t.scale);
                 }
              }
          }
      }

      for (let x = 0; x < gridSize; x++) {
          for (let z = 0; z < gridSize; z++) {
              const px = x * blockSize - offset + blockSize/2;
              const pz = z * blockSize - offset + blockSize/2;

              if (Math.random() > 0.93) {
                  // Tree height 4. Center 2.
                  lib.spawnFromTemplate(engine.entityMgr, 'hero-tree', new THREE.Vector3(px, 2, pz));
                  continue;
              }

              const noise = Math.sin(x * 0.4) + Math.cos(z * 0.4); 
              let type = 'building-small';
              
              if (noise > 0.6) type = 'building-skyscraper';
              else if (noise > 0.2) type = 'building-tall';
              else if (Math.random() > 0.5) type = 'building-wide';

              const tpl = lib.templates.find(t => t.id === type)!;
              const angle = Math.floor(Math.random() * 4) * (Math.PI / 2);
              const rot = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, angle, 0));
              
              // Buildings are now centered geometry. Spawn at H/2.
              lib.spawnFromTemplate(engine.entityMgr, type, new THREE.Vector3(px, tpl.size.y/2, pz), rot);
          }
      }
      
      for(let i=0; i<30; i++) {
          const x = (Math.random() - 0.5) * 180;
          const z = (Math.random() - 0.5) * 180;
          if (Math.abs(x) < 10 && Math.abs(z) < 10) continue;
          lib.spawnFromTemplate(engine.entityMgr, 'prop-barrel', new THREE.Vector3(x, 10, z)); 
      }

      engine.setCameraPreset('front');
      engine.setGravity(-9.81);
  }
};
