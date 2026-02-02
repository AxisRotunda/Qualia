
# [PROTOCOL] State Sovereign
> **Trigger**: `RUN_STATE`
> **Target**: `src/engine/engine-state.service.ts`, `src/engine/features/`
> **Version**: 1.0 (Genesis)
> **Axiom**: "State is the Truth. Mutation is the Exception. Reactivity is the Result."

## 1. Analysis Routine
1.  **Exposure Audit**:
    *   Scan `EngineStateService` for `WritableSignal` exposed as `public`.
    *   **Violation**: Public signals MUST be `readonly Signal<T>`. Mutation must occur via specific methods or dedicated Feature Services.
2.  **Effect Hygiene**:
    *   **Grep**: `effect(() => { ... })` inside Services.
    *   **Constraint**: Effects should be used sparingly for "Side Effects" (e.g., Logging, External API calls). They should NOT be used to derive state (Use `computed`) or synchronize sync data (Use Systems).
3.  **Derivation Check**:
    *   Identify components calculating derived data (e.g., `inventory.length`) inside the template.
    *   **Recommendation**: Move logic to `computed()` signals in the Component or Service to leverage memoization.

## 2. Refinement Strategies
*   **The Read-Only Facade**:
    *   Pattern: `private _value = signal(0); public readonly value = this._value.asReadonly();`.
*   **Action Actions**:
    *   State mutations must be encapsulated in semantic methods (e.g., `setPaused(true)` instead of `isPaused.set(true)`).
*   **Atomic Updates**:
    *   Prefer `.update(current => ...)` over `.set(...)` when the new state depends on the old state to prevent race conditions.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: Avoid updating Signals inside the `requestAnimationFrame` loop (Systems) unless they are specifically for UI visualization (like `fps` or `physicsTime`). High-frequency signal updates trigger Change Detection cycles even in Zoneless mode.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After refactoring state, perform the **Mutation Check**:
1.  **Looping**: Did an `effect()` trigger itself?
2.  **Correction**: If yes, verify `allowSignalWrites` is NOT used. Refactor to `computed`.
