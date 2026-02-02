
export const NOISE_FUNCTIONS = `
    // --- Optimized Bitwise Hash (Murmur3 Variant) ---
    // RUN_OPT: Replaced sine-based hashing with integer permutations for high-frequency terrain loops.
    function hash(x, z) {
        let h = (Math.imul(x, 0xCC9E2D51) | 0);
        h = (h << 15) | (h >>> 17);
        h = (Math.imul(h, 0x1B873593) | 0);
        h ^= (Math.imul(z, 0x85EBCA6B) | 0);
        h = (h << 13) | (h >>> 19);
        h = (Math.imul(h, 0x5) + 0xE6546B64) | 0;
        h ^= h >>> 16;
        h = (Math.imul(h, 0x85EBCA6B) | 0);
        h ^= h >>> 13;
        h = (Math.imul(h, 0xC2B2AE35) | 0);
        h ^= h >>> 16;
        return (h >>> 0) / 4294967296.0;
    }
    
    function noise(x, z) {
        const floorX = Math.floor(x);
        const floorZ = Math.floor(z);
        const fractX = x - floorX;
        const fractZ = z - floorZ;
        
        // Quintic Interpolation (C2 Continuity)
        const u = fractX * fractX * fractX * (fractX * (fractX * 6 - 15) + 10);
        const v = fractZ * fractZ * fractZ * (fractZ * (fractZ * 6 - 15) + 10);
        
        const n00 = hash(floorX, floorZ);
        const n10 = hash(floorX + 1, floorZ);
        const n01 = hash(floorX, floorZ + 1);
        const n11 = hash(floorX + 1, floorZ + 1);
        
        const x1 = n00 + u * (n10 - n00);
        const x2 = n01 + u * (n11 - n01);
        return x1 + v * (x2 - x1);
    }

    function ridgedFbm(x, z, octaves) {
        let total = 0;
        let amplitude = 1.0;
        let frequency = 1.0;
        let weight = 1.0;
        let maxValue = 0;

        for(let i = 0; i < octaves; i++) {
            let n = noise(x * frequency, z * frequency);
            n = 1.0 - Math.abs(n * 2.0 - 1.0); 
            n = n * n * weight;
            weight = Math.max(0.0, Math.min(1.0, n * 2.0));
            
            total += n * amplitude;
            maxValue += amplitude;
            amplitude *= 0.5;
            frequency *= 2.0;
        }
        // Division-by-zero safeguard
        return maxValue > 0 ? total / maxValue : 0;
    }

    function warp(x, z) {
        const qx = ridgedFbm(x, z, 4);
        const qz = ridgedFbm(x + 5.2, z + 1.3, 4);
        return ridgedFbm(x + 4.0 * qx, z + 4.0 * qz, 4);
    }

    function smoothstep(edge0, edge1, x) {
        const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
        return t * t * (3 - 2 * t);
    }

    function mix(x, y, a) {
        return x * (1 - a) + y * a;
    }

    function getHeight(x, z, type) {
        if (type === 'dunes') {
            const nx = x * 0.02;
            const nz = z * 0.02;
            let n = noise(nx, nz);
            n = 1.0 - Math.abs(n * 2.0 - 1.0);
            return n * n * 12.0 + noise(x * 0.15, z * 0.15) * 0.2;
        } else if (type === 'islands') {
            // --- RIGID ATOLL MORPHOLOGY ---
            const dist = Math.sqrt(x*x + z*z);
            const ringRadius = 80.0;
            const ringWidth = 35.0; 
            
            // Organic perturbation (Coastline jitter)
            const pDist = dist + noise(x * 0.04, z * 0.04) * 12.0;
            
            // Ring SDF: 0.0 at center/far-ocean, 1.0 at ring peak
            let ringShape = 1.0 - (Math.abs(pDist - ringRadius) / ringWidth);
            
            // Detail Noise (Coral / Rock) - Warped for craggy look
            let detail = warp(x * 0.03, z * 0.03) * 6.0; 
            
            // Elevations
            const deepOcean = -25.0;
            const reefShelf = -3.0; 
            const beach = 1.2;      
            const ridge = 9.0;      
            const lagoonBed = -5.0;
            
            let h = deepOcean;
            
            if (ringShape > 0.0) {
                // Inside the ring influence
                // 1. The Shelf (Reef base)
                let hShelf = mix(deepOcean, reefShelf, smoothstep(0.0, 0.15, ringShape));
                
                // 2. The Land (Beach to Ridge)
                let hLand = mix(beach, ridge, smoothstep(0.4, 0.9, ringShape));
                
                // 3. Composite Blend (Trapezoidal shaping)
                h = mix(hShelf, hLand, smoothstep(0.25, 0.4, ringShape));
                
                // Add detail only to the land/reef parts
                h += detail * smoothstep(0.1, 0.3, ringShape);
            } else {
                // Inside Lagoon or Deep Ocean
                if (pDist < ringRadius) {
                    h = lagoonBed + noise(x*0.1, z*0.1) * 2.0;
                } else {
                    h = deepOcean;
                }
            }
            
            return h;

        } else if (type === 'volcano') {
            const dist = Math.sqrt(x*x + z*z);
            let shape = 120.0 * Math.exp(-dist * 0.015);
            const crater = 80.0 * Math.exp(-dist * 0.05);
            shape -= crater;
            const detail = warp(x * 0.02, z * 0.02) * 15.0;
            const parkMask = smoothstep(150.0, 200.0, dist);
            return (shape + detail) * (1.0 - parkMask * 0.5);
        } else {
            let h = warp(x * 0.015, z * 0.015);
            return (h - 0.5) * 70.0;
        }
    }
`;
