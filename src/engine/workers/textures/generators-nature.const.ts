
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
                    const noiseVal = rnd(); 
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
                let x = rnd() * size;
                let y = 0;
                ctx.moveTo(x, y);
                while(y < size) {
                    y += rnd() * 20;
                    x += (rnd() - 0.5) * 6;
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
                const x = rnd() * size;
                const y = rnd() * size;
                const r = 40 + rnd() * 80;
                const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
                
                const alpha = type === 'rock-normal' ? 0.2 : 0.3;
                const val = rnd() > 0.5 ? 0 : 255; 
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

        // --- REALISTIC ICE SYNTHESIS ---
        if (type === 'ice' || type === 'ice-normal') {
            const isNormal = type === 'ice-normal';
            // Base Color: Very pale blue/white for albedo, Mid-gray for height
            ctx.fillStyle = isNormal ? '#808080' : '#dbeeff'; 
            ctx.fillRect(0, 0, size, size);
            
            const imgData = ctx.getImageData(0, 0, size, size);
            const data = imgData.data;

            // Generate Procedural Ice
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    const nx = x / size;
                    const ny = y / size;
                    const idx = (y * size + x) * 4;

                    // 1. Deep Cracks (Worley Noise)
                    // Inverted Worley creates sharp ridges that look like fractures
                    const crackScale = 8.0;
                    const w1 = worley(nx, ny, crackScale);
                    const w2 = worley(nx + 0.5, ny + 0.5, crackScale * 2.0); // Detail cracks
                    
                    // Combine and sharpen
                    let fracture = (w1 * 0.7 + w2 * 0.3);
                    fracture = Math.pow(fracture, 0.5); // Soften the gradient
                    fracture = 1.0 - fracture; // Invert so edges are dark/deep
                    
                    // 2. Surface Frost (FBM)
                    // High frequency noise for roughness
                    const frost = fbm(nx, ny, 4, 12.0, 0.5);
                    
                    if (!isNormal) {
                        // Albedo Logic
                        // Cracks are brighter (subsurface scattering simulation) or darker depending on depth
                        // Frost adds whiteness
                        
                        let r = 219, g = 238, b = 255; // Base #dbeeff
                        
                        // Apply Frost
                        const frostMix = smoothstep(0.4, 0.8, frost);
                        r += frostMix * 30; g += frostMix * 15; b += frostMix * 0; // Whiter
                        
                        // Apply Cracks (Darker blue/teal veins)
                        const crackMix = smoothstep(0.85, 1.0, fracture);
                        r -= crackMix * 40; g -= crackMix * 20; b += crackMix * 10;

                        data[idx] = Math.min(255, Math.max(0, r));
                        data[idx+1] = Math.min(255, Math.max(0, g));
                        data[idx+2] = Math.min(255, Math.max(0, b));
                        data[idx+3] = 255;
                    } else {
                        // Height Map Logic for Normal Generation
                        // Cracks are deep (low value), Frost is high (high value)
                        let h = 128;
                        
                        // Cracks dig in
                        h -= smoothstep(0.8, 1.0, fracture) * 60;
                        
                        // Frost builds up
                        h += (frost - 0.5) * 20;
                        
                        data[idx] = h; data[idx+1] = h; data[idx+2] = h; data[idx+3] = 255;
                    }
                }
            }
            
            ctx.putImageData(imgData, 0, 0);

            // Generate Normal Map from the Height Data we just created
            if (isNormal) {
                const normalData = new ImageData(generateNormalMap(data, size, 6.0), size, size);
                ctx.putImageData(normalData, 0, 0);
            }
            return;
        }

        if (type === 'water-normal') {
            const imgData = ctx.createImageData(size, size);
            const data = imgData.data;
            for(let i = 0; i < data.length; i += 4) {
                const val = rnd() * 255;
                data[i] = val; data[i+1] = val; data[i+2] = 255; data[i+3] = 255;
            }
            ctx.putImageData(imgData, 0, 0);
            const normalData = new ImageData(generateNormalMap(data, size, 2.0), size, size);
            ctx.putImageData(normalData, 0, 0);
            return;
        }

        if (type === 'micro-normal') {
            ctx.fillStyle = '#808080';
            ctx.fillRect(0, 0, size, size);
            const imgData = ctx.getImageData(0, 0, size, size);
            const data = imgData.data;
            // Structured high-frequency noise for industrial surface tooth
            for(let y = 0; y < size; y++) {
                for(let x = 0; x < size; x++) {
                    const idx = (y * size + x) * 4;
                    const val = fbm(x/size, y/size, 4, 45.0, 0.5) * 255;
                    data[idx] = val; data[idx+1] = val; data[idx+2] = 255; data[idx+3] = 255;
                }
            }
            ctx.putImageData(imgData, 0, 0);
            // Low strength normal perturbation for hardware filtering safety
            const normalData = new ImageData(generateNormalMap(data, size, 1.5), size, size);
            ctx.putImageData(normalData, 0, 0);
            return;
        }
    }
`;
