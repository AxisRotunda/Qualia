# [PROTOCOL] Chronos (Temporal Control)
> **Trigger**: `RUN_CHRONOS`
> **Target**: `src/engine/features/time/`, `src/services/game-loop.service.ts`
> **Version**: 1.0 (Genesis)
> **Axiom**: "Time is a dimension. History is data. Causality is traceable."

## 1. Analysis Routine
1.  **Deterministic Audit**:
    *   Verify `RUN_TEST` compliance. Time reversal is impossible without determinism.
2.  **Snapshot Frequency**:
    *   Check memory overhead of state snapshots.
    *   **Constraint**: Limit full snapshots to 1 per second. Use delta-compression for intermediate frames.

## 2. Refinement Strategies
*   **The Causality Log**:
    *   Record specific "Trigger Events" (Collision Start, User Spawn, Delete).
    *   Allows "Jump to Event" in the debug timeline.
*   **Time Dilation Tiers**:
    *   `1.0`: Real-time.
    *   `0.1`: Bullet-time (Physics detail).
    *   `-1.0`: Rewind (Snapshot playback).

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: Reversing physics (`dt < 0`) is not supported by Rapier. Rewind must be implemented as snapshot interpolation.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After refactoring time logic, perform the **Mutation Check**:
1.  **Jitter**: Did snapshots pop visually?
2.  **Correction**: Implement Hermite Spline interpolation between snapshot transforms.