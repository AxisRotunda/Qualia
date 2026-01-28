
import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  private materialRegistry = new Map<string, THREE.Material | THREE.Material[]>();
  private textures = new Map<string, THREE.Texture>();
  public texturesEnabled = false;

  constructor() {
    this.initTextures();
    this.initMaterials();
  }

  private generateProceduralTexture(baseColor: string, grainColor: string, scale: number = 4): THREE.Texture {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, size, size);
        const imgData = ctx.getImageData(0,0, size, size);
        const data = imgData.data;
        for(let i=0; i < data.length; i += 4) {
            const grain = (Math.random() - 0.5) * 40;
            data[i] = Math.min(255, Math.max(0, data[i] + grain));
            data[i+1] = Math.min(255, Math.max(0, data[i+1] + grain));
            data[i+2] = Math.min(255, Math.max(0, data[i+2] + grain));
        }
        ctx.putImageData(imgData, 0, 0);
    }
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(scale, scale);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  private initTextures() {
    this.textures.set('tex-concrete', this.generateProceduralTexture('#808080', '#505050'));
    this.textures.set('tex-ground', this.generateProceduralTexture('#2d3748', '#1a202c', 8));
    this.textures.set('tex-bark', this.generateProceduralTexture('#3f2e26', '#2b1d16', 2));
    this.textures.set('tex-leaf', this.generateProceduralTexture('#2f5c35', '#224a28', 2));
    this.textures.set('tex-rock', this.generateProceduralTexture('#64748b', '#475569', 1));
    this.textures.set('tex-snow', this.generateProceduralTexture('#f0f9ff', '#e0f2fe', 4));
  }

  private initMaterials() {
    const std = (col: number, rough: number, metal: number, mapId?: string) => {
        const m = new THREE.MeshStandardMaterial({ color: col, roughness: rough, metalness: metal });
        if (mapId) m.userData['mapId'] = mapId;
        return m;
    };

    this.materialRegistry.set('mat-concrete', std(0x808080, 0.8, 0.0, 'tex-concrete'));
    this.materialRegistry.set('mat-metal', std(0x94a3b8, 0.2, 1.0));
    this.materialRegistry.set('mat-road', std(0x333333, 0.7, 0.0, 'tex-concrete'));
    this.materialRegistry.set('mat-wood', std(0x8B4513, 0.6, 0.0, 'tex-bark'));
    this.materialRegistry.set('mat-forest', std(0x3d5a38, 0.9, 0.0, 'tex-leaf'));
    this.materialRegistry.set('mat-ice', std(0xe0f2fe, 0.05, 0.3, 'tex-snow'));
    this.materialRegistry.set('mat-glass', new THREE.MeshStandardMaterial({ 
      color: 0xa5f3fc, roughness: 0.05, metalness: 0.0, transparent: true, opacity: 0.6 
    }));
    this.materialRegistry.set('mat-hazard', std(0xfacc15, 0.6, 0.1));
    this.materialRegistry.set('mat-ground', std(0x1e293b, 0.9, 0.0, 'tex-ground'));
    this.materialRegistry.set('mat-bark', std(0x5c4033, 0.9, 0.0, 'tex-bark'));
    this.materialRegistry.set('mat-leaf', std(0x4ade80, 0.8, 0.0, 'tex-leaf'));
    this.materialRegistry.set('mat-rock', std(0x94a3b8, 0.9, 0.0, 'tex-rock'));
    this.materialRegistry.set('mat-default', std(0xffffff, 0.5, 0.0));
  }

  setTexturesEnabled(enabled: boolean) {
      this.texturesEnabled = enabled;
      this.materialRegistry.forEach(mat => {
          if (Array.isArray(mat)) {
              mat.forEach(m => this.applyTexture(m as THREE.MeshStandardMaterial, enabled));
          } else {
              this.applyTexture(mat as THREE.MeshStandardMaterial, enabled);
          }
      });
  }

  private applyTexture(mat: THREE.MeshStandardMaterial, enabled: boolean) {
      const mapId = mat.userData['mapId'];
      if (mapId && this.textures.has(mapId)) {
          mat.map = enabled ? this.textures.get(mapId)! : null;
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
