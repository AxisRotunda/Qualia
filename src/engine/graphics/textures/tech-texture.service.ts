
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { TextureContextService } from './texture-context.service';
import { TextureWorkerService } from './texture-worker.service';

@Injectable({
  providedIn: 'root'
})
export class TechTextureService {
  private ctxService = inject(TextureContextService);
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
                const char = String.fromCharCode(0x30A0 + Math.random() * 96); 
                ctx.fillText(char, c * 18 + 10, r * 14 + 10);
            }
        }
    }
    
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
      
      ctx.strokeStyle = '#0ea5e9'; 
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      
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
      ctx.fillStyle = '#1e293b'; 
      ctx.fillRect(0,0,512,512);
      
      const uHeight = 512 / 12; 
      
      for(let i=0; i<12; i++) {
          const y = i * uHeight;
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(10, y+2, 492, uHeight-4);
          
          for(let j=0; j<8; j++) {
              if (Math.random() > 0.4) {
                 const color = Math.random() > 0.7 ? '#ef4444' : '#22c55e';
                 ctx.fillStyle = color;
                 ctx.shadowColor = color;
                 ctx.shadowBlur = 10;
                 ctx.fillRect(40 + j*30, y + 15, 8, 8);
                 ctx.shadowBlur = 0;
              }
          }
          
          ctx.fillStyle = '#334155';
          for(let k=0; k<10; k++) {
              ctx.fillRect(300, y + 10 + k*4, 180, 2);
          }
      }
      
      return this.ctxService.finishTexture(canvas, 1);
  }

  createIndustrialVent(scale = 1): THREE.Texture {
      const { canvas, ctx } = this.ctxService.getCanvas(512);
      
      // Background (Dark Metal)
      ctx.fillStyle = '#111827'; 
      ctx.fillRect(0,0,512,512);
      
      // Frame
      ctx.lineWidth = 16;
      ctx.strokeStyle = '#374151';
      ctx.strokeRect(0,0,512,512);
      
      // Slats
      ctx.fillStyle = '#1f2937';
      const slatCount = 10;
      const slatH = 512 / slatCount;
      const gap = 10;
      
      for(let i=0; i<slatCount; i++) {
          const y = i * slatH;
          // Slat Body
          const grad = ctx.createLinearGradient(0, y, 0, y + slatH);
          grad.addColorStop(0, '#374151');
          grad.addColorStop(0.5, '#4b5563');
          grad.addColorStop(1, '#1f2937');
          
          ctx.fillStyle = grad;
          ctx.fillRect(20, y + gap, 472, slatH - gap*2);
          
          // Shadow underneath
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.fillRect(20, y + slatH - gap*2, 472, gap);
      }
      
      return this.ctxService.finishTexture(canvas, scale);
  }

  // --- NEW: PBR Metal ---
  
  createScratchedMetal(scale = 1): THREE.Texture {
      return this.createAsyncTexture('scratched-metal', { size: 512 }, scale);
  }

  createScratchedMetalNormal(scale = 1): THREE.Texture {
      return this.createAsyncTexture('scratched-metal-normal', { size: 512 }, scale, true);
  }
}
