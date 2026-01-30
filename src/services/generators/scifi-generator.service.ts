
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { SciFiStructureService } from './scifi/scifi-structure.service';
import { SciFiEnvironmentService } from './scifi/scifi-environment.service';

@Injectable({
  providedIn: 'root'
})
export class SciFiGeneratorService {
  private structure = inject(SciFiStructureService);
  private environment = inject(SciFiEnvironmentService);

  generateResearchStationV2(): THREE.BufferGeometry | null {
    return this.structure.generateResearchStationV2();
  }

  generateSciFiCorridor(width: number, height: number, depth: number): THREE.BufferGeometry | null {
    return this.structure.generateSciFiCorridor(width, height, depth);
  }

  generateSciFiHub(width: number, height: number, depth: number): THREE.BufferGeometry | null {
    return this.structure.generateSciFiHub(width, height, depth);
  }

  generateElevatorCabin(): THREE.BufferGeometry | null {
    return this.structure.generateElevatorCabin();
  }

  generateElevatorShaft(depth: number): THREE.BufferGeometry | null {
    return this.environment.generateElevatorShaft(depth);
  }
}
