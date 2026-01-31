
export const TEXTURE_COMMON = `
    // Helper: Generate Normal Map from Height Data (Sobel Filter)
    function generateNormalMap(inputData, size, strength) {
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

    // Helper: Simple Noise overlay
    function applyNoise(data, intensity) {
        for (let i = 0; i < data.length; i += 4) {
            const grain = (Math.random() - 0.5) * intensity;
            data[i] = Math.min(255, Math.max(0, data[i] + grain));
            data[i+1] = Math.min(255, Math.max(0, data[i+1] + grain));
            data[i+2] = Math.min(255, Math.max(0, data[i+2] + grain));
        }
    }
`;
