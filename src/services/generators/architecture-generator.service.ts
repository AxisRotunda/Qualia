
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { ArchBuildingService, BuildingOptions } from './architecture/arch-building.service';
import { ArchRoadService } from './architecture/arch-road.service';
import { ArchIndustrialService } from './architecture/arch-industrial.service';
import { ArchMedievalService } from './architecture/arch-medieval.service';

/**
 * ArchitectureGeneratorService: Facade for all architectural procedural systems.
 * Refactored for RUN_REF (buildings) to focus on structural integrity and PBR optimization.
 */
@Injectable({
    providedIn: 'root'
})
export class ArchitectureGeneratorService {
    public readonly buildings = inject(ArchBuildingService);
    public readonly roads = inject(ArchRoadService);
    public readonly industrial = inject(ArchIndustrialService);
    public readonly medieval = inject(ArchMedievalService);

    // --- Building Domain ---
    generateBuilding(w: number, totalH: number, d: number, tiers: number, options?: BuildingOptions): THREE.BufferGeometry | null {
        return this.buildings.generateBuilding(w, totalH, d, tiers, options);
    }

    // --- Infrastructure Domain ---
    generateRoad(w: number, length: number): THREE.BufferGeometry | null {
        return this.roads.generateRoad(w, length);
    }

    generateHighway(width: number, length: number): THREE.BufferGeometry | null {
        return this.roads.generateHighway(width, length);
    }

    generateIntersection(width: number): THREE.BufferGeometry | null {
        return this.roads.generateIntersection(width);
    }

    generateRamp(width: number, length: number, height: number): THREE.BufferGeometry | null {
        return this.roads.generateRamp(width, length, height);
    }

    generateRoundabout(radius: number, width: number): THREE.BufferGeometry | null {
        return this.roads.generateRoundabout(radius, width);
    }

    // --- Industrial Domain ---
    generateRigLeg(height: number, radius: number): THREE.BufferGeometry | null {
        return this.industrial.generateRigLeg(height, radius);
    }

    generateIndustrialStairs(width: number, height: number, depth: number, steps: number): THREE.BufferGeometry | null {
        return this.industrial.generateIndustrialStairs(width, height, depth, steps);
    }

    generateIndustrialRailing(length: number): THREE.BufferGeometry | null {
        return this.industrial.generateIndustrialRailing(length);
    }

    generateIndustrialCrate(size: number): THREE.BufferGeometry | null {
        return this.industrial.generateIndustrialCrate(size);
    }

    generateIndustrialBarrel(radius: number, height: number): THREE.BufferGeometry | null {
        return this.industrial.generateIndustrialBarrel(radius, height);
    }

    generateShippingContainer(length: number, width: number, height: number): THREE.BufferGeometry | null {
        return this.industrial.generateShippingContainer(length, width, height);
    }

    // --- Medieval Domain ---
    generateTower(radius: number, height: number): THREE.BufferGeometry | null {
        return this.medieval.generateTower(radius, height);
    }

    generateWall(length: number, height: number, thickness: number): THREE.BufferGeometry | null {
        return this.medieval.generateCurtainWall(length, height, thickness);
    }
}
