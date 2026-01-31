
export const NOISE_FUNCTIONS = `
    // --- High-Performance Integer Hash (Squirrel3/Murmur Variant) ---
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
    
    function noise(x, z) {
        const floorX = Math.floor(x);
        const floorZ = Math.floor(z);
        const fractX = x - floorX;
        const fractZ = z - floorZ;
        
        // Quintic Interpolation
        const u = fractX * fractX * fractX * (fractX * (fractX * 6 - 15) + 10);
        const v = fractZ * fractZ * fractZ * (fractZ * (fractZ * 6 - 15) + 10);
        
        const n00 = hash(floorX + floorZ * 57.0);
        const n10 = hash(floorX + 1.0 + floorZ * 57.0);
        const n01 = hash(floorX + (floorZ + 1.0) * 57.0);
        const n11 = hash(floorX + 1.0 + (floorZ + 1.0) * 57.0);
        
        const x1 = n00 + u * (n10 - n00);
        const x2 = n01 + u * (n11 - n01);
        return x1 + v * (x2 - x1);
    }

    // Standard FBM
    function fbm(x, z, octaves) {
        let total = 0;
        let amplitude = 1.0;
        let frequency = 1.0;
        let maxValue = 0;
        for(let i = 0; i < octaves; i++) {
            total += noise(x * frequency, z * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= 0.5;
            frequency *= 2.0;
        }
        return total / maxValue;
    }

    // Ridged Multifractal Noise (Volcanic/Glacial peaks)
    function ridgedFbm(x, z, octaves) {
        let total = 0;
        let amplitude = 1.0;
        let frequency = 1.0;
        let weight = 1.0;
        let maxValue = 0;

        for(let i = 0; i < octaves; i++) {
            let n = noise(x * frequency, z * frequency);
            n = 1.0 - Math.abs(n); // Invert ridges
            n = n * n; // Sharpen
            n *= weight;
            weight = n; // Weight next octave by current (erosion simulation)
            
            total += n * amplitude;
            maxValue += amplitude;
            amplitude *= 0.5;
            frequency *= 2.0;
        }
        return total / maxValue;
    }

    // Domain Warping
    function warp(x, z) {
        const qx = ridgedFbm(x + 0.0, z + 0.0, 4);
        const qz = ridgedFbm(x + 5.2, z + 1.3, 4);

        const rx = ridgedFbm(x + 4.0 * qx + 1.7, z + 4.0 * qz + 9.2, 4);
        const rz = ridgedFbm(x + 4.0 * qx + 8.3, z + 4.0 * qz + 2.8, 4);

        return ridgedFbm(x + 4.0 * rx, z + 4.0 * rz, 4);
    }

    function duneNoise(x, z) {
        let nx = x * 0.02;
        let nz = z * 0.02;
        let n = noise(nx, nz);
        n = 1.0 - Math.abs(n);
        n = n * n; 
        const ripples = noise(x * 0.15, z * 0.15 + n * 2.0) * 0.05;
        return n * 12.0 + ripples; 
    }

    // --- Biome Logic (Self-Optimizing Protocol) ---
    // Returns mixture weights. [0] = Mountains, [1] = Plains
    function getBiome(x, z) {
        // Large scale noise for biome transitions (e.g. 500m)
        const scale = 0.002; 
        const val = noise(x * scale, z * scale);
        // Smoothstep for sharper transition
        const t = val * val * (3 - 2 * val); 
        return t; // 0 = Plains, 1 = Mountains
    }

    function getHeight(x, z, type) {
        if (type === 'dunes') {
            const distSq = x*x + z*z;
            const craterRadius = 45.0;
            const waterRadius = 25.0;
            let h = duneNoise(x, z);
            if (distSq < (craterRadius * craterRadius)) {
                const dist = Math.sqrt(distSq);
                let factor = Math.max(0, (dist - waterRadius) / (craterRadius - waterRadius));
                const ease = factor * factor * (3 - 2 * factor); 
                const targetH = -4.0;
                if (dist < waterRadius) {
                    h = targetH;
                } else {
                    h = (targetH * (1.0 - ease)) + (h * ease);
                }
            }
            return h;
        } else if (type === 'biome') {
            // Mixed Terrain Logic
            const mix = getBiome(x, z);
            
            // 1. Plains (Low FBM)
            const hPlains = fbm(x * 0.01, z * 0.01, 3) * 5.0;
            
            // 2. Mountains (Warped Ridges)
            const hMount = warp(x * 0.015, z * 0.015);
            const hMountScaled = (hMount - 0.5) * 2.0; 
            const hMountFinal = Math.sign(hMountScaled) * Math.pow(Math.abs(hMountScaled), 1.2) * 40;

            // Blend
            return (hPlains * (1.0 - mix)) + (hMountFinal * mix);

        } else {
            // Hard Realism: Glacial/Rocky (Standard)
            const scale = 0.015; // Slightly larger scale features
            const nx = x * scale;
            const nz = z * scale;
            
            // Domain Warped Ridged Noise
            let h = warp(nx, nz);
            
            // Nonlinear scaling for dramatic peaks
            h = (h - 0.5) * 2.0; // -1 to 1
            h = Math.sign(h) * Math.pow(Math.abs(h), 1.2); 
            
            h = h * 35; // Vertical Scale
            
            // Base noise for floor variation
            h += noise(x * 0.1, z * 0.1) * 0.5;
            
            return h;
        }
    }
`;
