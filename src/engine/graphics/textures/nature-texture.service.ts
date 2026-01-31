
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { TextureContextService } from './texture-context.service';
import { TextureWorkerService } from './texture-worker.service';

@Injectable({
  providedIn: 'root'
})
export class NatureTextureService {
  private ctxService = inject(TextureContextService);
  private worker = inject(TextureWorkerService);

  // Helper to wrap async worker result in a texture that updates later
  private createAsyncTexture(type: string, params: any, scale = 1, isData = false): THREE.Texture {
      // Create placeholder
      const placeholder = document.createElement('canvas');
      placeholder.width = 4; placeholder.height = 4;
      const tex = new THREE.CanvasTexture(placeholder);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(scale, scale);
      
      // Default to SRGB, but Data textures (normal/disp) should be Linear
      if (!isData) tex.colorSpace = THREE.SRGBColorSpace;
      else tex.colorSpace = THREE.LinearSRGBColorSpace;
      
      this.worker.generate(type, params).then(bitmap => {
          tex.image = bitmap;
          tex.needsUpdate = true;
      });
      
      return tex;
  }

  createNoiseTexture(colorHex: string, intensity: number, scale = 1): THREE.Texture {
    return this.createAsyncTexture('noise', { colorHex, intensity, size: 512 }, scale);
  }

  createBarkTexture(colorHex: string, intensity: number, scale = 1): THREE.Texture {
    return this.createAsyncTexture('bark', { colorHex, intensity, size: 512 }, scale);
  }

  createBarkNormal(scale = 1): THREE.Texture {
    return this.createAsyncTexture('bark-normal', { colorHex: '#808080', intensity: 60, size: 512 }, scale, true);
  }

  createRockTexture(colorHex: string, intensity: number, scale = 1): THREE.Texture {
    return this.createAsyncTexture('rock-detail', { colorHex, intensity, size: 512 }, scale);
  }

  createRockNormal(scale = 1): THREE.Texture {
    return this.createAsyncTexture('rock-normal', { colorHex: '#808080', intensity: 40, size: 512 }, scale, true);
  }

  createConcreteBase(scale = 1): THREE.Texture {
    return this.createAsyncTexture('concrete-base', { size: 1024 }, scale);
  }

  createConcreteDisplacement(scale = 1): THREE.Texture {
    return this.createAsyncTexture('concrete-height', { size: 1024 }, scale, true);
  }

  createConcreteNormal(scale = 1): THREE.Texture {
      return this.createAsyncTexture('concrete-normal', { size: 1024 }, scale, true);
  }

  createIceTexture(): THREE.Texture {
      const { canvas, ctx } = this.ctxService.getCanvas(512);
      ctx.fillStyle = '#a5bfd1';
      ctx.fillRect(0,0,512,512);
      ctx.strokeStyle = '#ffffff';
      ctx.globalAlpha = 0.3;
      for(let i=0; i<40; i++) {
          ctx.lineWidth = Math.random() * 2;
          ctx.beginPath();
          ctx.moveTo(Math.random()*512, Math.random()*512);
          ctx.lineTo(Math.random()*512, Math.random()*512);
          ctx.stroke();
      }
      return this.ctxService.finishTexture(canvas, 4);
  }

  createWaterNormal(scale = 1): THREE.Texture {
      const { canvas, ctx } = this.ctxService.getCanvas(512);
      const imageData = ctx.createImageData(512, 512);
      const data = imageData.data;
      for(let i = 0; i < data.length; i += 4) {
          const val = Math.random() * 255;
          data[i] = val; data[i+1] = val; data[i+2] = 255; data[i+3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);
      ctx.filter = 'blur(4px)';
      ctx.drawImage(canvas, 0, 0);
      ctx.filter = 'none';
      const tex = this.ctxService.finishTexture(canvas, scale);
      tex.colorSpace = THREE.LinearSRGBColorSpace;
      return tex;
  }
}
