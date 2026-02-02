import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { MaterialService } from '../../../services/material.service';
import { AssetService } from '../../../services/asset.service';
import { VisualOptions } from '../visuals-factory.service';

@Injectable({
  providedIn: 'root'
})
export class MaterialResolverService {
  private materialService = inject(MaterialService);
  private assetService = inject(AssetService);

  resolveConfig(options: VisualOptions): string | string[] | undefined {
      if (options.materialId) return options.materialId;
      if (options.meshId) {
          return this.assetService.getAssetMaterials(options.meshId);
      }
      return undefined;
  }

  resolveInstance(options: VisualOptions): THREE.Material | THREE.Material[] {
      // 1. Explicit Override
      if (options.materialId && this.materialService.hasMaterial(options.materialId)) {
          return this.materialService.getMaterial(options.materialId)!;
      } 
      
      // 2. Asset Default (Mesh ID lookup)
      if (options.meshId) {
          const matDef = this.assetService.getAssetMaterials(options.meshId);
          if (Array.isArray(matDef)) {
              return matDef.map(id => this.materialService.getMaterial(id) as THREE.Material);
          } else {
              return this.materialService.getMaterial(matDef) as THREE.Material;
          }
      }

      // 3. Color Override (Primitive)
      if (options.color) {
          return new THREE.MeshStandardMaterial({ color: options.color, roughness: 0.5 });
      }

      // 4. Safe Fallback
      return this.materialService.getMaterial('mat-default')!;
  }
}
