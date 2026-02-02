
# [PROTOCOL] Persistence & Serialization
> **Trigger**: `RUN_SAVE`
> **Target**: `src/engine/persistence.service.ts`, `src/engine/schema.ts`
> **Version**: 1.0 (Genesis)
> **Axiom**: "State is ephemeral; Data is eternal. Backward compatibility is non-negotiable."

## 1. Analysis Routine
1.  **Schema Audit**:
    *   Verify `SavedScene` interface matches the current `World` component structure.
    *   **Violation**: Saving `MeshRef` or `RigidBodyHandle` (runtime pointers) is forbidden. Only save abstract descriptors (TemplateID, Transform, Props).
2.  **Completeness Check**:
    *   Are modified physics properties (Friction/Restitution) saved?
    *   Are custom names (`names` component) saved?
    *   Are procedural seeds saved?
3.  **Version Handling**:
    *   Check for `version` field in the JSON output.
    *   Ensure `loadSceneData` contains a switch/migration path for older versions.

## 2. Refinement Strategies
*   **Filter Strategy**:
    *   Do not save everything. Save **Deltas** from the Template.
    *   If `Entity.scale == Template.scale`, do not write scale to JSON.
*   **Identity Restoration**:
    *   Use `TemplateID` as the primary key for reconstruction.
    *   Fallback to `Primitive` reconstruction if TemplateID is missing (legacy support).
*   **Chunking**:
    *   For large worlds (City), implement `Streamable` serialization (save per-chunk files) rather than one monolithic JSON (Future V2).

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: `Float32Array` serialization to JSON arrays is slow. For massive counts (>10k entities), switch to binary formats (MessagePack or custom ArrayBuffer) in the future.
*   *Current Heuristic*: Round floating point positions to 3 decimal places (`toFixed(3)`) to reduce save file size by ~40% without visible jitter.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After updating persistence, perform the **Mutation Check**:
1.  **Bloat**: Is the save file > 1MB for a simple scene?
2.  **Correction**: Implement the **Delta Strategy** (Refinement 1) immediately.
3.  **Crash**: Did loading an old save crash the engine?
4.  **Correction**: Add a `try/catch` block around the spawner loop in `loadSceneData` to skip corrupt entities.
