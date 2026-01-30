
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { TextureContextService } from './texture-context.service';

@Injectable({
  providedIn: 'root'
})
export class PatternTextureService {
  private ctxService = inject(TextureContextService);

  createGridTexture(bgHex: string, lineHex: string, segments = 8, scale = 1): THREE.Texture {
    const { canvas, ctx } = this.ctxService.getCanvas();
    const size = 512;
    const step = size / segments;

    ctx.fillStyle = bgHex;
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = lineHex;
    ctx.lineWidth = 2;

    ctx.beginPath();
    for (let i = 0; i <= segments; i++) {
        const p = i * step;
        ctx.moveTo(p, 0);
        ctx.lineTo(p, size);
        ctx.moveTo(0, p);
        ctx.lineTo(size, p);
    }
    ctx.stroke();

    return this.ctxService.finishTexture(canvas, scale);
  }

  createBrickTexture(brickHex: string, mortarHex: string, scale = 1): THREE.Texture {
     const { canvas, ctx } = this.ctxService.getCanvas();
     const size = 512;
     ctx.fillStyle = mortarHex;
     ctx.fillRect(0, 0, size, size);
     ctx.fillStyle = brickHex;
     const rows = 8;
     const cols = 4;
     const rowH = size / rows;
     const colW = size / cols;
     const gap = 6;

     for (let r = 0; r < rows; r++) {
         const offset = (r % 2) * (colW / 2);
         for (let c = -1; c < cols + 1; c++) {
             const x = c * colW + offset + gap;
             const y = r * rowH + gap;
             ctx.globalAlpha = 0.9 + Math.random() * 0.1;
             ctx.fillRect(x, y, colW - (gap*2), rowH - (gap*2));
         }
     }
     return this.ctxService.finishTexture(canvas, scale);
  }

  createMarbleTexture(baseHex: string, veinHex: string, scale = 1): THREE.Texture {
    const { canvas, ctx } = this.ctxService.getCanvas(1024);
    
    // Base
    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Foggy noise
    for(let i=0; i<1000; i++) {
        ctx.fillStyle = veinHex;
        ctx.globalAlpha = 0.05;
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        const r = 20 + Math.random() * 100;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI*2);
        ctx.fill();
    }

    // Sharp Veins
    ctx.strokeStyle = veinHex;
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 2;
    for(let i=0; i<15; i++) {
        ctx.beginPath();
        let x = Math.random() * 1024;
        let y = Math.random() * 1024;
        ctx.moveTo(x, y);
        for(let j=0; j<20; j++) {
            x += (Math.random()-0.5) * 200;
            y += (Math.random()-0.5) * 200;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    return this.ctxService.finishTexture(canvas, scale);
  }

  createCarpetTexture(colorHex: string, patternHex: string): THREE.Texture {
    const { canvas, ctx } = this.ctxService.getCanvas(512);
    
    // Base wool
    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, 512, 512);
    
    // Noise for fabric grain
    const imgData = ctx.getImageData(0,0,512,512);
    const data = imgData.data;
    for(let i=0; i<data.length; i+=4) {
        const noise = (Math.random()-0.5) * 30;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
        data[i+1] = Math.max(0, Math.min(255, data[i+1] + noise));
        data[i+2] = Math.max(0, Math.min(255, data[i+2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    // Simple Pattern
    ctx.fillStyle = patternHex;
    ctx.globalAlpha = 0.3;
    const size = 64;
    for(let x=0; x<512; x+=size) {
        for(let y=0; y<512; y+=size) {
            if ((x+y) % (size*2) === 0) {
                 ctx.fillRect(x+10, y+10, size-20, size-20);
            }
        }
    }

    return this.ctxService.finishTexture(canvas, 4);
  }
}
