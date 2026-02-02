
# [PROTOCOL] System Security
> **Trigger**: `RUN_SEC`
> **Target**: `src/services/`, `src/engine/input/`
> **Version**: 1.0 (Genesis)
> **Axiom**: "Input is untrusted. Boundaries must be absolute. Complexity masks vulnerability."

## 1. Analysis Routine
1.  **Injection Scan**:
    *   **Grep**: `innerHTML`, `outerHTML`, `document.write`.
    *   **Violation**: Strict prohibition. Use Angular bindings or direct DOM textContent manipulation.
2.  **Sanitization Audit**:
    *   Verify `NullShield.sanitize` is used on ALL user-provided strings (Search bars, Save names).
    *   Check for `eval()` or `new Function()`. **Fatal Error**.
3.  **Config Integrity**:
    *   Ensure Global Configuration objects (`COMBAT_CONFIG`, `CITY_CONFIG`) are deeply frozen (`Object.freeze`) in production mode to prevent runtime tampering by rogue scripts.

## 2. Refinement Strategies
*   **Input Validation Layer**:
    *   Physics inputs (Position, Velocity) must be clamped to `MAX_WORLD_BOUNDS` and `MAX_VELOCITY` before being applied to the engine.
    *   Prevents "Infinity/NaN" attacks that crash the WASM solver.
*   **Save File Hygiene**:
    *   When loading JSON, validate schema structure strictly.
    *   Strip unknown properties.
    *   Cap array lengths (e.g., max 10,000 entities) to prevent Memory Bomb attacks via save files.
*   **URL Safety**:
    *   If reading state from URL params, use strict parsing. Do not reflect URL params directly into DOM.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: `console.log` can leak sensitive internal state objects in production. Strip all logs in Prod build.
*   *Current Heuristic*: Trusting `dt` (Delta Time) blindly allows "Speed Hacks" if the tab is backgrounded and resumes with a huge `dt`. Clamp `dt` to `100ms` max.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After a security audit, perform the **Mutation Check**:
1.  **Crash**: Did a malformed input crash the engine?
2.  **Action**: Create a specific "Guard" class for that input type (e.g., `VectorGuard.isValid(v)`).
