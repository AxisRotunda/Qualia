
export const WORKER_MAIN = `
    self.onmessage = function(e) {
        const { id, width, depth, segmentsW, segmentsD, offsetX, offsetZ, lod = 1, terrainType = 'standard' } = e.data;
        
        try {
            const stride = Math.max(1, Math.floor(lod));
            // Ensure at least 1 effective segment to prevent division by zero
            const effectiveSegW = Math.max(1.0, segmentsW / stride);
            const effectiveSegD = Math.max(1.0, segmentsD / stride);
            
            // Use floor to match Three.js PlaneGeometry segment logic
            const gridW = Math.floor(effectiveSegW) + 1;
            const gridD = Math.floor(effectiveSegD) + 1;
            
            const totalVerts = gridW * gridD;
            const heights = new Float32Array(totalVerts);
            const normals = new Float32Array(totalVerts * 3);
            
            // --- Generation Pass ---
            let ptr = 0;
            for (let i = 0; i < gridD; i++) {
                for (let j = 0; j < gridW; j++) {
                    const x = (j / (gridW - 1)) * width + offsetX;
                    const z = (i / (gridD - 1)) * depth + offsetZ;
                    heights[ptr++] = getHeight(x, z, terrainType);
                }
            }

            // Erosion (Only for high LOD standard terrain)
            if (lod === 1 && terrainType === 'standard') {
                const droplets = 35000;
                const chunkSeed = Math.floor(Math.abs(offsetX * 1000 + offsetZ));
                erode(heights, gridW, gridD, droplets, chunkSeed);
            }

            // Final Buffer Sanity Guard
            for (let i = 0; i < heights.length; i++) {
                if (!Number.isFinite(heights[i])) heights[i] = 0.0;
            }

            // Normal Pass
            const eps = 0.1; 
            ptr = 0;
            for (let i = 0; i < gridD; i++) {
                for (let j = 0; j < gridW; j++) {
                    const x = (j / (gridW - 1)) * width + offsetX;
                    const z = (i / (gridD - 1)) * depth + offsetZ;
                    
                    const hL = getHeight(x - eps, z, terrainType);
                    const hR = getHeight(x + eps, z, terrainType);
                    const hU = getHeight(x, z - eps, terrainType);
                    const hD = getHeight(x, z + eps, terrainType);
                    
                    const dx = (hL - hR) / (2 * eps);
                    const dz = (hU - hD) / (2 * eps);

                    let nx = dx;
                    let ny = 1.0;
                    let nz = dz;
                    
                    const len = Math.sqrt(nx*nx + ny*ny + nz*nz);
                    normals[ptr*3] = nx / len;
                    normals[ptr*3+1] = ny / len;
                    normals[ptr*3+2] = nz / len;
                    
                    ptr++;
                }
            }

            self.postMessage({ id, heights, normals, gridW, gridD }, [heights.buffer, normals.buffer]);
        } catch (err) {
            self.postMessage({ id, error: err.message || 'Worker Internal Fault' });
        }
    };
`;
