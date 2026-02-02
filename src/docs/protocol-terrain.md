
# [PROTOCOL] Terrain Engine
> **Trigger**: `RUN_TERRAIN`
> **Target**: `src/engine/workers/terrain/`, `src/engine/features/terrain-manager.service.ts`
> **Version**: 1.3 (Atoll Morphology Update)

## 1. Analysis Routine
1.  **Worker Integrity**: Ensure `noise`, `erosion`, and `main` scripts are decoupled.
2.  **Seam Check**: 
    *   **Mandatory**: Normals at chunk edges must be calculated analytically from the global height function, NOT from discrete neighbors in the local grid.
    *   **Violation**: Visible lighting "lines" at chunk boundaries.
3.  **LOD Strategy**: Check if distant chunks are using `stride > 1`.

## 2. Refinement Strategies
*   **Biome Blending**: Do not use single noise functions. Use a `Temperature` and `Moisture` map to blend between height functions (e.g., Dunes vs Mountains).
*   **Erosion Optimization**: Only run hydraulic erosion on LOD 0 (Center Chunk). It is too expensive for background terrain.
*   **Gameplay Masking**: When generating terrain around a central gameplay feature (e.g., Oil Rig), use `dist + noise(angle)` to create an organic clearing radius, rather than a perfect geometric circle.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: `stride = 4` is acceptable for chunks > 150m away.
*   *Current Heuristic*: Standard FBM requires 4 octaves for realistic ground detail.
*   *Current Heuristic*: For 'Rock' or 'Cliff' terrain, using a hard height threshold (e.g., `if h < 2.0 then seabed`) creates better visual results than smooth interpolation, as it mimics sheer cliff faces intersecting water.
*   *Current Heuristic*: Analytical normals are 100% effective at removing seams but require 4 extra height samples per vertex. This is acceptable performance-wise for Web Workers.
*   *Current Heuristic*: For Islands, combine a `smoothstep` radial mask with a `warp` noise for the interior to create a realistic "Atoll" shape with a shallow underwater shelf before the deep ocean drop-off.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After updating terrain logic, perform the **Mutation Check**:
1.  **bottleneck**: Did the worker take > 50ms?
2.  **Constraint**: If yes, update `Analysis Routine` to recommend reducing `Erosion Iterations` or `Octave Count`.
