
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

  private registerScenes() {
    this.scenes.set('city', {
      label: 'City Slice',
      load: (engine) => this.loadCitySlice(engine)
    });
    this.scenes.set('stacks', {
      label: 'Stacks & Ramps',
      load: (engine) => this.loadStacksAndRamps(engine)
    });
    this.scenes.set('particles', {
      label: 'Pillars & Particles',
      load: (engine) => this.loadPillarsAndParticles(engine)
    });
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
      
      // Ramp - using explicit creation here as it's a unique static geometry for this scene
      const ramp = engine.physicsService.createBox(0, 5, 0, 10, 0.5, 20, 0); // Static
      engine.physicsService.updateBodyTransform(ramp.handle, {x:0, y:5, z:0}, {x:0.2, y:0, z:0, w:0.98}); // Tilt
      engine.physicsService.updateBodyMaterial(ramp.handle, {friction: 0.1, restitution: 0});
      const mesh = engine.sceneService.createMesh(ramp, { materialId: 'mat-metal' });
      
      const e = engine.world.createEntity();
      engine.world.rigidBodies.add(e, {handle: ramp.handle});
      engine.world.meshes.add(e, {mesh});
      engine.world.transforms.add(e, {position:{x:0,y:5,z:0}, rotation:{x:0.2,y:0,z:0,w:0.98}, scale:{x:1,y:1,z:1}});
      engine.world.bodyDefs.add(e, ramp);
      engine.world.names.add(e, "Ramp");

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
