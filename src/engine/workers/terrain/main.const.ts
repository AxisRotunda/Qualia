
export const WORKER_MAIN = `
    self.onmessage = function(e) {
        const { width, depth, segmentsW, segmentsD, offsetX, offsetZ, lod = 1, terrainType = 'standard' } = e.data;
        
        // LOD Stride: Reduce vertex count for distant chunks
        const stride = Math.max(1, Math.floor(lod));
        const effectiveSegW = segmentsW / stride;
        const effectiveSegD = segmentsD / stride;
        
        const totalVerts = (effectiveSegW + 1) * (effectiveSegD + 1);
        const heights = new Float32Array(totalVerts);
        const normals = new Float32Array(totalVerts * 3);
        
        // --- Generation Loop ---
        let ptr = 0;
        const gridW = effectiveSegW + 1;
        const gridD = effectiveSegD + 1;

        // Pass 1: Heights
        for (let i = 0; i <= effectiveSegD; i++) {
            for (let j = 0; j <= effectiveSegW; j++) {
                const x = (j / effectiveSegW) * width + offsetX;
                const z = (i / effectiveSegD) * depth + offsetZ;
                heights[ptr++] = getHeight(x, z, terrainType);
            }
        }

        // Erosion (Only for high LOD standard terrain)
        if (lod === 1 && terrainType === 'standard') {
            const droplets = 35000;
            erode(heights, gridW, gridD, droplets);
        }

        // Pass 2: Normals (Analytical / Finite Difference from function for smooth seams)
        // We use a small epsilon to sample the 'virtual' neighbor heights from the noise function directly
        // rather than using the discrete grid, to ensure normals match perfectly at chunk seams.
        const eps = 0.1; 
        ptr = 0;
        
        for (let i = 0; i <= effectiveSegD; i++) {
            for (let j = 0; j <= effectiveSegW; j++) {
                const x = (j / effectiveSegW) * width + offsetX;
                const z = (i / effectiveSegD) * depth + offsetZ;
                
                let dx, dz;

                if (lod === 1 && terrainType === 'standard') {
                    // Use Grid Neighbors (clamped)
                    const idx = i * gridW + j;
                    const h = heights[idx];
                    
                    const iU = Math.max(0, i - 1); const idxU = iU * gridW + j;
                    const iD = Math.min(effectiveSegD, i + 1); const idxD = iD * gridW + j;
                    const jL = Math.max(0, j - 1); const idxL = i * gridW + jL;
                    const jR = Math.min(effectiveSegW, j + 1); const idxR = i * gridW + jR;
                    
                    // Simple central difference
                    dx = (heights[idxL] - heights[idxR]) / (width / effectiveSegW * 2);
                    dz = (heights[idxU] - heights[idxD]) / (depth / effectiveSegD * 2);
                } else {
                    // Analytical (Seamless)
                    const hL = getHeight(x - eps, z, terrainType);
                    const hR = getHeight(x + eps, z, terrainType);
                    const hU = getHeight(x, z - eps, terrainType);
                    const hD = getHeight(x, z + eps, terrainType);
                    
                    dx = (hL - hR) / (2 * eps);
                    dz = (hU - hD) / (2 * eps);
                }

                // Normal vector approximation
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

        self.postMessage({ heights, normals }, [heights.buffer, normals.buffer]);
    };
`;
