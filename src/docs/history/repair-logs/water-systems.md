# [REPAIR_LOG] Water Systems Stability
> **ID**: LOG_HYDRO_SYNC
> **Status**: Active Fix
> **Date**: Phase 70.3
> **Axiom**: "Physics and Optics must agree on the definition of Up."

## 1. Problem Definition
The "Island Sanctuary" scene exhibits visual artifacts:
1.  **Blocky Waves**: The vertex displacement resolution (4m grid) cannot resolve high-frequency noise waves, causing aliasing and jagged geometry.
2.  **Physics Desync**: Floating objects (Buoyancy) do not perfectly match the visual wave peaks, especially at the edges of the map.
3.  **Horizon Issues**: Rendering artifacts where the water plane meets the skybox/fog.

## 2. Root Cause Analysis
*   **Coordinate Space Mismatch**: The Shader calculates waves using `position` (Local Space). If the mesh is rotated or transformed (e.g., `rotateX(-Math.PI/2)`), the Local Y axis becomes World Z, causing the wave direction vector `(x, z)` to apply incorrectly relative to the CPU Physics which uses absolute World `(x, z)`.
*   **Sampling Theory Violation**: The previous mesh had a vertex spacing of ~4m. Wave 3 (High Frequency noise) has a wavelength of ~14m. This is close to the Nyquist limit, resulting in triangle-shaped waves.
*   **Normal Approximation**: The shader used a "Finite Difference" method (`epsilon` sampling) on the vertex grid. On a low-res grid, this produces faceted normals, making the water look like low-poly plastic rather than liquid.

## 3. Alternate Solution Strategy
*   **World Space Projection**: The Vertex Shader will now calculate wave height using `(modelMatrix * vec4(position, 1.0)).xyz`. This guarantees 1:1 parity with the CPU Buoyancy System regardless of mesh rotation or scale.
*   **Frequency Split**: 
    *   **Vertex Shader**: Displaces ONLY Wave 1 (Swell) and Wave 2 (Chop). Large scale, easy to resolve.
    *   **Normal Map**: Handles high-frequency noise (Wave 3+). This decouples surface detail from geometry resolution.
*   **Analytical Normals**: Replaced Finite Difference with an analytical normal calculation in the shader (calculating derivatives of the sine sum) for perfectly smooth lighting even on low-poly meshes.

## 4. Verification
*   Added `prop-crate` entities to `water.scene.ts` to visually verify buoyancy sync.
*   Water material roughness modulated by wave height (Foam) for visual definition.