
# [PROTOCOL] Terrain Engine
> **Trigger**: `RUN_TERRAIN`
> **Target**: `src/engine/workers/terrain/`, `src/engine/features/terrain-manager.service.ts`
> **Version**: 1.0 (Genesis)

## 1. Analysis Routine
1.  **Worker Integrity**: Ensure `noise`, `erosion`, and `main` scripts are decoupled.
2.  **Seam Check**: Verify that edge normals match neighboring chunks. (Use `epsilon` sampling across borders).
3.  **LOD Strategy**: Check if distant chunks are using `stride > 1`.

## 2. Refinement Strategies
*   **Biome Blending**: Do not use single noise functions. Use a `Temperature` and `Moisture` map to blend between height functions (e.g., Dunes vs Mountains).
*   **Erosion Optimization**: Only run hydraulic erosion on LOD 0 (Center Chunk). It is too expensive for background terrain.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: `stride = 4` is acceptable for chunks > 150m away.
*   *Current Heuristic*: Standard FBM requires 4 octaves for realistic ground detail.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After updating terrain logic, perform the **Mutation Check**:
1.  **bottleneck**: Did the worker take > 50ms?
2.  **Constraint**: If yes, update `Analysis Routine` to recommend reducing `Erosion Iterations` or `Octave Count`.
