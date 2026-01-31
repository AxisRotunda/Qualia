
export const TEXTURE_WORKER_SCRIPT = `
  self.onmessage = async function(e) {
    const { id, type, params } = e.data;
    
    try {
      const size = params.size || 512;
      const canvas = new OffscreenCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('No context');

      // Helper: Generate Normal Map from Height Data
      function generateNormalMap(inputData, strength) {
          const output = new Uint8ClampedArray(inputData.length);
          const w = size;
          const h = size;
          
          for (let y = 0; y < h; y++) {
              for (let x = 0; x < w; x++) {
                  const idx = (y * w + x) * 4;
                  
                  // Wrap coordinates
                  const x1 = (x > 0) ? x - 1 : w - 1;
                  const x2 = (x < w - 1) ? x + 1 : 0;
                  const y1 = (y > 0) ? y - 1 : h - 1;
                  const y2 = (y < h - 1) ? y + 1 : 0;
                  
                  // Sample height (using R channel)
                  const hL = inputData[(y * w + x1) * 4];
                  const hR = inputData[(y * w + x2) * 4];
                  const hU = inputData[(y1 * w + x) * 4];
                  const hD = inputData[(y2 * w + x) * 4];
                  
                  // Sobel Filter
                  const dx = (hL - hR) * strength / 255.0;
                  const dy = (hU - hD) * strength / 255.0;
                  const dz = 1.0;
                  
                  const len = Math.sqrt(dx*dx + dy*dy + dz*dz);
                  
                  // Pack to RGB [0, 255]
                  output[idx] = ((dx / len) * 0.5 + 0.5) * 255;
                  output[idx+1] = ((dy / len) * 0.5 + 0.5) * 255;
                  output[idx+2] = ((dz / len) * 0.5 + 0.5) * 255;
                  output[idx+3] = 255;
              }
          }
          return output;
      }

      // --- Generators ---
      
      if (type === 'noise') {
         const { colorHex, intensity } = params;
         ctx.fillStyle = colorHex;
         ctx.fillRect(0, 0, size, size);
         const imgData = ctx.getImageData(0, 0, size, size);
         const data = imgData.data;
         for (let i = 0; i < data.length; i += 4) {
            const grain = (Math.random() - 0.5) * intensity;
            data[i] = Math.min(255, Math.max(0, data[i] + grain));
            data[i+1] = Math.min(255, Math.max(0, data[i+1] + grain));
            data[i+2] = Math.min(255, Math.max(0, data[i+2] + grain));
         }
         ctx.putImageData(imgData, 0, 0);
      }

      if (type === 'bark' || type === 'bark-normal') {
         const { colorHex, intensity } = params;
         ctx.fillStyle = type === 'bark-normal' ? '#808080' : colorHex;
         ctx.fillRect(0, 0, size, size);
         
         const imgData = ctx.getImageData(0, 0, size, size);
         const data = imgData.data;
         
         for (let y = 0; y < size; y++) {
             for (let x = 0; x < size; x++) {
                 const idx = (y * size + x) * 4;
                 const noiseVal = Math.random(); 
                 const grain = (noiseVal - 0.5) * intensity;
                 
                 data[idx] = Math.max(0, Math.min(255, data[idx] + grain));
                 data[idx+1] = Math.max(0, Math.min(255, data[idx+1] + grain));
                 data[idx+2] = Math.max(0, Math.min(255, data[idx+2] + grain));
             }
         }
         ctx.putImageData(imgData, 0, 0);
         
         ctx.globalCompositeOperation = type === 'bark-normal' ? 'source-over' : 'multiply';
         ctx.strokeStyle = type === 'bark-normal' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.4)';
         ctx.lineWidth = 2;
         for(let i=0; i<25; i++) {
             ctx.beginPath();
             let x = Math.random() * size;
             let y = 0;
             ctx.moveTo(x, y);
             while(y < size) {
                 y += Math.random() * 20;
                 x += (Math.random() - 0.5) * 6;
                 ctx.lineTo(x, y);
             }
             ctx.stroke();
         }

         if (type === 'bark-normal') {
             const heightData = ctx.getImageData(0, 0, size, size);
             const normalData = new ImageData(generateNormalMap(heightData.data, 4.0), size, size);
             ctx.putImageData(normalData, 0, 0);
         }
      }

      if (type === 'rock-detail' || type === 'rock-normal') {
         const { colorHex, intensity } = params;
         ctx.fillStyle = type === 'rock-normal' ? '#808080' : colorHex;
         ctx.fillRect(0, 0, size, size);
         
         const imgData = ctx.getImageData(0, 0, size, size);
         const data = imgData.data;
         
         for (let i = 0; i < data.length; i += 4) {
            const grain = (Math.random() - 0.5) * intensity;
            data[i] = Math.max(0, Math.min(255, data[i] + grain));
            data[i+1] = Math.max(0, Math.min(255, data[i+1] + grain));
            data[i+2] = Math.max(0, Math.min(255, data[i+2] + grain));
         }
         ctx.putImageData(imgData, 0, 0);
         
         ctx.globalCompositeOperation = 'overlay';
         const spots = 15;
         for(let i=0; i<spots; i++) {
             const x = Math.random() * size;
             const y = Math.random() * size;
             const r = 40 + Math.random() * 80;
             const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
             
             const alpha = type === 'rock-normal' ? 0.2 : 0.3;
             const val = Math.random() > 0.5 ? 0 : 255; 
             const color = \`rgba(\${val},\${val},\${val},\`;

             grd.addColorStop(0, color + alpha + ')');
             grd.addColorStop(1, color + '0)');
             
             ctx.fillStyle = grd;
             ctx.beginPath();
             ctx.arc(x, y, r, 0, Math.PI*2);
             ctx.fill();
         }

         if (type === 'rock-normal') {
             const heightData = ctx.getImageData(0, 0, size, size);
             const normalData = new ImageData(generateNormalMap(heightData.data, 5.0), size, size);
             ctx.putImageData(normalData, 0, 0);
         }
      }
      
      // HARD REALISM: Concrete Generator
      if (type === 'concrete-base' || type === 'concrete-height') {
         const isHeight = type === 'concrete-height';
         // Base color
         ctx.fillStyle = isHeight ? '#808080' : '#888888';
         ctx.fillRect(0, 0, size, size);

         // 1. High Freq Noise (Sand)
         const imgData = ctx.getImageData(0, 0, size, size);
         const data = imgData.data;
         const noiseScale = isHeight ? 40 : 25;
         
         for (let i = 0; i < data.length; i += 4) {
             const n = (Math.random() - 0.5) * noiseScale;
             data[i] = Math.max(0, Math.min(255, data[i] + n));
             data[i+1] = Math.max(0, Math.min(255, data[i+1] + n));
             data[i+2] = Math.max(0, Math.min(255, data[i+2] + n));
         }
         ctx.putImageData(imgData, 0, 0);

         // 2. Weathering / Stains (Low Freq blobs)
         ctx.globalCompositeOperation = 'multiply';
         for(let i=0; i<8; i++) {
             const x = Math.random() * size;
             const y = Math.random() * size;
             const r = 50 + Math.random() * 150;
             const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
             grd.addColorStop(0, 'rgba(100,100,100,0.3)'); // Darker center
             grd.addColorStop(1, 'rgba(128,128,128,0)');
             ctx.fillStyle = grd;
             ctx.beginPath();
             ctx.arc(x,y,r,0,Math.PI*2);
             ctx.fill();
         }

         // 3. Cracks/Imperfections (Composite)
         ctx.globalCompositeOperation = isHeight ? 'source-over' : 'multiply';
         ctx.strokeStyle = isHeight ? 'rgba(30,30,30,0.5)' : 'rgba(50,50,50,0.2)';
         ctx.lineWidth = 1;
         
         for(let i=0; i<15; i++) {
             ctx.beginPath();
             let x = Math.random() * size;
             let y = Math.random() * size;
             ctx.moveTo(x, y);
             for(let j=0; j<5; j++) {
                x += (Math.random()-0.5) * 40;
                y += (Math.random()-0.5) * 40;
                ctx.lineTo(x, y);
             }
             ctx.stroke();
         }
      }

      // HARD REALISM: Concrete Normal Map (Derived from Height logic)
      if (type === 'concrete-normal') {
          // Generate temporary height map internally
          ctx.fillStyle = '#808080';
          ctx.fillRect(0,0,size,size);
          
          // Noise
          const imageData = ctx.getImageData(0,0,size,size);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
              const noise = (Math.random() - 0.5) * 40;
              data[i] = 128 + noise;
              data[i+1] = 128 + noise;
              data[i+2] = 128 + noise;
              data[i+3] = 255;
          }
          ctx.putImageData(imageData, 0, 0);

          // Cracks (Darker = deeper)
          ctx.strokeStyle = 'rgba(50,50,50,0.8)';
          ctx.lineWidth = 2;
          for(let i=0; i<15; i++) {
              ctx.beginPath();
              let x = Math.random() * size;
              let y = Math.random() * size;
              ctx.moveTo(x, y);
              for(let j=0; j<5; j++) {
                 x += (Math.random()-0.5) * 40;
                 y += (Math.random()-0.5) * 40;
                 ctx.lineTo(x, y);
              }
              ctx.stroke();
          }

          const heightData = ctx.getImageData(0, 0, size, size);
          const normalData = new ImageData(generateNormalMap(heightData.data, 6.0), size, size);
          ctx.putImageData(normalData, 0, 0);
      }

      // HARD REALISM: Scratched Metal
      if (type === 'scratched-metal' || type === 'scratched-metal-normal') {
          const isNormal = type === 'scratched-metal-normal';
          ctx.fillStyle = isNormal ? '#808080' : '#b0b0b0';
          ctx.fillRect(0,0,size,size);

          ctx.globalCompositeOperation = isNormal ? 'source-over' : 'multiply';
          
          // Micro-scratches (Anisotropic direction)
          const numScratches = 4000;
          
          for(let i=0; i<numScratches; i++) {
              const x = Math.random() * size;
              const y = Math.random() * size;
              const len = 5 + Math.random() * 20;
              
              // Bias horizontal for "brushed" look
              const angle = (Math.random() - 0.5) * 0.2; 
              
              ctx.strokeStyle = isNormal 
                  ? (Math.random() > 0.5 ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)') // Peaks and valleys for normal
                  : 'rgba(50,50,50,0.05)'; // Dark scratches for albedo
                  
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(x + Math.cos(angle)*len, y + Math.sin(angle)*len);
              ctx.stroke();
          }
          
          // Deep gouges
          const numGouges = 20;
          ctx.lineWidth = 2;
          for(let i=0; i<numGouges; i++) {
              const x = Math.random() * size;
              const y = Math.random() * size;
              const angle = Math.random() * Math.PI * 2; // Random direction
              const len = 10 + Math.random() * 30;
              
              ctx.strokeStyle = isNormal ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.2)';
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(x + Math.cos(angle)*len, y + Math.sin(angle)*len);
              ctx.stroke();
          }

          if (isNormal) {
              const heightData = ctx.getImageData(0, 0, size, size);
              // Low strength for micro-scratches to keep surface mostly flat
              const normalData = new ImageData(generateNormalMap(heightData.data, 2.0), size, size);
              ctx.putImageData(normalData, 0, 0);
          }
      }

      const bitmap = await canvas.transferToImageBitmap();
      self.postMessage({ id, bitmap }, [bitmap]);

    } catch (err) {
      console.error(err);
      const empty = new OffscreenCanvas(1,1).transferToImageBitmap();
      self.postMessage({ id, bitmap: empty }, [empty]);
    }
  };
`
