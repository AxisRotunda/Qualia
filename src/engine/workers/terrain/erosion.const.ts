
export const EROSION_FUNCTIONS = `
    // --- Hydraulic Erosion ---
    function erode(heights, width, height, iterations) {
        const mapSize = width * height;
        const inertia = 0.05;
        const minSlope = 0.01;
        const capacity = 4.0;
        const deposition = 0.3;
        const erosion = 0.3;
        const evaporation = 0.02;
        const gravity = 4.0;
        const maxSteps = 64;

        for (let iter = 0; iter < iterations; iter++) {
            let posX = Math.random() * (width - 1);
            let posY = Math.random() * (height - 1);
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

                if (nodeX >= width - 1 || nodeY >= height - 1 || nodeX < 0 || nodeY < 0) break;

                const h00 = heights[index];
                const h10 = heights[index + 1];
                const h01 = heights[index + width];
                const h11 = heights[index + width + 1];

                const gradX = (h10 - h00) * (1 - cellOffsetY) + (h11 - h01) * cellOffsetY;
                const gradY = (h01 - h00) * (1 - cellOffsetX) + (h11 - h10) * cellOffsetX;

                dirX = (dirX * inertia - gradX * (1 - inertia));
                dirY = (dirY * inertia - gradY * (1 - inertia));
                
                const len = Math.sqrt(dirX * dirX + dirY * dirY);
                if (len !== 0) {
                    dirX /= len;
                    dirY /= len;
                }

                posX += dirX;
                posY += dirY;

                if (posX < 0 || posX >= width - 1 || posY < 0 || posY >= height - 1) break;

                const newX = Math.floor(posX);
                const newY = Math.floor(posY);
                const newIdx = newY * width + newX;
                
                const u = posX - newX;
                const v = posY - newY;
                const nh00 = heights[newIdx];
                const nh10 = heights[newIdx + 1];
                const nh01 = heights[newIdx + width];
                const nh11 = heights[newIdx + width + 1];
                const newHeight = (nh00 * (1-u)*(1-v) + nh10 * u * (1-v) + nh01 * (1-u) * v + nh11 * u * v);
                
                const oldHeight = (h00 * (1-cellOffsetX)*(1-cellOffsetY) + h10 * cellOffsetX * (1-cellOffsetY) + h01 * (1-cellOffsetX) * cellOffsetY + h11 * cellOffsetX * cellOffsetY);
                const heightDiff = oldHeight - newHeight;
                const sedimentCapacity = Math.max(-heightDiff, minSlope) * speed * water * capacity;

                if (sediment > sedimentCapacity || heightDiff < 0) {
                    const amount = (sediment - sedimentCapacity) * deposition;
                    sediment -= amount;
                    heights[index] += amount * (1-cellOffsetX) * (1-cellOffsetY);
                    heights[index+1] += amount * cellOffsetX * (1-cellOffsetY);
                    heights[index+width] += amount * (1-cellOffsetX) * cellOffsetY;
                    heights[index+width+1] += amount * cellOffsetX * cellOffsetY;
                } else {
                    const amount = Math.min((sedimentCapacity - sediment) * erosion, -heightDiff);
                    sediment += amount;
                    heights[index] -= amount * (1-cellOffsetX) * (1-cellOffsetY);
                    heights[index+1] -= amount * cellOffsetX * (1-cellOffsetY);
                    heights[index+width] -= amount * (1-cellOffsetX) * cellOffsetY;
                    heights[index+width+1] -= amount * cellOffsetX * cellOffsetY;
                }

                speed = Math.sqrt(speed * speed + heightDiff * gravity);
                water *= (1 - evaporation);
                if (water < 0.01) break;
            }
        }
    }
`;
