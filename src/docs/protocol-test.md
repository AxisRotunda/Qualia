
# [PROTOCOL] System Integrity & Testing
> **Trigger**: `RUN_TEST`
> **Target**: `src/engine/`, `src/services/`
> **Version**: 1.0 (Genesis)
> **Axiom**: "Chaos is expected. Randomness is seeded. Determinism is law."

## 1. Analysis Routine
1.  **Determinism Scan**:
    *   **Grep**: `Math.random()` in logic/physics files.
    *   **Violation**: All gameplay logic MUST use a seeded Random Number Generator (RNG) (e.g., `squirrel3` or `LCG`). `Math.random()` is only allowed for visual-only effects (particles).
2.  **Physics Integrity**:
    *   Verify `PhysicsStepService` uses a fixed accumulator.
    *   Ensure no logic relies on `requestAnimationFrame` timestamp for simulation state. All state changes must function on `fixedDeltaTime`.
3.  **State Leakage**:
    *   Check `reset()` methods in Services. Ensure `Map.clear()`, `Array.length = 0`, and `Subscription.unsubscribe()` are called.

## 2. Refinement Strategies
*   **Snapshot Testing**:
    *   Define a `Scenario`. Run for 600 frames. Hash the final `World` state (transforms).
    *   If Hash changes between runs, Determinism is broken.
*   **Visual Regression**:
    *   Capture canvas `toDataURL()` at frame 10. Compare against baseline.
*   **Performance Budget**:
    *   `Physics`: < 4ms/frame.
    *   `Render`: < 8ms/frame.
    *   `Script`: < 4ms/frame.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: Rapier's cross-platform determinism relies on `snapToGround` being consistent. Avoid micro-gaps in terrain generation.
*   *Current Heuristic*: `Float32Array` operations are not strictly deterministic across different browser JS engines (floating point drift). For critical multiplayer sync, use Fixed Point math libraries (future).

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After running tests, perform the **Mutation Check**:
1.  **Drift**: Did objects slowly slide over 10 minutes?
2.  **Correction**: Increase `linearDamping` or check for "sleeping" thresholds in `PhysicsOptimizer`.
