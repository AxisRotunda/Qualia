/**
 * ProceduralUtils: Centralized mathematical functions for world generation.
 * Part of RUN_REF protocol to eliminate logic duplication.
 * Updated for RUN_OPT Phase 61.5: Optimized bitwise hashing.
 */
export class ProceduralUtils {

    /**
   * High-performance 32-bit Integer Hash (Murmur3 Variant)
   * Optimized with persistent constants for low stack overhead.
   */
    private static readonly C1 = 0xCC9E2D51;
    private static readonly C2 = 0x1B873593;
    private static readonly C3 = 0x85EBCA6B;
    private static readonly C4 = 0xC2B2AE35;

    static hash(x: number, z: number): number {
        let h = Math.imul(x, this.C1);
        h = (h << 15) | (h >>> 17);
        h = Math.imul(h, this.C2);
        h ^= Math.imul(z, this.C3);
        h = (h << 13) | (h >>> 19);
        h = (Math.imul(h, 5) + 0xE6546B64) | 0;
        h ^= h >>> 16;
        h = Math.imul(h, this.C3);
        h ^= h >>> 13;
        h = Math.imul(h, this.C4);
        h ^= h >>> 16;
        return (h >>> 0) / 4294967296.0;
    }

    /**
   * Deterministic 2D Value Noise with Quintic Interpolation.
   * Provides C2 continuity for smooth derivative shading.
   */
    static noise(x: number, z: number): number {
        const flX = Math.floor(x);
        const flZ = Math.floor(z);
        const frX = x - flX;
        const frZ = z - flZ;

        // Quintic easing: 6t^5 - 15t^4 + 10t^3
        const u = frX * frX * frX * (frX * (frX * 6 - 15) + 10);
        const v = frZ * frZ * frZ * (frZ * (frZ * 6 - 15) + 10);

        const n00 = this.hash(flX, flZ);
        const n10 = this.hash(flX + 1, flZ);
        const n01 = this.hash(flX, flZ + 1);
        const n11 = this.hash(flX + 1, flZ + 1);

        const x1 = n00 + u * (n10 - n00);
        const x2 = n01 + u * (n11 - n01);
        return x1 + v * (x2 - x1);
    }

    /**
   * Fractal Brownian Motion (FBM)
   * Sums multiple octaves of noise for complex organic textures.
   */
    static fbm(x: number, z: number, octaves: number = 4): number {
        let total = 0;
        let amp = 1.0;
        let freq = 1.0;
        let max = 0;
        for (let i = 0; i < octaves; i++) {
            total += this.noise(x * freq, z * freq) * amp;
            max += amp;
            amp *= 0.5;
            freq *= 2.0;
        }
        return total / max;
    }

    /**
   * Ridged Multi-fractal Noise
   * Inverts noise to create sharp "ridge" structures.
   */
    static ridgedNoise(x: number, z: number, octaves: number = 4): number {
        let total = 0;
        let amp = 1.0;
        let freq = 1.0;
        let weight = 1.0;
        let max = 0;
        for (let i = 0; i < octaves; i++) {
            let n = this.noise(x * freq, z * freq);
            n = 1.0 - Math.abs(n * 2.0 - 1.0);
            n = n * n * weight;
            weight = Math.min(1.0, n * 2.0);
            total += n * amp;
            max += amp;
            amp *= 0.5;
            freq *= 2.0;
        }
        return total / max;
    }

    /**
   * Domain Warped Noise (Warping fbm by fbm)
   */
    static warp(x: number, z: number): number {
        const qx = this.ridgedNoise(x, z, 4);
        const qz = this.ridgedNoise(x + 5.2, z + 1.3, 4);
        return this.ridgedNoise(x + 4.0 * qx, z + 4.0 * qz, 4);
    }

    static smoothstep(edge0: number, edge1: number, x: number): number {
        if (edge0 === edge1) return 0.0;
        const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
        return t * t * (3 - 2 * t);
    }

    static mix(x: number, y: number, a: number): number {
        return x * (1 - a) + y * a;
    }

    /**
   * Calculates terrain height for a given world coordinate.
   * Matches worker-side logic for client-side consistency.
   */
    static getTerrainHeight(x: number, z: number, type: 'standard' | 'dunes' | 'islands' | 'volcano' = 'standard'): number {
        if (type === 'dunes') {
            const nx = x * 0.02;
            const nz = z * 0.02;
            const n = this.noise(nx, nz);
            const n2 = 1.0 - Math.abs(n * 2.0 - 1.0);
            return n2 * n2 * 12.0 + this.noise(x * 0.15, z * 0.15) * 0.2;
        } else if (type === 'islands') {
            // ATOLL LOGIC (Mirrored from Worker)
            const dist = Math.sqrt(x * x + z * z);
            const pDist = dist + this.noise(x * 0.04, z * 0.04) * 12.0;
            const ringRadius = 80.0;
            const ringWidth = 35.0;

            const ringShape = 1.0 - (Math.abs(pDist - ringRadius) / ringWidth);
            const deepOcean = -25.0;
            const reefShelf = -3.0;
            const beach = 1.2;
            const ridge = 9.0;
            const lagoonBed = -5.0;

            if (ringShape > 0.0) {
                const hShelf = this.mix(deepOcean, reefShelf, this.smoothstep(0.0, 0.15, ringShape));
                const hLand = this.mix(beach, ridge, this.smoothstep(0.4, 0.9, ringShape));
                const h = this.mix(hShelf, hLand, this.smoothstep(0.25, 0.4, ringShape));
                const detail = this.warp(x * 0.03, z * 0.03) * 6.0;
                return h + detail * this.smoothstep(0.1, 0.3, ringShape);
            }
            return pDist < ringRadius
                ? lagoonBed + this.noise(x * 0.1, z * 0.1) * 2.0
                : deepOcean;


        } else if (type === 'volcano') {
            const dist = Math.sqrt(x * x + z * z);
            const shape = 120.0 * Math.exp(-dist * 0.015);
            const crater = 80.0 * Math.exp(-dist * 0.05);
            const detail = this.warp(x * 0.02, z * 0.02) * 15.0;
            const parkMask = this.smoothstep(150.0, 200.0, dist);
            return (shape - crater + detail) * (1.0 - parkMask * 0.5);
        }

        // Standard Highlands
        const h = this.warp(x * 0.015, z * 0.015);
        return (h - 0.5) * 70.0;
    }

    static random(seed: number): number {
        const x = Math.imul(seed, 1597334677) ^ Math.imul((seed >>> 16), 3812341611);
        return ((x >>> 0) % 1000000) / 1000000;
    }
}
