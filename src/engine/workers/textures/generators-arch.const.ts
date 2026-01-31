
export const TEXTURE_GEN_ARCH = `
    function generateArch(ctx, type, params, size) {
        // HARD REALISM: Concrete Generator
        if (type === 'concrete-base' || type === 'concrete-height') {
            const isHeight = type === 'concrete-height';
            // Base color
            ctx.fillStyle = isHeight ? '#808080' : '#888888';
            ctx.fillRect(0, 0, size, size);

            // 1. High Freq Noise (Sand)
            const imgData = ctx.getImageData(0, 0, size, size);
            const noiseScale = isHeight ? 40 : 25;
            
            // Inline noise calc for speed in this context
            const data = imgData.data;
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
            return;
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
            const normalData = new ImageData(generateNormalMap(heightData.data, size, 6.0), size, size);
            ctx.putImageData(normalData, 0, 0);
            return;
        }
    }
`;
