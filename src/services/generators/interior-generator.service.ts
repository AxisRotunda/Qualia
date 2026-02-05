
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { InteriorStructureService } from './interior/interior-structure.service';
import { InteriorFurnishingsService } from './interior/interior-furnishings.service';

@Injectable({
    providedIn: 'root'
})
export class InteriorGeneratorService {
    private structureGen = inject(InteriorStructureService);
    private furnishingsGen = inject(InteriorFurnishingsService);

    // --- Delegation ---

    generateWallSegment(w: number, h: number, thick: number): THREE.BufferGeometry | null {
        return this.structureGen.generateWallSegment(w, h, thick);
    }

    generateDoorway(w: number, h: number, thick: number): THREE.BufferGeometry | null {
        return this.structureGen.generateDoorway(w, h, thick);
    }

    generateWindowWall(w: number, h: number, thick: number): THREE.BufferGeometry | null {
        return this.structureGen.generateWindowWall(w, h, thick);
    }

    generateSofa(): THREE.BufferGeometry | null {
        return this.furnishingsGen.generateSofa();
    }

    generateBed(): THREE.BufferGeometry | null {
        return this.furnishingsGen.generateBed();
    }

    generateChandelier(): THREE.BufferGeometry | null {
        return this.furnishingsGen.generateChandelier();
    }

    generateOfficeChair(): THREE.BufferGeometry | null {
        return this.furnishingsGen.generateOfficeChair();
    }

    generateStaircase(width: number, height: number, depth: number, steps: number): THREE.BufferGeometry | null {
        return this.structureGen.generateStaircase(width, height, depth, steps);
    }

    generateRailing(length: number): THREE.BufferGeometry | null {
        return this.structureGen.generateRailing(length);
    }

    generateOrnateColumn(height: number): THREE.BufferGeometry | null {
        return this.structureGen.generateOrnateColumn(height);
    }

    generateCeilingPanel(size: number): THREE.BufferGeometry | null {
        return this.structureGen.generateCeilingPanel(size);
    }

    generateGlassPartition(w: number, h: number): THREE.BufferGeometry | null {
        return this.structureGen.generateGlassPartition(w, h);
    }

    generateServerRack(): THREE.BufferGeometry | null {
        return this.furnishingsGen.generateServerRack();
    }

    generateDesk(): THREE.BufferGeometry | null {
        return this.furnishingsGen.generateDesk();
    }

    generateMonitorCluster(): THREE.BufferGeometry | null {
        return this.furnishingsGen.generateMonitorCluster();
    }

    generateFileCabinet(): THREE.BufferGeometry | null {
        return this.furnishingsGen.generateFileCabinet();
    }

    generateMapTable(): THREE.BufferGeometry | null {
        return this.furnishingsGen.generateMapTable();
    }

    generateCeilingLight(): THREE.BufferGeometry | null {
        return this.furnishingsGen.generateCeilingLight();
    }
}
