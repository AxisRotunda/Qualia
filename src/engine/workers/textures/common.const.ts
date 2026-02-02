
export const TEXTURE_COMMON = `
    // --- High-Performance Integer Hash (Squirrel3/Murmur Variant) ---
    let _rngSeed = 12345;
    function setSeed(s) { _rngSeed = s; }
    
    // 1D Hash
    function hash(n) {
        let i = Math.floor(n);
        i = Math.imul(i, 0xB5297A4D);
        i ^= i >>> 8;
        i = Math.imul(i, 0x68E31DA4);
        i ^= i << 8;
        i = Math.imul(i, 0x1B56C4E9);
        i ^= i >>> 8;
        return (i >>> 0) / 4294967296.0;
    }

    // 2D Hash (Murmur3 Mix)
    function hash2(x, y) {
        let h = Math.imul(x | 0, 0xCC9E2D51);
        h = (h << 15) | (h >>> 17);
        h = Math.imul(h, 0x1B873593);
        h ^= Math.imul(y | 0, 0x85EBCA6B);
        h = (h << 13) | (h >>> 19);
        h = (Math.imul(h, 0x5) + 0xE6546B64) | 0;
        h ^= h >>> 16;
        h = Math.imul(h, 0x85EBCA6B);
        h ^= h >>> 13;
        h = Math.imul(h, 0xC2B2AE35);
        h ^= h >>> 16;
        return (h >>> 0) / 4294967296.0;
    }

    // Deterministic Random for procedural logic
    function rnd() {
        _rngSeed = (Math.imul(_rngSeed, 0x41C64E6D) + 12345) & 0x7FFFFFFF;
        return _rngSeed / 2147483648.0;
    }

    // --- Noise Generators ---

    // Value Noise 2D
    function noise(x, y) {
        const flX = Math.floor(x);
        const flY = Math.floor(y);
        const frX = x - flX;
        const frY = y - flY;
        
        // Quintic Interpolation
        const u = frX * frX * frX * (frX * (frX * 6 - 15) + 10);
        const v = frY * frY * frY * (frY * (frY * 6 - 15) + 10);
        
        const n00 = hash2(flX, flY);
        const n10 = hash2(flX + 1, flY);
        const n01 = hash2(flX, flY + 1);
        const n11 = hash2(flX + 1, flY + 1);
        
        const x1 = n00 + u * (n10 - n00);
        const x2 = n01 + u * (n11 - n01);
        return x1 + v * (x2 - x1);
    }

    // Fractal Brownian Motion
    function fbm(x, y, octaves, scale, persistence = 0.5) {
        let total = 0;
        let frequency = scale;
        let amplitude = 1;
        let maxValue = 0;
        for(let i=0; i<octaves; i++) {
            total += noise(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= 2;
        }
        return total / maxValue;
    }

    // Worley (Cellular) Noise
    function worley(x, y, scale) {
        const px = x * scale;
        const py = y * scale;
        const cellX = Math.floor(px);
        const cellY = Math.floor(py);
        
        let minDist = 1.0;
        
        for (let j = -1; j <= 1; j++) {
            for (let i = -1; i <= 1; i++) {
                const cx = cellX + i;
                const cy = cellY + j;
                
                // Jitter
                const rx = hash2(cx, cy);
                const ry = hash2(cx + 43.2, cy + 12.7);
                
                const ptX = cx + rx;
                const ptY = cy + ry;
                
                const dx = ptX - px;
                const dy = ptY - py;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist < minDist) {
                    minDist = dist;
                }
            }
        }
        return minDist;
    }

    // --- Utilities ---
    
    function smoothstep(min, max, value) {
      var x = Math.max(0, Math.min(1, (value-min)/(max-min)));
      return x*x*(3 - 2*x);
    }

    // Helper: Generate Normal Map from Height Data (Sharpened Sobel)
    function generateNormalMap(inputData, size, strength) {
        const output = new Uint8ClampedArray(inputData.length);
        const w = size;
        const h = size;
        
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const idx = (y * w + x) * 4;
                
                const x1 = (x > 0) ? x - 1 : w - 1;
                const x2 = (x < w - 1) ? x + 1 : 0;
                const y1 = (y > 0) ? y - 1 : h - 1;
                const y2 = (y < h - 1) ? y + 1 : 0;
                
                const hL = inputData[(y * w + x1) * 4];
                const hR = inputData[(y * w + x2) * 4];
                const hU = inputData[(y1 * w + x) * 4];
                const hD = inputData[(y2 * w + x) * 4];
                
                // Sobel kernel approximation for sharper gradients
                const dx = (hL - hR) * strength / 255.0;
                const dy = (hU - hD) * strength / 255.0;
                const dz = 1.0; 
                
                const len = Math.sqrt(dx*dx + dy*dy + dz*dz);
                
                output[idx] = ((dx / len) * 0.5 + 0.5) * 255;
                output[idx+1] = ((dy / len) * 0.5 + 0.5) * 255;
                output[idx+2] = ((dz / len) * 0.5 + 0.5) * 255;
                output[idx+3] = 255;
            }
        }
        return output;
    }

    function applyNoise(data, intensity) {
        for (let i = 0; i < data.length; i += 4) {
            const grain = (rnd() - 0.5) * intensity;
            data[i] = Math.min(255, Math.max(0, data[i] + grain));
            data[i+1] = Math.min(255, Math.max(0, data[i+1] + grain));
            data[i+2] = Math.min(255, Math.max(0, data[i+2] + grain));
        }
    }
`;
