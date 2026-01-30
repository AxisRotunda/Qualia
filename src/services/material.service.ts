
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { TextureGeneratorService } from '../engine/graphics/texture-generator.service';
import { MATERIAL_DEFINITIONS } from '../config/material.config';
import { TEXTURE_DEFINITIONS } from '../config/texture.config';
import { createWaterMaterial } from '../engine/graphics/materials/water-material.factory';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  private texGen = inject(TextureGeneratorService);
  
  private materialRegistry = new Map<string, THREE.Material | THREE.Material[]>();
  private textures = new Map<string, THREE.Texture>();
  public texturesEnabled = false;

  constructor() {
    this.initMaterials();
  }

  // Lazy Texture Loader
  private getTexture(id: string): THREE.Texture | null {
    if (this.textures.has(id)) {
        return this.textures.get(id)!;
    }

    let tex: THREE.Texture | null = null;
    
    const generatorFn = TEXTURE_DEFINITIONS[id];
    if (generatorFn) {
        tex = generatorFn(this.texGen);
    }

    if (tex) {
        this.textures.set(id, tex);
    }
    return tex;
  }

  private initMaterials() {
    // 1. Load Data-Driven Materials
    MATERIAL_DEFINITIONS.forEach(def => {
        let mat: THREE.Material;
        if (def.type === 'physical') {
            mat = new THREE.MeshPhysicalMaterial(def.props);
        } else {
            mat = new THREE.MeshStandardMaterial(def.props);
        }
        
        if (def.mapId) {
            mat.userData['mapId'] = def.mapId;
        }
        this.materialRegistry.set(def.id, mat);
    });

    // 2. Load Complex/Custom Materials
    this.initCustomMaterials();
  }

  private initCustomMaterials() {
    // Ice & Snow - Physical
    this.materialRegistry.set('mat-ice', new THREE.MeshPhysicalMaterial({
        color: 0xa5bfd1,
        roughness: 0.15,
        metalness: 0.1,
        transmission: 0.4,
        thickness: 2.0,
        ior: 1.31,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
    }));

    // Water (Using Factory)
    // We lazily get the texture here
    const normalMap = this.getTexture('tex-water-normal');
    if (normalMap) {
        const waterMat = createWaterMaterial(normalMap);
        this.materialRegistry.set('mat-water', waterMat);
    }

    // Glass Alias
    const glass = this.materialRegistry.get('mat-glass') as THREE.MeshPhysicalMaterial;
    if (glass) this.materialRegistry.set('mat-window', glass.clone());

    // Interior Special
    const marble = this.materialRegistry.get('mat-marble');
    if (marble) (marble as any).userData['mapId'] = 'tex-marble';

    const woodPolish = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.3, metalness: 0.1 });
    woodPolish.userData['mapId'] = 'tex-wood-dark';
    this.materialRegistry.set('mat-wood-polish', woodPolish);

    // Screens
    const mScreen = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x22c55e, emissiveIntensity: 2.0, roughness: 0.2 });
    mScreen.userData['mapId'] = 'tex-screen-matrix';
    this.materialRegistry.set('mat-screen-matrix', mScreen);

    const mapScreen = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x38bdf8, emissiveIntensity: 2.0, roughness: 0.2 });
    mapScreen.userData['mapId'] = 'tex-screen-map';
    this.materialRegistry.set('mat-screen-map', mapScreen);

    const srvFace = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4, metalness: 0.8, emissive: 0xffffff, emissiveIntensity: 1.0 });
    srvFace.userData['mapId'] = 'tex-server-rack';
    this.materialRegistry.set('mat-server-face', srvFace);
  }

  setTexturesEnabled(enabled: boolean) {
      this.texturesEnabled = enabled;
      this.materialRegistry.forEach((mat, key) => {
          if (Array.isArray(mat)) {
              mat.forEach(m => this.applyTexture(m as THREE.MeshStandardMaterial, enabled));
          } else {
              if (key === 'mat-water') return;
              this.applyTexture(mat as THREE.MeshStandardMaterial, enabled);
          }
      });
  }

  private applyTexture(mat: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial, enabled: boolean) {
      const mapId = mat.userData['mapId'];
      if (mapId) {
          const tex = this.getTexture(mapId); // Lazy load if enabled
          if (!tex) return;

          if (mapId.includes('screen') || mapId.includes('server')) {
             mat.emissiveMap = enabled ? tex : null;
             mat.map = enabled ? tex : null;
             mat.emissiveIntensity = enabled ? 2.0 : 0.0;
          } else {
             mat.map = enabled ? tex : null;
          }
          mat.needsUpdate = true;
      }
  }

  getMaterial(id: string): THREE.Material | THREE.Material[] {
      return this.materialRegistry.get(id) || this.materialRegistry.get('mat-default')!;
  }

  hasMaterial(id: string): boolean {
    return this.materialRegistry.has(id);
  }

  setWireframeForAll(enabled: boolean) {
    this.materialRegistry.forEach(mat => {
        if (Array.isArray(mat)) {
            mat.forEach(m => (m as any).wireframe = enabled);
        } else {
            (mat as any).wireframe = enabled;
        }
    });
  }
}
