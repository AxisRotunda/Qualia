
import { Injectable, inject } from '@angular/core';
import { EngineService } from './engine.service';
import { EntityLibraryService } from './entity-library.service';
import { ParticleService } from './particle.service';
import * as THREE from 'three';

interface ScenePreset {
  label: string;
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

  // Plug-in surface: registerScene, listScenes, loadScene
  registerScene(id: string, preset: ScenePreset) {
      this.scenes.set(id, preset);
  }

  listScenes(): {id: string, label: string}[] {
      return Array.from(this.scenes.entries()).map(([id, preset]) => ({id, label: preset.label}));
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
    this.registerScene('city', {
      label: 'City Slice',
      load: (engine) => this.loadCitySlice(engine)
    });
    this.registerScene('stacks', {
      label: 'Stacks & Ramps',
      load: (engine) => this.loadStacksAndRamps(engine)
    });
    this.registerScene('particles', {
      label: 'Pillars & Particles',
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
