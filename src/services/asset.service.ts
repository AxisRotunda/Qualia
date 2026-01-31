
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { MaterialService } from './material.service';
import { NatureGeneratorService } from './generators/nature-generator.service';
import { ArchitectureGeneratorService } from './generators/architecture-generator.service';
import { InteriorGeneratorService } from './generators/interior-generator.service';
import { SciFiGeneratorService } from './generators/scifi-generator.service';
import { ASSET_CONFIG } from '../config/asset.config';
import { GeneratorContext } from '../config/asset-types';

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  // Generators - Made public to allow scene scripts to access procedural logic directly
  public readonly natureGen = inject(NatureGeneratorService);
  public readonly archGen = inject(ArchitectureGeneratorService);
  public readonly interiorGen = inject(InteriorGeneratorService);
  public readonly scifiGen = inject(SciFiGeneratorService);
  
  private geometries = new Map<string, THREE.BufferGeometry>();

  // Context passed to configuration functions
  private get generatorContext(): GeneratorContext {
      return {
          nature: this.natureGen,
          arch: this.archGen,
          interior: this.interiorGen,
          scifi: this.scifiGen
      };
  }

  getGeometry(id: string): THREE.BufferGeometry {
    if (this.geometries.has(id)) {
        return this.geometries.get(id)!;
    }

    const config = ASSET_CONFIG[id];
    let geo: THREE.BufferGeometry | null = null;
    
    if (config) {
        geo = config.generator(this.generatorContext);
    }

    if (geo) {
        this.geometries.set(id, geo);
        return geo;
    }
    
    // Fallback for unknown assets
    return new THREE.BoxGeometry(1, 1, 1);
  }

  getAssetMaterials(assetId: string): string | string[] {
      const config = ASSET_CONFIG[assetId];
      if (config) {
          return config.materials;
      }
      return 'mat-default';
  }
}
