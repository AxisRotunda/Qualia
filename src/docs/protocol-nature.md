
# [PROTOCOL] Nature Simulation
> **Trigger**: `RUN_NATURE`
> **Target**: `src/services/generators/nature/`, `src/services/particle.service.ts`
> **Version**: 1.0 (Genesis)

## 1. Analysis Routine
1.  **Complexity Scan**: Check recursive functions (e.g., `generateTree`). Ensure recursion depth is capped by a `complexity` argument.
2.  **Noise Check**: Verify `Math.random()` usage. Prefer coherent noise (Perlin/Simplex) for organic placement to avoid "static" look.
3.  **Performance Check**: Physics bodies for nature assets (Trees/Rocks) should default to simple primitives (Capsule/Hull), not Trimesh.

## 2. Refinement Strategies
*   **Growth Scalars**: All flora generators must accept a `complexity: number` (0.0 - 1.0).
    *   `1.0`: Hero asset (Full recursion, high poly).
    *   `0.5`: Mid range (Reduced branches).
    *   `0.1`: Distant imposter (Billboard or simple shape).
*   **Biomimicry**: Use `CatmullRomCurve3` for trunks/stems instead of straight cylinders.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: Palm trees look better with 12+ fronds.
*   *Current Heuristic*: Rock generation should use `Dodecahedron` as base for better fracturing.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After generating nature assets, perform the **Mutation Check**:
1.  **Variety**: Did the algorithm produce enough variance?
2.  **Correction**: If outputs look identical, add a `seed` parameter to the generator signature and update the Protocol to enforce seeded generation.
