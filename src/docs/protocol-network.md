# [PROTOCOL] Network Synchronizer
> **Trigger**: `RUN_NET`
> **Target**: `src/engine/net/`, `src/services/network/`
> **Version**: 1.0 (Genesis)
> **Axiom**: "Truth is singular. Latency is distance. Convergence is inevitable."

## 1. Analysis Routine
1.  **Determinism Audit**:
    *   Verify `RUN_TEST` benchmarks pass. A non-deterministic simulation cannot be synchronized.
    *   Check usage of floating point math in gameplay critical paths. Ensure consistent use of `Math.fround` or quantized integers if drift is detected.
2.  **State Size Check**:
    *   Calculate the byte size of `World` snapshot (Transforms + Velocities).
    *   **Constraint**: Per-tick packet size must be < 1400 bytes (MTU safe). If larger, flag for **Delta Compression** or **Interest Management**.
3.  **Authority Check**:
    *   Identify "God Methods" that mutate state (e.g., `setHealth`).
    *   **Requirement**: These must be wrapped in `Command` patterns to be sent to the Authoritative Server. Clients usually only predict movement.

## 2. Refinement Strategies
*   **Snapshot Buffer**:
    *   Implement a ring buffer (size ~20) of World States on the client.
    *   Render logic must interpolate between `Snapshot[t]` and `Snapshot[t+1]` based on `serverTime - renderTime`.
*   **Input Prediction**:
    *   Client applies inputs immediately to local Physics.
    *   Store inputs in a buffer.
    *   On Server correction: Rewind to last confirmed tick, re-apply subsequent inputs. ("Reconciliation").
*   **Quantization**:
    *   Compress Positions: `float32` -> `int16` (Fixed Point) relative to chunk center.
    *   Compress Rotations: `Quaternion` -> `Smallest Three` (Drop largest component, reconstruct) or `Euler (int8)`.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: For physics-heavy games (Rapier), syncing the entire `RigidBody` state (Pos, Rot, LinVel, AngVel) is bandwidth heavy. Sync `Pos/Rot` and let the client solver infer velocity via `setNextKinematicTranslation` for remote entities ("Puppet Mode").
*   *Current Heuristic*: Interpolating `Quaternion` via `slerp` is expensive. For background objects, `lerp` is often visually sufficient and faster.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After implementing network features, perform the **Mutation Check**:
1.  **Rubberbanding**: Did the player jitter on correction?
2.  **Correction**: If yes, implement **Error Smoothing** (visually lerp the correction over 100ms) rather than snapping physics instantly.