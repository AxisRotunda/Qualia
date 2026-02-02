
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { TextureGeneratorService } from '../engine/graphics/texture-generator.service';
import { EnvironmentManagerService } from '../engine/graphics/environment-manager.service';
import { MATERIAL_DEFINITIONS } from '../config/material.config';
import { TEXTURE_DEFINITIONS } from '../config/texture.config';
import { registerCustomMaterials } from '../engine/graphics/materials/custom-material.registry';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  private texGen = inject(TextureGeneratorService);
  private envManager = inject(EnvironmentManagerService);
  
  private materialRegistry = new Map<string, THREE.Material | THREE.Material[]>();
  private textures = new Map<string, THREE.Texture>();
  public texturesEnabled = false;

  constructor() {
    this.initMaterials();
  }

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
    MATERIAL_DEFINITIONS.forEach(def => {
        let mat: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial;
        
        if (def.type === 'physical') {
            mat = new THREE.MeshPhysicalMaterial(def.props);
        } else {
            mat = new THREE.MeshStandardMaterial(def.props);
        }
        
        if (def.userData) {
            Object.assign(mat.userData, def.userData);
        }

        if (def.mapId) mat.userData['mapId'] = def.mapId;
        if (def.normalMapId) mat.userData['normalMapId'] = def.normalMapId;
        if (def.displacementMapId) mat.userData['displacementMapId'] = def.displacementMapId;
        
        // Default target is map/emissiveMap
        if (!mat.userData['textureTarget']) {
            mat.userData['textureTarget'] = 'diffuse'; // 'diffuse' or 'emissive'
        }

        // Cache displacement scale
        if (def.props && def.props.displacementScale !== undefined) {
            mat.userData['displacementScale'] = def.props.displacementScale;
        }
        
        // Explicitly set special case for ground if config missing (backward compat)
        if (def.id === 'mat-ground' && !def.normalMapId) {
            mat.userData['normalMapId'] = 'tex-concrete-normal';
        }

        this.materialRegistry.set(def.id, mat);
    });

    // RUN_SHADER: Pass fog uniforms to allow volumetric height fog injection
    registerCustomMaterials(
        this.materialRegistry, 
        (id) => this.getTexture(id),
        this.envManager.heightFogUniforms
    );
  }

  setTexturesEnabled(enabled: boolean) {
      this.texturesEnabled = enabled;
      this.materialRegistry.forEach((mat, key) => {
          if (Array.isArray(mat)) {
              mat.forEach(m => this.applyTexture(m as THREE.MeshStandardMaterial, enabled));
          } else {
              if (key === 'mat-water') return; // Handled by scene loop
              this.applyTexture(mat as THREE.MeshStandardMaterial, enabled);
          }
      });
  }

  private applyTexture(mat: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial, enabled: boolean) {
      const mapId = mat.userData['mapId'];
      const normalMapId = mat.userData['normalMapId'];
      const dispMapId = mat.userData['displacementMapId'];
      const target = mat.userData['textureTarget'] || 'diffuse';

      if (mapId) {
          const tex = this.getTexture(mapId); 
          if (tex) {
              if (target === 'emissive') {
                 if (enabled) {
                     mat.emissiveMap = tex;
                     mat.map = tex; 
                     mat.emissive.setHex(0xffffff); // Enable tint so texture shows
                     mat.emissiveIntensity = 2.0;
                 } else {
                     mat.emissiveMap = null;
                     mat.map = null;
                     mat.emissive.setHex(0x000000); // Disable tint to prevent whiteout
                     mat.emissiveIntensity = 0.0;
                 }
              } else {
                 mat.map = enabled ? tex : null;
              }
          }
      }
      
      if (normalMapId) {
          const normTex = this.getTexture(normalMapId);
          if (normTex) {
              mat.normalMap = enabled ? normTex : null;
              mat.normalScale.set(1, 1);
          }
      }

      if (dispMapId) {
          const dispTex = this.getTexture(dispMapId);
          if (dispTex) {
              mat.displacementMap = enabled ? dispTex : null;
              mat.displacementScale = enabled ? (mat.userData['displacementScale'] ?? 0.1) : 0;
          }
      }

      mat.needsUpdate = true;
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
