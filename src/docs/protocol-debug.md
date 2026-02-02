
# [PROTOCOL] Debug Telemetry
> **Trigger**: `RUN_DEBUG`
> **Target**: `src/services/debug.service.ts`, `src/engine/graphics/debug-renderer.service.ts`
> **Version**: 1.0 (Genesis)
> **Axiom**: "Visibility is Understanding. Production code is silent."

## 1. Analysis Routine
1.  **Console Pollution**:
    *   **Grep**: `console.log` inside `update()`, `render()`, or `tick()`.
    *   **Violation**: Frame-loop logging is forbidden. It causes massive GC churn and browser lag.
2.  **Visual Artifacts**:
    *   Check for `THREE.ArrowHelper` or `THREE.BoxHelper` created inside Components and not disposed.
    *   **Requirement**: All debug visuals must be managed by `DebugRendererService` or `GizmoManagerService`.
3.  **Switch Logic**:
    *   Verify all debug features are gated behind `EngineState.showDebugOverlay` or `showPhysicsDebug`.

## 2. Refinement Strategies
*   **Ephemeral Rendering**:
    *   Use `DebugRendererService` to draw lines/points from a buffer.
    *   Pattern: `debug.drawLine(start, end, color)`. Cleared every frame.
*   **Metric Aggregation**:
    *   Instead of logging every event, increment a counter in `StatisticsSystem` and display it in the `DebugOverlayComponent`.
*   **Cheat Exposure**:
    *   Expose critical actions (Spawn, Reset, God Mode) to `window.qualiaDebug` for console access during runtime testing.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: Visualizing Physics Colliders (Wireframes) reduces FPS by ~40% due to the number of draw calls. Always ensure it defaults to `false`.
*   *Current Heuristic*: Raycast visualization (drawing the ray line) is the single most effective tool for debugging interaction issues.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After implementing debug tools, perform the **Mutation Check**:
1.  **Leak**: Did debug meshes persist after turning off the overlay?
2.  **Correction**: Ensure `DebugRendererService.update(null)` or `clear()` is called when the toggle signal becomes `false`.
