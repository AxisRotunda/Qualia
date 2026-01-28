
import { Injectable, inject } from '@angular/core';
import { EngineService } from './engine.service';
import { EntityLibraryService } from './entity-library.service';
import { ParticleService } from './particle.service';
import * as THREE from 'three';

export interface ScenePreset {
  id: string;
  label: string;
  description: string;
  theme: 'city' | 'forest' | 'ice' | 'default';
  previewColor: string;
  load: (engine: EngineService) => void;
}

@Injectable({
  providedIn: 'root'
})
export class SceneRegistryService {
  private entityLib = inject(EntityLibraryService);
  private particleService = inject(ParticleService);

  private scenes = new Map<string, ScenePreset>();

  constructor() {
    this.registerScenes();
  }

  registerScene(preset: ScenePreset) { this.scenes.set(preset.id, preset); }
  listScenes() { return Array.from(this.scenes.values()); }
  getPreset(id: string) { return this.scenes.get(id); }
  getLabel(id: string) { return this.scenes.get(id)?.label ?? 'Unknown Scene'; }

  loadScene(engine: EngineService, sceneId: string) {
    const preset = this.scenes.get(sceneId);
    if (!preset) return;

    engine.reset();
    preset.load(engine);
    
    if (preset.theme === 'forest' || preset.theme === 'ice') {
        if (!engine.texturesEnabled()) engine.toggleTextures();
    }
  }

  private registerScenes() {
    this.registerScene({
      id: 'city', label: 'City Slice', description: 'Concrete canyons.', theme: 'city', previewColor: 'from-blue-600 to-indigo-900',
      load: (engine) => this.loadCitySlice(engine)
    });
    this.registerScene({
      id: 'forest', label: 'Deep Forest', description: 'Dense logs and trees.', theme: 'forest', previewColor: 'from-emerald-700 to-green-900',
      load: (engine) => this.loadForest(engine)
    });
    this.registerScene({
      id: 'ice', label: 'Glacial Plain', description: 'Slippery ice.', theme: 'ice', previewColor: 'from-cyan-400 to-blue-200',
      load: (engine) => this.loadIce(engine)
    });
    this.registerScene({
      id: 'stacks', label: 'Stacks & Ramps', description: 'Physics testbed.', theme: 'default', previewColor: 'from-amber-600 to-orange-800',
      load: (engine) => this.loadStacksAndRamps(engine)
    });
    this.registerScene({
      id: 'particles', label: 'Pillars & Particles', description: 'Visual demo.', theme: 'default', previewColor: 'from-violet-600 to-purple-900',
      load: (engine) => this.loadPillarsAndParticles(engine)
    });
  }

  private loadCitySlice(engine: EngineService) {
      engine.sceneService.setAtmosphere('clear');
      for (let x = 0; x < 8; x++) {
        for (let z = 0; z < 8; z++) {
          const posX = (x * 15) - 60;
          const posZ = (z * 15) - 60;
          if (x % 3 === 0 || z % 3 === 0) {
             this.entityLib.spawnFromTemplate(engine.entityMgr, 'terrain-road', new THREE.Vector3(posX, 0.1, posZ));
             continue;
          }
          if (Math.random() > 0.3) {
             const type = Math.random() > 0.6 ? 'building-tall' : 'building-small';
             const tpl = this.entityLib.templates.find(t => t.id === type)!;
             this.entityLib.spawnFromTemplate(engine.entityMgr, type, new THREE.Vector3(posX, tpl.size.y / 2, posZ));
          } else {
             this.entityLib.spawnFromTemplate(engine.entityMgr, 'prop-glass-block', new THREE.Vector3(posX, 1.5, posZ));
          }
        }
      }
      engine.setCameraPreset('front');
  }

  private loadForest(engine: EngineService) {
      engine.sceneService.setAtmosphere('forest');
      for(let i=0; i<8; i++) {
          const angle = (i/8) * Math.PI * 2;
          const x = Math.cos(angle) * 8;
          const z = Math.sin(angle) * 8;
          const rot = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.random()*Math.PI, 0));
          this.entityLib.spawnFromTemplate(engine.entityMgr, 'hero-tree', new THREE.Vector3(x, 0, z), rot);
      }
      for(let i=0; i<40; i++) {
          const dist = 20 + Math.random() * 60;
          const angle = Math.random() * Math.PI * 2;
          this.entityLib.spawnFromTemplate(engine.entityMgr, 'prop-tree', new THREE.Vector3(Math.cos(angle)*dist, 4, Math.sin(angle)*dist));
      }
      engine.setCameraPreset('side');
  }

  private loadIce(engine: EngineService) {
      engine.sceneService.setAtmosphere('ice');
      for(let x=-2; x<=2; x++) for(let z=-2; z<=2; z++) 
          this.entityLib.spawnFromTemplate(engine.entityMgr, 'terrain-ice', new THREE.Vector3(x*20, 0.2, z*20));
      for(let i=0; i<15; i++) 
          this.entityLib.spawnFromTemplate(engine.entityMgr, 'prop-ice-block', new THREE.Vector3((Math.random()-0.5)*40, 5+i*2, (Math.random()-0.5)*40));
      engine.setCameraPreset('front');
  }

  private loadStacksAndRamps(engine: EngineService) {
      engine.sceneService.setAtmosphere('clear');
      const rampRot = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.2, 0, 0));
      this.entityLib.spawnFromTemplate(engine.entityMgr, 'structure-ramp', new THREE.Vector3(0, 5, 0), rampRot);
      for(let i=0; i<10; i++) this.entityLib.spawnFromTemplate(engine.entityMgr, 'prop-crate', new THREE.Vector3(0, 10 + (i*1.6), -8));
      engine.setCameraPreset('side');
  }

  private loadPillarsAndParticles(engine: EngineService) {
      engine.sceneService.setAtmosphere('night');
      this.particleService.init(engine.sceneService.getScene(), 1000);
      for(let i=0; i<12; i++) {
          const angle = (i/12) * Math.PI * 2;
          this.entityLib.spawnFromTemplate(engine.entityMgr, 'prop-pillar', new THREE.Vector3(Math.cos(angle)*15, 4, Math.sin(angle)*15));
      }
      this.entityLib.spawnFromTemplate(engine.entityMgr, 'building-tall', new THREE.Vector3(0, 10, 0));
      engine.setCameraPreset('top');
  }
}
