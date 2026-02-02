
export const TEXTURE_GEN_TECH = `
    function generateTech(ctx, type, params, size) {
        // --- HARD REALISM: Industrial Rust (Corrosion) ---
        if (type === 'industrial-rust') {
            // Dark base metal (Iron/Steel)
            ctx.fillStyle = '#2a1a0a'; 
            ctx.fillRect(0, 0, size, size);
            
            const imgData = ctx.getImageData(0, 0, size, size);
            const data = imgData.data;
            
            // Rust color palette
            // R: 180, G: 80, B: 20 (#b45014) - Oxidized Orange
            // Base: 42, 26, 10
            
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    const nx = x / size;
                    const ny = y / size;
                    
                    // 1. Corrosion Map (FBM)
                    // High frequency, medium persistence
                    const rustMask = fbm(nx, ny, 5, 4.0, 0.6);
                    
                    // 2. Deep Pitting (Worley)
                    // Creates small localized holes
                    const pit = worley(nx, ny, 12.0);
                    const pitMask = 1.0 - pit; // Invert so center is high
                    
                    const idx = (y * size + x) * 4;
                    
                    let r = 42; 
                    let g = 26;
                    let b = 10;
                    
                    // Rust accumulation
                    if (rustMask > 0.4) {
                        const rustDetail = fbm(nx, ny, 2, 20.0);
                        const intensity = (rustMask - 0.4) * 2.5; 
                        
                        r += intensity * (120 + rustDetail * 60);
                        g += intensity * (40 + rustDetail * 30);
                        b += intensity * (10 + rustDetail * 10);
                    }
                    
                    // Pitting Darkening
                    if (pitMask > 0.8) {
                        const depth = (pitMask - 0.8) * 5.0;
                        r *= (1.0 - depth * 0.5);
                        g *= (1.0 - depth * 0.5);
                        b *= (1.0 - depth * 0.5);
                    }
                    
                    // 3. Surface Grime
                    const grime = fbm(nx + 5.2, ny + 1.3, 3, 2.0);
                    const grimeFactor = 0.6 + (0.4 * grime);
                    
                    data[idx] = Math.min(255, r * grimeFactor);
                    data[idx+1] = Math.min(255, g * grimeFactor);
                    data[idx+2] = Math.min(255, b * grimeFactor);
                    data[idx+3] = 255;
                }
            }
            
            ctx.putImageData(imgData, 0, 0);
            return;
        }

        // --- HARD REALISM: Scratched Metal ---
        if (type === 'scratched-metal' || type === 'scratched-metal-normal') {
            const isNormal = type === 'scratched-metal-normal';
            ctx.fillStyle = isNormal ? '#808080' : '#b0b0b0';
            ctx.fillRect(0,0,size,size);

            ctx.globalCompositeOperation = isNormal ? 'source-over' : 'multiply';
            
            const numScratches = 4000;
            for(let i=0; i<numScratches; i++) {
                const x = Math.random() * size;
                const y = Math.random() * size;
                const len = 5 + Math.random() * 20;
                const angle = (Math.random() - 0.5) * 0.2; 
                
                ctx.strokeStyle = isNormal 
                    ? (Math.random() > 0.5 ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')
                    : 'rgba(50,50,50,0.05)';
                    
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + Math.cos(angle)*len, y + Math.sin(angle)*len);
                ctx.stroke();
            }

            if (isNormal) {
                const heightData = ctx.getImageData(0, 0, size, size);
                const normalData = new ImageData(generateNormalMap(heightData.data, size, 2.0), size, size);
                ctx.putImageData(normalData, 0, 0);
            }
            return;
        }

        // --- HARD REALISM: Robot Armor Plating (RUN_TEXTURE) ---
        if (type === 'robot-plate' || type === 'robot-plate-normal') {
            const isNormal = type === 'robot-plate-normal';
            ctx.fillStyle = isNormal ? '#808080' : '#2d3748'; // Dark Slate Base
            ctx.fillRect(0, 0, size, size);

            const panels = 4;
            const pSize = size / panels;
            const gap = 2;

            for(let py=0; py<panels; py++) {
                for(let px=0; px<panels; px++) {
                    const x = px * pSize;
                    const y = py * pSize;
                    const seed = px * 17 + py * 43;
                    
                    // 1. Panel Base
                    ctx.fillStyle = isNormal ? '#707070' : '#4a5568';
                    ctx.fillRect(x + gap, y + gap, pSize - gap*2, pSize - gap*2);

                    // 2. Markings (Albedo Only)
                    if (!isNormal) {
                        const h = hash(seed);
                        if (h > 0.8) {
                            // Hazard Stripes
                            ctx.fillStyle = '#ed8936'; // Orange
                            for(let i=0; i<5; i++) {
                                ctx.fillRect(x + 5 + i*8, y + 5, 4, 15);
                            }
                        } else if (h < 0.2) {
                            // Serial Number Text
                            ctx.fillStyle = 'rgba(255,255,255,0.4)';
                            ctx.font = 'bold 12px monospace';
                            ctx.fillText('SN-' + Math.floor(h*1000), x + 8, y + pSize - 10);
                        }
                        
                        // Ports / Servos (Circle detail)
                        if (hash(seed * 2) > 0.7) {
                            ctx.strokeStyle = 'rgba(0,0,0,0.3)';
                            ctx.lineWidth = 2;
                            ctx.beginPath();
                            ctx.arc(x + pSize/2, y + pSize/2, pSize/4, 0, Math.PI*2);
                            ctx.stroke();
                        }
                    } else {
                        // Normal Map Inset for Ports
                        if (hash(seed * 2) > 0.7) {
                             ctx.fillStyle = '#404040'; // Deep inset
                             ctx.beginPath();
                             ctx.arc(x + pSize/2, y + pSize/2, pSize/4, 0, Math.PI*2);
                             ctx.fill();
                        }
                    }
                }
            }

            // 3. Overall Surface Grain
            const imgData = ctx.getImageData(0, 0, size, size);
            applyNoise(imgData.data, isNormal ? 10 : 5);
            
            if (isNormal) {
                const normalData = new ImageData(generateNormalMap(imgData.data, size, 4.0), size, size);
                ctx.putImageData(normalData, 0, 0);
            } else {
                ctx.putImageData(imgData, 0, 0);
            }
            return;
        }

        // --- HARD REALISM: Knurled Grip Pattern (Weapon Handles) ---
        if (type === 'tech-grip' || type === 'tech-grip-normal') {
            const isNormal = type === 'tech-grip-normal';
            // Dark rubber/polymer base
            ctx.fillStyle = isNormal ? '#808080' : '#171717'; 
            ctx.fillRect(0, 0, size, size);

            const gridSize = 16; // Frequency of knurling
            
            // Draw diagonal cross-hatch
            ctx.strokeStyle = isNormal ? '#a0a0a0' : '#262626';
            ctx.lineWidth = size / gridSize / 3;
            ctx.lineCap = 'square';

            for (let i = -size; i < size * 2; i += size / gridSize) {
                // Diagonal 1
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i + size, size);
                ctx.stroke();
                
                // Diagonal 2
                ctx.beginPath();
                ctx.moveTo(i + size, 0);
                ctx.lineTo(i, size);
                ctx.stroke();
            }

            // Add noise for rubber grain
            const imgData = ctx.getImageData(0, 0, size, size);
            applyNoise(imgData.data, isNormal ? 15 : 20); // High noise for grip texture
            ctx.putImageData(imgData, 0, 0);

            if (isNormal) {
                // Strong normals for tactile feel
                const heightData = ctx.getImageData(0, 0, size, size);
                const normalData = new ImageData(generateNormalMap(heightData.data, size, 12.0), size, size);
                ctx.putImageData(normalData, 0, 0);
            }
            return;
        }

        // --- Screens & UI ---
        if (type === 'tech-screen-code') {
            const { baseHex, textHex } = params;
            ctx.fillStyle = baseHex;
            ctx.fillRect(0, 0, size, size);
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
            for(let i=0; i<size; i+=4) {
                ctx.fillRect(0, i, size, 2);
            }
            return;
        }

        if (type === 'tech-screen-map') {
            ctx.fillStyle = '#020617';
            ctx.fillRect(0, 0, size, size);
            ctx.strokeStyle = '#0ea5e9'; 
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.6;
            for(let i=0; i<5; i++) {
                ctx.beginPath();
                let x = Math.random() * size;
                let y = Math.random() * size;
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
            for(let i=0; i<=size; i+=step) {
                ctx.beginPath();
                ctx.moveTo(i, 0); ctx.lineTo(i, size);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, i); ctx.lineTo(size, i);
                ctx.stroke();
            }
            return;
        }

        // --- Infrastructure ---
        if (type === 'tech-server-rack') {
            ctx.fillStyle = '#1e293b'; 
            ctx.fillRect(0,0,size,size);
            const uHeight = size / 12; 
            for(let i=0; i<12; i++) {
                const y = i * uHeight;
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(10, y+2, size-20, uHeight-4);
                for(let j=0; j<8; j++) {
                    if (Math.random() > 0.4) {
                       const color = Math.random() > 0.7 ? '#ef4444' : '#22c55e';
                       ctx.fillStyle = color;
                       ctx.fillRect(40 + j*30, y + 15, 8, 8);
                    }
                }
                ctx.fillStyle = '#334155';
                for(let k=0; k<10; k++) {
                    ctx.fillRect(300, y + 10 + k*4, 180, 2);
                }
            }
            return;
        }

        if (type === 'tech-vent') {
            ctx.fillStyle = '#111827'; 
            ctx.fillRect(0,0,size,size);
            ctx.lineWidth = 16;
            ctx.strokeStyle = '#374151';
            ctx.strokeRect(0,0,size,size);
            ctx.fillStyle = '#1f2937';
            const slatCount = 10;
            const slatH = size / slatCount;
            const gap = 10;
            for(let i=0; i<slatCount; i++) {
                const y = i * slatH;
                const grad = ctx.createLinearGradient(0, y, 0, y + slatH);
                grad.addColorStop(0, '#374151');
                grad.addColorStop(0.5, '#4b5563');
                grad.addColorStop(1, '#1f2937');
                ctx.fillStyle = grad;
                ctx.fillRect(20, y + gap, size-40, slatH - gap*2);
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.fillRect(20, y + slatH - gap*2, size-40, gap);
            }
            return;
        }
    }
`;
