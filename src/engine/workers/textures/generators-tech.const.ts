
export const TEXTURE_GEN_TECH = `
    function generateTech(ctx, type, params, size) {
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
                const normalData = new ImageData(generateNormalMap(heightData.data, size, 2.0), size, size);
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
                        // Matrix-like characters
                        const char = String.fromCharCode(0x30A0 + Math.random() * 96); 
                        ctx.fillText(char, c * 18 + 10, r * 14 + 10);
                    }
                }
            }
            
            // Scanlines
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
            
            // Random Map Polygons
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

            // Grid Overlay
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
                // Dark slot background
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(10, y+2, size-20, uHeight-4);
                
                // Blink Lights
                for(let j=0; j<8; j++) {
                    if (Math.random() > 0.4) {
                       const color = Math.random() > 0.7 ? '#ef4444' : '#22c55e';
                       ctx.fillStyle = color;
                       ctx.fillRect(40 + j*30, y + 15, 8, 8);
                    }
                }
                
                // Vents
                ctx.fillStyle = '#334155';
                for(let k=0; k<10; k++) {
                    ctx.fillRect(300, y + 10 + k*4, 180, 2);
                }
            }
            return;
        }

        if (type === 'tech-vent') {
            // Background (Dark Metal)
            ctx.fillStyle = '#111827'; 
            ctx.fillRect(0,0,size,size);
            
            // Frame
            ctx.lineWidth = 16;
            ctx.strokeStyle = '#374151';
            ctx.strokeRect(0,0,size,size);
            
            // Slats
            ctx.fillStyle = '#1f2937';
            const slatCount = 10;
            const slatH = size / slatCount;
            const gap = 10;
            
            for(let i=0; i<slatCount; i++) {
                const y = i * slatH;
                // Slat Body with Gradient
                const grad = ctx.createLinearGradient(0, y, 0, y + slatH);
                grad.addColorStop(0, '#374151');
                grad.addColorStop(0.5, '#4b5563');
                grad.addColorStop(1, '#1f2937');
                
                ctx.fillStyle = grad;
                ctx.fillRect(20, y + gap, size-40, slatH - gap*2);
                
                // Shadow underneath
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.fillRect(20, y + slatH - gap*2, size-40, gap);
            }
            return;
        }
    }
`;
