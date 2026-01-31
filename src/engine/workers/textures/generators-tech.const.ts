
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
    }
`;
