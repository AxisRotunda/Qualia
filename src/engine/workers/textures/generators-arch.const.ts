
export const TEXTURE_GEN_ARCH = `
    function generateArch(ctx, type, params, size) {
        // --- Concrete (Enhanced Panelized) ---
        if (type === 'concrete-base' || type === 'concrete-height') {
            const isHeight = type === 'concrete-height';
            
            ctx.fillStyle = isHeight ? '#808080' : '#8c8c8c'; 
            ctx.fillRect(0, 0, size, size);

            const panels = 4;
            const panelSize = size / panels;
            const gap = isHeight ? 2 : 1;

            for(let py=0; py<panels; py++) {
                for(let px=0; px<panels; px++) {
                    const x = px * panelSize;
                    const y = py * panelSize;
                    const variance = (Math.random() - 0.5) * 20;
                    const baseVal = isHeight ? 128 : 120; 
                    const val = Math.max(0, Math.min(255, baseVal + variance));
                    
                    ctx.fillStyle = isHeight 
                        ? 'rgb('+val+','+val+','+val+')'
                        : 'rgb('+(val+10)+','+(val+8)+','+val+')';
                    
                    ctx.fillRect(x + gap, y + gap, panelSize - gap*2, panelSize - gap*2);
                }
            }

            const imgData = ctx.getImageData(0, 0, size, size);
            applyNoise(imgData.data, isHeight ? 15 : 20);
            ctx.putImageData(imgData, 0, 0);

            if (!isHeight) {
                ctx.globalCompositeOperation = 'multiply';
                const grad = ctx.createLinearGradient(0, 0, 0, size);
                grad.addColorStop(0, 'rgba(120,120,120,0.2)');
                grad.addColorStop(0.2, 'rgba(255,255,255,1)');
                grad.addColorStop(0.8, 'rgba(255,255,255,1)');
                grad.addColorStop(1, 'rgba(60,50,40,0.5)');
                ctx.fillStyle = grad;
                ctx.fillRect(0,0,size,size);
            }
            return;
        }

        if (type === 'concrete-normal') {
            ctx.fillStyle = '#808080';
            ctx.fillRect(0,0,size,size);
            
            const panels = 4;
            const panelSize = size / panels;
            const gap = 2;

            ctx.fillStyle = '#606060';
            for(let py=0; py<panels; py++) {
                for(let px=0; px<panels; px++) {
                    ctx.fillRect(px*panelSize + gap, py*panelSize + gap, panelSize - gap*2, panelSize - gap*2);
                }
            }

            const imgData = ctx.getImageData(0,0,size,size);
            applyNoise(imgData.data, 20);
            const normalData = new ImageData(generateNormalMap(imgData.data, size, 4.0), size, size);
            ctx.putImageData(normalData, 0, 0);
            return;
        }

        // --- City Windows (Deterministic Facade) ---
        if (type === 'city-window' || type === 'city-window-normal') {
            const { frameHex, glassHex, litHex, density } = params;
            const isNormal = type === 'city-window-normal';
            
            // 1. Background
            // Normal: High (Frame sticks out -> White)
            // Color: Frame Color (Dark Grey)
            ctx.fillStyle = isNormal ? '#ffffff' : frameHex;
            ctx.fillRect(0, 0, size, size);
            
            const paneSize = size / density;
            const gap = paneSize * 0.15; // Frame thickness
            
            // Deterministic Seed
            const seed = 1337; 

            for(let y=0; y<density; y++) {
                const rowHash = hash(y * 42.0 + seed);
                
                for(let x=0; x<density; x++) {
                    const px = x * paneSize + gap/2;
                    const py = y * paneSize + gap/2;
                    const w = paneSize - gap;
                    const h = paneSize - gap;
                    
                    if (isNormal) {
                        // Windows are recessed -> Black
                        ctx.fillStyle = '#000000';
                        ctx.fillRect(px, py, w, h);
                    } else {
                        // Albedo Logic
                        const cellHash = hash(x * 12.3 + y * 91.1 + seed);
                        
                        // Lit probability logic
                        const isLit = cellHash < (0.15 + (rowHash > 0.8 ? 0.5 : 0));
                        
                        if (isLit) {
                            ctx.fillStyle = litHex;
                            // Variation in light intensity
                            ctx.globalAlpha = 0.6 + hash(cellHash * 10) * 0.4;
                            ctx.fillRect(px, py, w, h);
                        } else {
                            ctx.fillStyle = glassHex;
                            ctx.globalAlpha = 1.0;
                            
                            // Fake reflection gradient (Horizon line)
                            const grad = ctx.createLinearGradient(px, py, px, py+h);
                            grad.addColorStop(0, glassHex);
                            grad.addColorStop(0.4, '#050505'); // Horizon reflection dark
                            grad.addColorStop(1, glassHex);
                            ctx.fillStyle = grad;
                            ctx.fillRect(px, py, w, h);
                        }
                    }
                }
            }
            ctx.globalAlpha = 1.0;
            
            // 2. Post-Processing
            if (isNormal) {
                // Convert Height (B&W) to Normal Map
                const imgData = ctx.getImageData(0, 0, size, size);
                // Strong edges for frames (Strength 8.0)
                const normalData = new ImageData(generateNormalMap(imgData.data, size, 8.0), size, size);
                ctx.putImageData(normalData, 0, 0);
            } else {
                // Albedo Noise & Grime
                const imgData = ctx.getImageData(0, 0, size, size);
                const data = imgData.data;
                for(let i=0; i<data.length; i+=4) {
                    const bright = data[i] + data[i+1] + data[i+2];
                    
                    // Only apply noise if pixel is dark (frame or unlit glass)
                    if (bright < 400) { 
                        const n = (hash(i) - 0.5) * 15;
                        data[i] = Math.max(0, Math.min(255, data[i] + n));
                        data[i+1] = Math.max(0, Math.min(255, data[i+1] + n));
                        data[i+2] = Math.max(0, Math.min(255, data[i+2] + n));
                    }
                }
                ctx.putImageData(imgData, 0, 0);
                
                // Vertical Grime Gradient
                ctx.globalCompositeOperation = 'multiply';
                const grad = ctx.createLinearGradient(0, 0, 0, size);
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.5, '#eeeeee');
                grad.addColorStop(1, '#aaaaaa');
                ctx.fillStyle = grad;
                ctx.fillRect(0,0,size,size);
            }
            return;
        }

        if (type === 'grid') {
            const { bgHex, lineHex, segments } = params;
            ctx.fillStyle = bgHex;
            ctx.fillRect(0, 0, size, size);
            ctx.strokeStyle = lineHex;
            ctx.lineWidth = Math.max(2, size / 256);
            const step = size / segments;
            ctx.beginPath();
            for (let i = 0; i <= segments; i++) {
                const p = i * step;
                ctx.moveTo(0, p); ctx.lineTo(size, p);
                ctx.moveTo(p, 0); ctx.lineTo(p, size);
            }
            ctx.stroke();
            return;
        }

        if (type === 'brick') {
            const { brickHex, mortarHex } = params;
            ctx.fillStyle = mortarHex;
            ctx.fillRect(0, 0, size, size);
            const rows = 16; const cols = 8;
            const rowH = size / rows; const colW = size / cols;
            const gap = size * 0.015;
            for (let r = 0; r < rows; r++) {
                 const offset = (r % 2) * (colW / 2);
                 for (let c = -1; c < cols + 1; c++) {
                     const x = c * colW + offset + gap;
                     const y = r * rowH + gap;
                     const w = colW - (gap*2);
                     const h = rowH - (gap*2);
                     ctx.fillStyle = brickHex;
                     ctx.globalAlpha = 0.9 + hash(r*c) * 0.1;
                     ctx.fillRect(x, y, w, h);
                 }
            }
            return;
        }

        if (type === 'marble') {
            const { baseHex, veinHex } = params;
            ctx.fillStyle = baseHex;
            ctx.fillRect(0, 0, size, size);
            for(let i=0; i<300; i++) {
                ctx.fillStyle = veinHex;
                ctx.globalAlpha = 0.05;
                const x = hash(i) * size;
                const y = hash(i*2) * size;
                const r = (20 + hash(i*3) * 100) * (size/1024);
                ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
            }
            return;
        }

        if (type === 'carpet') {
            const { colorHex, patternHex } = params;
            ctx.fillStyle = colorHex;
            ctx.fillRect(0, 0, size, size);
            const imgData = ctx.getImageData(0,0,size,size);
            applyNoise(imgData.data, 30);
            ctx.putImageData(imgData, 0, 0);
            ctx.fillStyle = patternHex;
            ctx.globalAlpha = 0.3;
            const patSize = size / 8;
            for(let x=0; x<size; x+=patSize) {
                for(let y=0; y<size; y+=patSize) {
                    if ((x+y) % (patSize*2) === 0) {
                         const pad = patSize * 0.15;
                         ctx.fillRect(x+pad, y+pad, patSize-pad*2, patSize-pad*2);
                    }
                }
            }
            return;
        }
    }
`