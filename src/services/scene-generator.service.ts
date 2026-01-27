
import { Injectable } from '@angular/core';
import { EngineService } from './engine.service';
import { EntityLibraryService } from './entity-library.service';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class SceneGeneratorService {
  constructor(private entityLib: EntityLibraryService) {}

  generateCityBlock(engine: EngineService) {
    const size = 12; // 12x12 grid
    const spacing = 15;
    const offset = (size * spacing) / 2;

    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        const posX = (x * spacing) - offset;
        const posZ = (z * spacing) - offset;
        
        // Road Logic: Every 4th row/col is a road
        const isRoadX = x % 4 === 0;
        const isRoadZ = z % 4 === 0;

        if (isRoadX || isRoadZ) {
           // Spawn Road
           this.entityLib.spawnFromTemplate(engine, 'terrain-road', new THREE.Vector3(posX, 0.1, posZ));
           continue;
        }

        // Randomly spawn buildings or props in non-road cells
        if (Math.random() > 0.3) {
           const type = Math.random() > 0.7 ? 'building-tall' : 'building-small';
           const tpl = this.entityLib.templates.find(t => t.id === type);
           if (tpl) {
               // Y position: half height for box so it sits on ground
               const y = tpl.size.y / 2;
               this.entityLib.spawnFromTemplate(engine, type, new THREE.Vector3(posX, y, posZ));
           }
        } else if (Math.random() > 0.5) {
             // Plaza / Props
             this.entityLib.spawnFromTemplate(engine, 'prop-pillar', new THREE.Vector3(posX, 4, posZ));
        }
      }
    }
    
    // Add some random scatter
    for(let i=0; i<20; i++) {
        const x = (Math.random() - 0.5) * size * spacing;
        const z = (Math.random() - 0.5) * size * spacing;
        this.entityLib.spawnFromTemplate(engine, 'prop-crate', new THREE.Vector3(x, 10, z));
        this.entityLib.spawnFromTemplate(engine, 'prop-barrel', new THREE.Vector3(x + 2, 12, z + 2));
    }
  }
}
    