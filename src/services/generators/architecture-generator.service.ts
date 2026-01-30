
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { ArchBuildingService } from './architecture/arch-building.service';
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

  generateBuilding(w: number, totalH: number, d: number, tiers: number): THREE.BufferGeometry | null {
    return this.buildings.generateBuilding(w, totalH, d, tiers);
  }
}
