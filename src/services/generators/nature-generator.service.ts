
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { NatureFloraService } from './nature/nature-flora.service';
import { NatureGeologyService } from './nature/nature-geology.service';
import { NatureTerrainService } from './nature/nature-terrain.service';

@Injectable({
  providedIn: 'root'
})
export class NatureGeneratorService {
  private flora = inject(NatureFloraService);
  private geology = inject(NatureGeologyService);
  
  // Public for access by Scenes
  public terrain = inject(NatureTerrainService);

  generateTree(complexity: number = 1.0): THREE.BufferGeometry | null {
    return this.flora.generateTree(complexity);
  }

  generatePalmTree(complexity: number = 1.0): THREE.BufferGeometry | null {
    return this.flora.generatePalmTree(complexity);
  }

  generateRock(type?: 'granite' | 'sedimentary', complexity: number = 1.0): THREE.BufferGeometry {
    return this.geology.generateRock(type, complexity);
  }

  generateIceChunk(complexity: number = 1.0): THREE.BufferGeometry {
    return this.geology.generateIceChunk(complexity);
  }

  generateLog(): THREE.BufferGeometry {
    return this.flora.generateLog();
  }

  generateIceTerrain(size = 128): THREE.BufferGeometry {
    return this.terrain.generateIceTerrain(size);
  }

  generateIceSpire(): THREE.BufferGeometry {
    return this.geology.generateIceSpire();
  }
  
  generateCinderBlock(): THREE.BufferGeometry | null {
      return this.geology.generateCinderBlock();
  }
}
