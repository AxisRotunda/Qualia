
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { TextureContextService } from './texture-context.service';

@Injectable({
  providedIn: 'root'
})
export class TechTextureService {
  private ctxService = inject(TextureContextService);

  createTechScreenCode(baseHex: string, textHex: string): THREE.Texture {
    const { canvas, ctx } = this.ctxService.getCanvas(512);
    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = textHex;
    ctx.font = '14px monospace';
    ctx.globalAlpha = 0.8;

    const columns = 30;
    const rows = 40;
    
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows; r++) {
            if (Math.random() > 0.3) {
                const char = String.fromCharCode(0x30A0 + Math.random() * 96); // Katakana or random
                ctx.fillText(char, c * 18 + 10, r * 14 + 10);
            }
        }
    }
    
    // Scanline effect
    ctx.fillStyle = '#000000';
    ctx.globalAlpha = 0.1;
    for(let i=0; i<512; i+=4) {
        ctx.fillRect(0, i, 512, 2);
    }

    return this.ctxService.finishTexture(canvas, 1);
  }

  createTechScreenMap(): THREE.Texture {
      const { canvas, ctx } = this.ctxService.getCanvas(512);
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, 512, 512);
      
      ctx.strokeStyle = '#0ea5e9'; // Cyan
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      
      // Random "Continents"
      for(let i=0; i<5; i++) {
          ctx.beginPath();
          let x = Math.random() * 512;
          let y = Math.random() * 512;
          ctx.moveTo(x,y);
          for(let j=0; j<10; j++) {
              x += (Math.random()-0.5)*150;
              y += (Math.random()-0.5)*150;
              ctx.lineTo(x,y);
          }
          ctx.closePath();
          ctx.stroke();
          ctx.fillStyle = '#0369a1';
          ctx.globalAlpha = 0.2;
          ctx.fill();
      }

      // Grid Overlay
      ctx.strokeStyle = '#38bdf8';
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 1;
      const step = 64;
      for(let i=0; i<=512; i+=step) {
          ctx.beginPath();
          ctx.moveTo(i, 0); ctx.lineTo(i, 512);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, i); ctx.lineTo(512, i);
          ctx.stroke();
      }

      return this.ctxService.finishTexture(canvas, 1);
  }

  createServerRackTexture(): THREE.Texture {
      const { canvas, ctx } = this.ctxService.getCanvas(512);
      ctx.fillStyle = '#1e293b'; // Dark grey case
      ctx.fillRect(0,0,512,512);
      
      // Units
      const uHeight = 512 / 12; // 12U rack
      
      for(let i=0; i<12; i++) {
          const y = i * uHeight;
          // Bezel
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(10, y+2, 492, uHeight-4);
          
          // Lights
          for(let j=0; j<8; j++) {
              if (Math.random() > 0.4) {
                 const color = Math.random() > 0.7 ? '#ef4444' : '#22c55e'; // Red or Green
                 ctx.fillStyle = color;
                 ctx.shadowColor = color;
                 ctx.shadowBlur = 10;
                 ctx.fillRect(40 + j*30, y + 15, 8, 8);
                 ctx.shadowBlur = 0;
              }
          }
          
          // Grates
          ctx.fillStyle = '#334155';
          for(let k=0; k<10; k++) {
              ctx.fillRect(300, y + 10 + k*4, 180, 2);
          }
      }
      
      return this.ctxService.finishTexture(canvas, 1);
  }
}
