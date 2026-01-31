
export const TEXTURE_GEN_NATURE = `
    function generateNature(ctx, type, params, size) {
        const { colorHex, intensity } = params;

        if (type === 'noise') {
            ctx.fillStyle = colorHex;
            ctx.fillRect(0, 0, size, size);
            const imgData = ctx.getImageData(0, 0, size, size);
            applyNoise(imgData.data, intensity);
            ctx.putImageData(imgData, 0, 0);
            return;
        }

        if (type === 'bark' || type === 'bark-normal') {
            ctx.fillStyle = type === 'bark-normal' ? '#808080' : colorHex;
            ctx.fillRect(0, 0, size, size);
            
            const imgData = ctx.getImageData(0, 0, size, size);
            
            // Base Grain
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    const idx = (y * size + x) * 4;
                    const noiseVal = Math.random(); 
                    const grain = (noiseVal - 0.5) * intensity;
                    
                    const d = imgData.data;
                    d[idx] = Math.max(0, Math.min(255, d[idx] + grain));
                    d[idx+1] = Math.max(0, Math.min(255, d[idx+1] + grain));
                    d[idx+2] = Math.max(0, Math.min(255, d[idx+2] + grain));
                }
            }
            ctx.putImageData(imgData, 0, 0);
            
            // Vertical Striations
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
                const normalData = new ImageData(generateNormalMap(heightData.data, size, 4.0), size, size);
                ctx.putImageData(normalData, 0, 0);
            }
            return;
        }

        if (type === 'rock-detail' || type === 'rock-normal') {
            ctx.fillStyle = type === 'rock-normal' ? '#808080' : colorHex;
            ctx.fillRect(0, 0, size, size);
            
            const imgData = ctx.getImageData(0, 0, size, size);
            applyNoise(imgData.data, intensity);
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
                const color = 'rgba(' + val + ',' + val + ',' + val + ',';

                grd.addColorStop(0, color + alpha + ')');
                grd.addColorStop(1, color + '0)');
                
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI*2);
                ctx.fill();
            }

            if (type === 'rock-normal') {
                const heightData = ctx.getImageData(0, 0, size, size);
                const normalData = new ImageData(generateNormalMap(heightData.data, size, 5.0), size, size);
                ctx.putImageData(normalData, 0, 0);
            }
            return;
        }
    }
`;
