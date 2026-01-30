
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { TextureContextService } from './texture-context.service';

@Injectable({
  providedIn: 'root'
})
export class NatureTextureService {
  private ctxService = inject(TextureContextService);

  createNoiseTexture(colorHex: string, intensity: number, scale = 1): THREE.Texture {
    const { canvas, ctx } = this.ctxService.getCanvas();
    
    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, 512, 512);

    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const grain = (Math.random() - 0.5) * intensity;
      const grit = (Math.random() - 0.5) * (intensity * 0.8);
      let val = data[i] + grain + grit;
      data[i] = Math.min(255, Math.max(0, val));
      data[i+1] = Math.min(255, Math.max(0, val));
      data[i+2] = Math.min(255, Math.max(0, val));
    }
    
    ctx.putImageData(imgData, 0, 0);
    return this.ctxService.finishTexture(canvas, scale);
  }

  createIceTexture(): THREE.Texture {
      const { canvas, ctx } = this.ctxService.getCanvas(512);
      // Deep blue-white base
      ctx.fillStyle = '#a5bfd1';
      ctx.fillRect(0,0,512,512);
      
      // Fractures/Scratches
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
      
      // Create Perlin-ish noise for water waves
      const imageData = ctx.createImageData(512, 512);
      const data = imageData.data;
      
      for(let i = 0; i < data.length; i += 4) {
          const val = Math.random() * 255;
          data[i] = val;     // R
          data[i+1] = val;   // G
          data[i+2] = 255;   // B (Normal Z roughly up)
          data[i+3] = 255;   // A
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      // Blur to smooth out random noise into "waves"
      ctx.filter = 'blur(4px)';
      ctx.drawImage(canvas, 0, 0);
      ctx.filter = 'none';

      const tex = this.ctxService.finishTexture(canvas, scale);
      tex.colorSpace = THREE.LinearSRGBColorSpace; // Normal maps should be linear
      return tex;
  }
}
