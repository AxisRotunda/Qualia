
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
  private materialService = inject(MaterialService);
  
  // Generators
  private natureGen = inject(NatureGeneratorService);
  private archGen = inject(ArchitectureGeneratorService);
  private interiorGen = inject(InteriorGeneratorService);
  private scifiGen = inject(SciFiGeneratorService);
  
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
    } else {
        // Fallback for primitive or unknown assets needed for basic shapes
        geo = new THREE.BoxGeometry(1, 1, 1);
    }

    if (geo) {
        this.geometries.set(id, geo);
        return geo;
    }
    
    return new THREE.BoxGeometry(1, 1, 1);
  }

  getMesh(assetId: string): THREE.Mesh {
      const geo = this.getGeometry(assetId);
      const config = ASSET_CONFIG[assetId];
      
      let mat: THREE.Material | THREE.Material[];

      if (config) {
          if (Array.isArray(config.materials)) {
              mat = config.materials.map(mId => this.materialService.getMaterial(mId) as THREE.Material);
          } else {
              mat = this.materialService.getMaterial(config.materials) as THREE.Material;
          }
      } else {
          // Fallback material
          mat = this.materialService.getMaterial('mat-default') as THREE.Material;
      }

      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
  }
}
