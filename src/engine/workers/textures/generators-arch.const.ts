
export const TEXTURE_GEN_ARCH = `
    function generateArch(ctx, type, params, size) {
        // --- Concrete (Enhanced Panelized with Hard Realism Weathering) ---
        if (type === 'concrete-base' || type === 'concrete-height') {
            const isHeight = type === 'concrete-height';
            
            // Baseline contrast adjustment for Metropolis
            ctx.fillStyle = isHeight ? '#808080' : '#8c8c8c'; 
            ctx.fillRect(0, 0, size, size);

            const panels = 4;
            const panelSize = size / panels;
            const gap = isHeight ? 3 : 2; 

            for(let py=0; py<panels; py++) {
                for(let px=0; px<panels; px++) {
                    const x = px * panelSize;
                    const y = py * panelSize;
                    
                    const panelSeed = px * 13 + py * 91;
                    const variance = (hash(panelSeed) - 0.5) * 25; // Increased variance
                    const baseVal = isHeight ? 128 : 155; 
                    const val = Math.max(0, Math.min(255, baseVal + variance));
                    
                    ctx.fillStyle = isHeight 
                        ? 'rgb('+val+','+val+','+val+')'
                        : 'rgb('+(val+5)+','+(val+4)+','+val+')';
                    
                    ctx.fillRect(x + gap, y + gap, panelSize - gap*2, panelSize - gap*2);

                    if (!isHeight) {
                        // 1. Edge Staining (Moisture accumulation at seams)
                        const edgeGrad = ctx.createLinearGradient(x, y, x, y + panelSize);
                        edgeGrad.addColorStop(0, 'rgba(0,0,0,0.15)'); // Increased depth
                        edgeGrad.addColorStop(0.1, 'rgba(0,0,0,0)');
                        edgeGrad.addColorStop(0.9, 'rgba(0,0,0,0)');
                        edgeGrad.addColorStop(1, 'rgba(0,0,0,0.15)');
                        ctx.fillStyle = edgeGrad;
                        ctx.fillRect(x + gap, y + gap, panelSize - gap*2, panelSize - gap*2);

                        // 2. Ambient Occlusion Holes (Formwork anchors)
                        ctx.fillStyle = 'rgba(0,0,0,0.22)';
                        const bSize = 6;
                        const bOff = 16;
                        [
                            [x+bOff, y+bOff], [x+panelSize-bOff-bSize, y+bOff],
                            [x+bOff, y+panelSize-bOff-bSize], [x+panelSize-bOff-bSize, y+panelSize-bOff-bSize]
                        ].forEach(p => {
                             ctx.beginPath();
                             ctx.arc(p[0], p[1], bSize/2, 0, Math.PI*2);
                             ctx.fill();
                        });
                    }
                }
            }

            const imgData = ctx.getImageData(0, 0, size, size);
            applyNoise(imgData.data, isHeight ? 10 : 12);
            ctx.putImageData(imgData, 0, 0);

            if (!isHeight) {
                // 3. Grime Streaks (RUN_TEXTURE contrast update)
                ctx.globalCompositeOperation = 'multiply';
                for(let i=0; i<25; i++) {
                    const lx = hash(i * 22.7) * size;
                    const ly = hash(i * 33.2) * size * 0.4;
                    const lh = 120 + hash(i * 11.1) * 300;
                    const lgrad = ctx.createLinearGradient(lx, ly, lx, ly + lh);
                    lgrad.addColorStop(0, 'rgba(40,35,30,0.4)');
                    lgrad.addColorStop(1, 'rgba(40,35,30,0)');
                    ctx.fillStyle = lgrad;
                    ctx.fillRect(lx - 1.5, ly, 3, lh);
                }
                
                ctx.globalCompositeOperation = 'source-over';
            }
            return;
        }

        if (type === 'concrete-normal') {
            ctx.fillStyle = '#808080';
            ctx.fillRect(0,0,size,size);
            
            const panels = 4;
            const panelSize = size / panels;
            const gap = 3;

            ctx.fillStyle = '#555555'; // Deeper normal insets
            for(let py=0; py<panels; py++) {
                for(let px=0; px<panels; px++) {
                    ctx.fillRect(px*panelSize + gap, py*panelSize + gap, panelSize - gap*2, panelSize - gap*2);
                }
            }

            const imgData = ctx.getImageData(0,0,size,size);
            const normalData = new ImageData(generateNormalMap(imgData.data, size, 8.0), size, size); // Boosted strength
            ctx.putImageData(normalData, 0, 0);
            return;
        }

        // --- Asphalt (Road Surface) ---
        if (type === 'asphalt' || type === 'asphalt-normal') {
            const isNormal = type === 'asphalt-normal';
            ctx.fillStyle = isNormal ? '#808080' : '#222222'; 
            ctx.fillRect(0, 0, size, size);
            
            const imgData = ctx.getImageData(0, 0, size, size);
            applyNoise(imgData.data, isNormal ? 55 : 30);
            
            const data = imgData.data;
            for(let i=0; i<data.length; i+=4) {
                const x = (i / 4) % size;
                const y = Math.floor((i / 4) / size);
                const patch = Math.sin(x * 0.02) * Math.cos(y * 0.03) + Math.sin(x * 0.05 + y * 0.05);
                if (patch > 1.2) {
                    data[i] *= 0.7; data[i+1] *= 0.7; data[i+2] *= 0.7;
                }
            }
            ctx.putImageData(imgData, 0, 0);

            if (isNormal) {
                const normalData = new ImageData(generateNormalMap(imgData.data, size, 8.0), size, size);
                ctx.putImageData(normalData, 0, 0);
            }
            return;
        }

        // --- City Windows ---
        if (type === 'city-window' || type === 'city-window-normal') {
            const { frameHex, glassHex, litHex, density } = params;
            const isNormal = type === 'city-window-normal';
            ctx.fillStyle = isNormal ? '#ffffff' : frameHex;
            ctx.fillRect(0, 0, size, size);
            
            const paneSize = size / density;
            const gap = paneSize * 0.12; 
            const seed = 1337; 

            for(let y=0; y<density; y++) {
                const rowHash = hash(y * 42.0 + seed);
                for(let x=0; x<density; x++) {
                    const px = x * paneSize + gap/2;
                    const py = y * paneSize + gap/2;
                    const w = paneSize - gap;
                    const h = paneSize - gap;
                    
                    if (isNormal) {
                        ctx.fillStyle = '#000000';
                        ctx.fillRect(px, py, w, h);
                    } else {
                        const cellHash = hash(x * 12.3 + y * 91.1 + seed);
                        const isLit = cellHash < (0.15 + (rowHash > 0.85 ? 0.3 : 0));
                        
                        if (isLit) {
                            ctx.fillStyle = litHex;
                            ctx.globalAlpha = 0.8;
                            ctx.fillRect(px, py, w, h);
                        } else {
                            ctx.fillStyle = glassHex; 
                            ctx.globalAlpha = 1.0;
                            ctx.fillRect(px, py, w, h);
                        }
                    }
                }
            }
            ctx.globalAlpha = 1.0;
            
            if (isNormal) {
                const imgData = ctx.getImageData(0, 0, size, size);
                const normalData = new ImageData(generateNormalMap(imgData.data, size, 12.0), size, size);
                ctx.putImageData(normalData, 0, 0);
            } else {
                ctx.globalCompositeOperation = 'multiply';
                const grad = ctx.createLinearGradient(0, 0, 0, size);
                grad.addColorStop(0.8, '#ffffff');
                grad.addColorStop(1, '#888888'); 
                ctx.fillStyle = grad;
                ctx.fillRect(0,0,size,size);
                ctx.globalCompositeOperation = 'source-over';
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
`;
