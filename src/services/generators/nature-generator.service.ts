
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
  private terrain = inject(NatureTerrainService);

  generateTree(): THREE.BufferGeometry | null {
    return this.flora.generateTree();
  }

  generateRock(): THREE.BufferGeometry {
    return this.geology.generateRock();
  }

  generateIceChunk(): THREE.BufferGeometry {
    return this.geology.generateIceChunk();
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
}
