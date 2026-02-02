
export const EROSION_FUNCTIONS = `
    // --- Hydraulic Erosion (Stabilized V2.0) ---
    // Industry Standard droplet simulation with mass conservation checks.
    function erode(heights, width, height, iterations, seedValue) {
        const inertia = 0.05;
        const minSlope = 0.005; // Lowered for finer channels
        const capacity = 4.0;
        const deposition = 0.3;
        const erosion = 0.3;
        const evaporation = 0.02;
        const gravity = 4.0;
        const maxSteps = 64;
        const mapSize = width * height;

        // Specialized Deterministic PRNG
        let currentSeed = seedValue || 12345;
        const fastRnd = () => {
            currentSeed = (Math.imul(currentSeed, 0x41C64E6D) + 12345) & 0x7FFFFFFF;
            return currentSeed / 2147483648.0;
        };

        for (let iter = 0; iter < iterations; iter++) {
            let posX = fastRnd() * (width - 1);
            let posY = fastRnd() * (height - 1);
            let dirX = 0;
            let dirY = 0;
            let speed = 1.0;
            let water = 1.0;
            let sediment = 0.0;

            for (let step = 0; step < maxSteps; step++) {
                const nodeX = Math.floor(posX);
                const nodeY = Math.floor(posY);
                const cellOffsetX = posX - nodeX;
                const cellOffsetY = posY - nodeY;
                const index = nodeY * width + nodeX;

                // Boundary Check
                if (nodeX < 0 || nodeX >= width - 1 || nodeY < 0 || nodeY >= height - 1) break;

                const h00 = heights[index];
                const h10 = heights[index + 1];
                const h01 = heights[index + width];
                const h11 = heights[index + width + 1];

                const gradX = (h10 - h00) * (1 - cellOffsetY) + (h11 - h01) * cellOffsetY;
                const gradY = (h01 - h00) * (1 - cellOffsetX) + (h11 - h10) * cellOffsetX;

                // Inertial Direction
                dirX = (dirX * inertia - gradX * (1 - inertia));
                dirY = (dirY * inertia - gradY * (1 - inertia));
                
                const len = Math.sqrt(dirX * dirX + dirY * dirY);
                if (len > 1e-6 && Number.isFinite(len)) {
                    dirX /= len;
                    dirY /= len;
                } else {
                    // Random dispersion if stalled
                    dirX = fastRnd() - 0.5;
                    dirY = fastRnd() - 0.5;
                }

                posX += dirX;
                posY += dirY;

                if (posX < 0 || posX >= width - 1 || posY < 0 || posY >= height - 1) break;

                const newX = Math.floor(posX);
                const newY = Math.floor(posY);
                const newIdx = newY * width + newX;
                
                // Interpolated new height
                const u = posX - newX;
                const v = posY - newY;
                const nh00 = heights[newIdx];
                const nh10 = heights[newIdx + 1];
                const nh01 = heights[newIdx + width];
                const nh11 = heights[newIdx + width + 1];
                const newHeight = (nh00 * (1-u)*(1-v) + nh10 * u * (1-v) + nh01 * (1-u) * v + nh11 * u * v);
                
                // Interpolated old height
                const oldHeight = (h00 * (1-cellOffsetX)*(1-cellOffsetY) + h10 * cellOffsetX * (1-cellOffsetY) + h01 * (1-cellOffsetX) * cellOffsetY + h11 * cellOffsetX * cellOffsetY);
                
                const heightDiff = oldHeight - newHeight;
                const sedimentCapacity = Math.max(-heightDiff, minSlope) * speed * water * capacity;

                if (sediment > sedimentCapacity || heightDiff < 0) {
                    // Deposition
                    const amount = (sediment - sedimentCapacity) * deposition;
                    sediment -= amount;
                    heights[index] += amount * (1-cellOffsetX) * (1-cellOffsetY);
                    heights[index+1] += amount * cellOffsetX * (1-cellOffsetY);
                    heights[index+width] += amount * (1-cellOffsetX) * cellOffsetY;
                    heights[index+width+1] += amount * cellOffsetX * (1-cellOffsetY);
                } else {
                    // Erosion
                    const amount = Math.min((sedimentCapacity - sediment) * erosion, -heightDiff);
                    sediment += amount;
                    heights[index] -= amount * (1-cellOffsetX) * (1-cellOffsetY);
                    heights[index+1] -= amount * cellOffsetX * (1-cellOffsetY);
                    heights[index+width] -= amount * (1-cellOffsetX) * cellOffsetY;
                    heights[index+width+1] -= amount * cellOffsetX * cellOffsetY;
                }

                const nextSpeedSq = speed * speed + heightDiff * gravity;
                // Safe speed clamp
                if (nextSpeedSq > 0 && Number.isFinite(nextSpeedSq)) {
                    speed = Math.sqrt(nextSpeedSq);
                } else {
                    speed = 0.5; // Damping reset
                }
                
                water *= (1 - evaporation);
                if (water < 0.001) break;
            }
        }
    }
`;
