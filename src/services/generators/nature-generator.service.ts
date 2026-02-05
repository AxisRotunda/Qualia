
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { NatureFloraService } from './nature/nature-flora.service';
import { NatureGeologyService } from './nature/nature-geology.service';
import { NatureTerrainService } from './nature/nature-terrain.service';

@Injectable({
    providedIn: 'root'
})
export class NatureGeneratorService {
    public flora = inject(NatureFloraService);
    public geology = inject(NatureGeologyService);

    // Public for access by Scenes
    public terrain = inject(NatureTerrainService);

    generateTree(complexity: number = 1.0, seed?: number): THREE.BufferGeometry | null {
        return this.flora.generateTree(complexity, seed);
    }

    generatePineTree(complexity: number = 1.0, seed?: number): THREE.BufferGeometry | null {
        return this.flora.generatePineTree(complexity, seed);
    }

    generatePalmTree(complexity: number = 1.0, seed?: number): THREE.BufferGeometry | null {
        return this.flora.generatePalmTree(complexity, seed);
    }

    generateTundraBush(complexity: number = 1.0, seed?: number): THREE.BufferGeometry | null {
        return this.flora.generateTundraBush(complexity, seed);
    }

    generateRock(type?: 'granite' | 'sedimentary', complexity: number = 1.0, seed?: number): THREE.BufferGeometry {
        return this.geology.generateRock(type, complexity, seed);
    }

    generateIceChunk(complexity: number = 1.0, seed?: number): THREE.BufferGeometry {
        return this.geology.generateIceChunk(complexity, seed);
    }

    generateIceBlock(size: number, seed?: number): THREE.BufferGeometry {
        return this.geology.generateIceBlock(size, seed);
    }

    generateIceSpikeCluster(seed?: number): THREE.BufferGeometry | null {
        return this.flora.generateIceSpikeCluster(seed);
    }

    generateLog(seed?: number): THREE.BufferGeometry {
        return this.flora.generateLog(seed);
    }

    generateIceTerrain(size = 128): THREE.BufferGeometry {
        return this.terrain.generateIceTerrain(size);
    }

    generateIceSpire(seed?: number): THREE.BufferGeometry {
        return this.geology.generateIceSpire(seed);
    }

    generateCinderBlock(seed?: number): THREE.BufferGeometry | null {
        return this.geology.generateCinderBlock(seed);
    }
}
