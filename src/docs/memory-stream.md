# [MEMORY] Context Stream
> **ID**: MEM_STREAM
> **Role**: Persistent architectural RAM. Tracks decisions, active focus, and invariants.
> **Update Rule**: Append new decisions to log. Overwrite State on phase shift.

## 1. Active System State
*   **Phase**: 4.0 (Self-Optimizing Documentation).
*   **Focus**: Establishing the Neural Framework.
*   **Critical Alert**: None.

## 2. Architectural Invariants (Cached)
*   **[Zoneless]**: `provideZonelessChangeDetection` is active. UI uses Signals exclusively.
*   **[Facade]**: UI Components MUST NOT inject `PhysicsService` or `Three.js` objects directly. Use `EngineService`.
*   **[Physics]**: `Rapier` drives `Three.js` in `play` mode. `Gizmo` drives `Rapier` in `edit` mode.
*   **[Data]**: ECS Components (`ComponentStore`) use `Int32Array` for sparse lookups (Optimization V1).

## 3. Decision Log (LIFO)
*   **[LOG_001]**: Installed `kernel.md` as root authority. Deprecated narrative docs in favor of Protocols.
*   **[LOG_002]**: Established `protocol-optimize.md` to replace `perf-protocol.md`.
*   **[LOG_003]**: Enforced "Hard Realism" physics tuning (Density-based mass).

## 4. Pending Tasks (Backlog)
*   [ ] **Refactor**: Split `EntityAssemblerService` (High Coupling).
*   [ ] **Optimization**: Move ECS Transform storage to `Float32Array` (SoA).
*   [ ] **Feature**: Implement Audio Engine.
