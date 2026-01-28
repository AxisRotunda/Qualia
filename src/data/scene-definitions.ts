
import * as THREE from 'three';
import { EngineService } from '../services/engine.service';
import { EntityLibraryService } from '../services/entity-library.service';

// Minimal interface to avoid full service dependency if needed, 
// but for now we use the service types for ease of refactoring.

export interface ScenePreset {
  id: string;
  label: string;
  description: string;
  theme: 'city' | 'forest' | 'ice' | 'default';
  previewColor: string;
  load: (engine: EngineService, lib: EntityLibraryService) => void;
}

export const SCENE_DEFINITIONS: ScenePreset[] = [
    {
      id: 'city', label: 'City Slice', description: 'Concrete canyons.', theme: 'city', previewColor: 'from-blue-600 to-indigo-900',
      load: (engine, lib) => {
          engine.environmentService.setAtmosphere('clear');
          const tpls = lib.templates;
          for (let x = 0; x < 8; x++) {
            for (let z = 0; z < 8; z++) {
              const posX = (x * 15) - 60;
              const posZ = (z * 15) - 60;
              if (x % 3 === 0 || z % 3 === 0) {
                 lib.spawnFromTemplate(engine.entityMgr, 'terrain-road', new THREE.Vector3(posX, 0.1, posZ));
                 continue;
              }
              if (Math.random() > 0.3) {
                 const type = Math.random() > 0.6 ? 'building-tall' : 'building-small';
                 const tpl = tpls.find(t => t.id === type)!;
                 lib.spawnFromTemplate(engine.entityMgr, type, new THREE.Vector3(posX, tpl.size.y / 2, posZ));
              } else {
                 lib.spawnFromTemplate(engine.entityMgr, 'prop-glass-block', new THREE.Vector3(posX, 1.5, posZ));
              }
            }
          }
          engine.setCameraPreset('front');
      }
    },
    {
      id: 'forest', label: 'Deep Forest', description: 'Dense logs and trees.', theme: 'forest', previewColor: 'from-emerald-700 to-green-900',
      load: (engine, lib) => {
          engine.environmentService.setAtmosphere('forest');
          for(let i=0; i<8; i++) {
              const angle = (i/8) * Math.PI * 2;
              const x = Math.cos(angle) * 8;
              const z = Math.sin(angle) * 8;
              const rot = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.random()*Math.PI, 0));
              lib.spawnFromTemplate(engine.entityMgr, 'hero-tree', new THREE.Vector3(x, 0, z), rot);
          }
          for(let i=0; i<40; i++) {
              const dist = 20 + Math.random() * 60;
              const angle = Math.random() * Math.PI * 2;
              lib.spawnFromTemplate(engine.entityMgr, 'prop-tree', new THREE.Vector3(Math.cos(angle)*dist, 4, Math.sin(angle)*dist));
          }
          engine.setCameraPreset('side');
      }
    },
    {
      id: 'ice', label: 'Glacial Plain', description: 'Slippery ice.', theme: 'ice', previewColor: 'from-cyan-400 to-blue-200',
      load: (engine, lib) => {
          engine.environmentService.setAtmosphere('ice');
          for(let x=-2; x<=2; x++) for(let z=-2; z<=2; z++) 
              lib.spawnFromTemplate(engine.entityMgr, 'terrain-ice', new THREE.Vector3(x*20, 0.2, z*20));
          for(let i=0; i<15; i++) 
              lib.spawnFromTemplate(engine.entityMgr, 'prop-ice-block', new THREE.Vector3((Math.random()-0.5)*40, 5+i*2, (Math.random()-0.5)*40));
          engine.setCameraPreset('front');
      }
    },
    {
      id: 'stacks', label: 'Stacks & Ramps', description: 'Physics testbed.', theme: 'default', previewColor: 'from-amber-600 to-orange-800',
      load: (engine, lib) => {
          engine.environmentService.setAtmosphere('clear');
          const rampRot = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.2, 0, 0));
          lib.spawnFromTemplate(engine.entityMgr, 'structure-ramp', new THREE.Vector3(0, 5, 0), rampRot);
          for(let i=0; i<10; i++) lib.spawnFromTemplate(engine.entityMgr, 'prop-crate', new THREE.Vector3(0, 10 + (i*1.6), -8));
          engine.setCameraPreset('side');
      }
    },
    {
      id: 'particles', label: 'Pillars & Particles', description: 'Visual demo.', theme: 'default', previewColor: 'from-violet-600 to-purple-900',
      load: (engine, lib) => {
          engine.environmentService.setAtmosphere('night');
          engine.particleService.init(engine.sceneService.getScene(), 1000);
          for(let i=0; i<12; i++) {
              const angle = (i/12) * Math.PI * 2;
              lib.spawnFromTemplate(engine.entityMgr, 'prop-pillar', new THREE.Vector3(Math.cos(angle)*15, 4, Math.sin(angle)*15));
          }
          lib.spawnFromTemplate(engine.entityMgr, 'building-tall', new THREE.Vector3(0, 10, 0));
          engine.setCameraPreset('top');
      }
    }
];
