
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { ArchBuildingService, BuildingOptions } from './architecture/arch-building.service';
import { ArchRoadService } from './architecture/arch-road.service';

@Injectable({
  providedIn: 'root'
})
export class ArchitectureGeneratorService {
  private buildings = inject(ArchBuildingService);
  private roads = inject(ArchRoadService);

  generateRoad(w: number, length: number): THREE.BufferGeometry | null {
    return this.roads.generateRoad(w, length);
  }

  generateBuilding(w: number, totalH: number, d: number, tiers: number, options?: BuildingOptions): THREE.BufferGeometry | null {
    return this.buildings.generateBuilding(w, totalH, d, tiers, options);
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
}
