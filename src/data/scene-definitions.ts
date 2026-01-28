
import * as THREE from 'three';
import { EngineService } from '../services/engine.service';
import { EntityLibraryService } from '../services/entity-library.service';

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
      id: 'forest', label: 'Deep Forest', description: 'Dense woods with fallen logs.', theme: 'forest', previewColor: 'from-emerald-700 to-green-900',
      load: (engine, lib) => {
          engine.environmentService.setAtmosphere('forest');
          
          // Dense Trees
          for(let i=0; i<30; i++) {
              const angle = Math.random() * Math.PI * 2;
              const dist = 10 + Math.random() * 80;
              const x = Math.cos(angle) * dist;
              const z = Math.sin(angle) * dist;
              const rot = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.random()*Math.PI, 0));
              lib.spawnFromTemplate(engine.entityMgr, 'hero-tree', new THREE.Vector3(x, 0, z), rot);
          }

          // Fallen Logs
          for(let i=0; i<15; i++) {
              const x = (Math.random() - 0.5) * 80;
              const z = (Math.random() - 0.5) * 80;
              // Logs lie flat-ish, random yaw, slight pitch/roll for uneven ground feel
              const rot = new THREE.Quaternion().setFromEuler(new THREE.Euler(
                  Math.PI/2 + (Math.random()-0.5)*0.2, 
                  Math.random()*Math.PI, 
                  (Math.random()-0.5)*0.2
              ));
              lib.spawnFromTemplate(engine.entityMgr, 'prop-log', new THREE.Vector3(x, 1, z), rot);
          }

          // Scattered Rocks
          for(let i=0; i<20; i++) {
             const x = (Math.random() - 0.5) * 100;
             const z = (Math.random() - 0.5) * 100;
             const scale = 0.8 + Math.random() * 1.5;
             const id = lib.spawnFromTemplate(engine.entityMgr, 'hero-rock', new THREE.Vector3(x, scale/2, z));
             
             // Manually apply scale to rock for variety
             const t = engine.world.transforms.get(id);
             if (t) t.scale = {x: scale, y: scale, z: scale};
             const body = engine.world.rigidBodies.get(id);
             const def = engine.world.bodyDefs.get(id);
             if(body && def) engine.physicsService.updateBodyScale(body.handle, def, t!.scale);
          }

          engine.setCameraPreset('side');
      }
    },
    {
      id: 'ice', label: 'Glacial Plain', description: 'Slippery ice fields.', theme: 'ice', previewColor: 'from-cyan-400 to-blue-200',
      load: (engine, lib) => {
          engine.environmentService.setAtmosphere('ice');
          
          // Floor
          for(let x=-3; x<=3; x++) for(let z=-3; z<=3; z++) 
              lib.spawnFromTemplate(engine.entityMgr, 'terrain-ice', new THREE.Vector3(x*20, 0.2, z*20));
          
          // Ice Spires
          for(let i=0; i<25; i++) {
              const x = (Math.random()-0.5)*80;
              const z = (Math.random()-0.5)*80;
              const rot = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.random()*Math.PI, (Math.random()-0.5)*0.3));
              lib.spawnFromTemplate(engine.entityMgr, 'hero-ice-chunk', new THREE.Vector3(x, 1, z), rot);
          }

          // Dynamic Ice Cubes
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
