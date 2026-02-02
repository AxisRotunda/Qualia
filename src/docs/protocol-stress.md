
# [PROTOCOL] Stress Diagnostic
> **Trigger**: `RUN_STRESS`
> **Target**: `src/services/debug.service.ts`, `src/engine/runtime/engine-runtime.service.ts`
> **Version**: 1.0 (Genesis)
> **Axiom**: "Find the ceiling before the user does. Bottlenecks are opportunities."

## 1. Analysis Routine
1.  **Spike Detection**:
    *   Monitor `physicsTime` vs `renderTime`.
    *   **Violation**: If `physicsTime` exceeds `12ms` (on a 16ms budget), the world is too dense.
2.  **Draw Call Saturation**:
    *   Check `totalMeshCount` vs `visibleMeshCount`.
    *   **Constraint**: Total meshes > 2000 triggers mandatory instancing check.
3.  **WASM Heap Audit**:
    *   Check Rapier body count. > 500 active dynamic bodies is the "Red Zone" for mobile.

## 2. Testing strategies
*   **The "Rain of Fire" Test**:
    *   Spawn 100 dynamic `prop-crate` entities in a single frame.
    *   **Success**: FPS drops < 10% and recovers in < 200ms.
*   **The "Horizon Scan"**:
    *   Rotate camera 360 degrees rapidly. 
    *   **Metric**: Measure `visibilityManager` overhead.
*   **The "Infinite Loop" Safeguard**:
    *   Inject high-complexity recursive trees. Measure `AssetService` generation time.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: Physics jitter usually starts occurring when the simulation substeps exceed 5 per frame.
*   *Current Heuristic*: Mobile thermal throttling can be detected by watching for a steady decline in FPS over 5 minutes while the scene is static.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After a stress test, perform the **Mutation Check**:
1.  **Discovery**: What failed first? (Geometry, Physics, or Draw Calls?)
2.  **Action**: Update `RUN_OPT` with a specific mitigation for that subsystem.
