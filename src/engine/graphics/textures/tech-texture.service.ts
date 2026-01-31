
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { TextureWorkerService } from './texture-worker.service';

@Injectable({
  providedIn: 'root'
})
export class TechTextureService {
  private worker = inject(TextureWorkerService);

  // Helper for async worker textures
  private createAsyncTexture(type: string, params: any, scale = 1, isData = false): THREE.Texture {
      const placeholder = document.createElement('canvas');
      placeholder.width = 4; placeholder.height = 4;
      const tex = new THREE.CanvasTexture(placeholder);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(scale, scale);
      tex.colorSpace = isData ? THREE.LinearSRGBColorSpace : THREE.SRGBColorSpace;
      
      this.worker.generate(type, params).then(bitmap => {
          tex.image = bitmap;
          tex.needsUpdate = true;
      });
      return tex;
  }

  createTechScreenCode(baseHex: string, textHex: string): THREE.Texture {
    return this.createAsyncTexture('tech-screen-code', { baseHex, textHex, size: 512 }, 1);
  }

  createTechScreenMap(): THREE.Texture {
    return this.createAsyncTexture('tech-screen-map', { size: 512 }, 1);
  }

  createServerRackTexture(): THREE.Texture {
    return this.createAsyncTexture('tech-server-rack', { size: 512 }, 1);
  }

  createIndustrialVent(scale = 1): THREE.Texture {
    return this.createAsyncTexture('tech-vent', { size: 512 }, scale);
  }

  // --- PBR Metal ---
  
  createScratchedMetal(scale = 1): THREE.Texture {
      return this.createAsyncTexture('scratched-metal', { size: 512 }, scale);
  }

  createScratchedMetalNormal(scale = 1): THREE.Texture {
      return this.createAsyncTexture('scratched-metal-normal', { size: 512 }, scale, true);
  }
}
