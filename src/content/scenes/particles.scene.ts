
import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';

export const PARTICLES_SCENE: ScenePreset = {
  id: 'particles', 
  label: 'Pillars & Particles', 
  description: 'Visual physics performance test.', 
  theme: 'default', 
  previewColor: 'from-violet-600 to-purple-900',
  load: (engine, lib) => {
      engine.sceneService.setAtmosphere('night');
      engine.particleService.setWeather('rain', engine.sceneService.getScene());
      for(let i=0; i<12; i++) {
          const angle = (i/12) * Math.PI * 2;
          lib.spawnFromTemplate(engine.entityMgr, 'prop-pillar', new THREE.Vector3(Math.cos(angle)*15, 4, Math.sin(angle)*15));
      }
      lib.spawnFromTemplate(engine.entityMgr, 'building-tall', new THREE.Vector3(0, 10, 0));
      engine.setCameraPreset('top');
      engine.setGravity(-9.81);
  }
};
