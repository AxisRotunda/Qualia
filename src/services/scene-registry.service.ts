
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

  registerScene(preset: ScenePreset) {
      this.scenes.set(preset.id, preset);
  }

  listScenes(): ScenePreset[] {
      return Array.from(this.scenes.values());
  }

  getPreset(id: string): ScenePreset | undefined {
      return this.scenes.get(id);
  }

  getLabel(id: string): string {
      return this.scenes.get(id)?.label ?? 'Unknown Scene';
  }

  loadScene(engine: EngineService, sceneId: string) {
    const preset = this.scenes.get(sceneId);
    if (!preset) {
      console.warn(`Scene ${sceneId} not found`);
      return;
    }

    // Uniform Lifecycle: Reset -> Atmosphere -> Spawn -> Camera
    engine.reset();
    preset.load(engine);
  }

  private registerScenes() {
    this.registerScene({
      id: 'city',
      label: 'City Slice',
      description: 'Concrete canyons and stacked crates in a neutral atmosphere.',
      theme: 'city',
      previewColor: 'from-blue-600 to-indigo-900',
      load: (engine) => this.loadCitySlice(engine)
    });

    this.registerScene({
      id: 'forest',
      label: 'Deep Forest',
      description: 'Dense logs and trees with heavy friction on rough terrain.',
      theme: 'forest',
      previewColor: 'from-emerald-700 to-green-900',
      load: (engine) => this.loadForest(engine)
    });

    this.registerScene({
      id: 'ice',
      label: 'Glacial Plain',
      description: 'Slippery ice planes and bouncing blocks in bright glare.',
      theme: 'ice',
      previewColor: 'from-cyan-400 to-blue-200',
      load: (engine) => this.loadIce(engine)
    });

    this.registerScene({
      id: 'stacks',
      label: 'Stacks & Ramps',
      description: 'Precariously stacked crates and ramps for stability testing.',
      theme: 'default',
      previewColor: 'from-amber-600 to-orange-800',
      load: (engine) => this.loadStacksAndRamps(engine)
    });

    this.registerScene({
      id: 'particles',
      label: 'Pillars & Particles',
      description: 'Glowing particles and monoliths in a dark void.',
      theme: 'default',
      previewColor: 'from-violet-600 to-purple-900',
      load: (engine) => this.loadPillarsAndParticles(engine)
    });
  }

  private loadCitySlice(engine: EngineService) {
      engine.sceneService.setAtmosphere('clear');
      // 8x8 Grid
      const size = 8;
      const spacing = 15;
      const offset = (size * spacing) / 2;

      for (let x = 0; x < size; x++) {
        for (let z = 0; z < size; z++) {
          const posX = (x * spacing) - offset;
          const posZ = (z * spacing) - offset;
          
          if (x % 3 === 0 || z % 3 === 0) {
             this.entityLib.spawnFromTemplate(engine, 'terrain-road', new THREE.Vector3(posX, 0.1, posZ));
             continue;
          }

          if (Math.random() > 0.3) {
             const type = Math.random() > 0.6 ? 'building-tall' : 'building-small';
             const tpl = this.entityLib.templates.find(t => t.id === type)!;
             this.entityLib.spawnFromTemplate(engine, type, new THREE.Vector3(posX, tpl.size.y / 2, posZ));
          } else {
             this.entityLib.spawnFromTemplate(engine, 'prop-glass-block', new THREE.Vector3(posX, 1.5, posZ));
          }
        }
      }
      
      engine.setCameraPreset('front');
  }

  private loadForest(engine: EngineService) {
      engine.sceneService.setAtmosphere('forest');
      
      // Random trees and logs
      for(let i=0; i<30; i++) {
          const x = (Math.random() - 0.5) * 80;
          const z = (Math.random() - 0.5) * 80;
          this.entityLib.spawnFromTemplate(engine, 'prop-tree', new THREE.Vector3(x, 4, z));
      }

      // Fallen logs (dynamic)
      for(let i=0; i<10; i++) {
          const x = (Math.random() - 0.5) * 60;
          const z = (Math.random() - 0.5) * 60;
          const rot = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.random(), Math.random(), Math.random()));
          this.entityLib.spawnFromTemplate(engine, 'prop-log', new THREE.Vector3(x, 5, z), rot);
      }

      // Some rocks (using simple spheres or crates for now, mapped to generic prop)
      for(let i=0; i<15; i++) {
         const x = (Math.random() - 0.5) * 60;
         const z = (Math.random() - 0.5) * 60;
         this.entityLib.spawnFromTemplate(engine, 'prop-crate', new THREE.Vector3(x, 1, z));
      }

      engine.setCameraPreset('side');
  }

  private loadIce(engine: EngineService) {
      engine.sceneService.setAtmosphere('ice');

      // Ice Ground patches
      for(let x=-2; x<=2; x++) {
          for(let z=-2; z<=2; z++) {
              this.entityLib.spawnFromTemplate(engine, 'terrain-ice', new THREE.Vector3(x*20, 0.2, z*20));
          }
      }

      // Slippery platforms and blocks
      for(let i=0; i<20; i++) {
          const x = (Math.random() - 0.5) * 40;
          const z = (Math.random() - 0.5) * 40;
          this.entityLib.spawnFromTemplate(engine, 'prop-ice-block', new THREE.Vector3(x, 5 + i*2, z));
      }
      
      engine.setCameraPreset('front');
  }

  private loadStacksAndRamps(engine: EngineService) {
      engine.sceneService.setAtmosphere('clear');
      
      // Ramp
      const rampRot = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.2, 0, 0));
      this.entityLib.spawnFromTemplate(engine, 'structure-ramp', new THREE.Vector3(0, 5, 0), rampRot);

      // Stack
      for(let i=0; i<10; i++) {
          this.entityLib.spawnFromTemplate(engine, 'prop-crate', new THREE.Vector3(0, 10 + (i*1.6), -8));
      }
      
      // Dominos
      for(let i=0; i<8; i++) {
        this.entityLib.spawnFromTemplate(engine, 'prop-barrel', new THREE.Vector3(-5 + i*1.5, 2, 5));
      }

      engine.updateCount();
      engine.setCameraPreset('side');
  }

  private loadPillarsAndParticles(engine: EngineService) {
      engine.sceneService.setAtmosphere('night');
      this.particleService.init(engine.sceneService.getScene(), 1000);
      
      // Circle of pillars
      const count = 12;
      const radius = 15;
      for(let i=0; i<count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          this.entityLib.spawnFromTemplate(engine, 'prop-pillar', new THREE.Vector3(x, 4, z));
      }
      
      // Centerpiece
      this.entityLib.spawnFromTemplate(engine, 'building-tall', new THREE.Vector3(0, 10, 0));
      
      engine.setCameraPreset('top');
  }
}
