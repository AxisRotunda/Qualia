# [PROTOCOL] ECS Store Architect
> **Trigger**: `RUN_SCHEMA`
> **Target**: `src/engine/ecs/`, `src/engine/schema.ts`
> **Version**: 1.0 (Genesis)
> **Axiom**: "Data is the Master. Access is the Law. Alignment is Performance."

## 1. Analysis Routine
1.  **Data Topology Scan**:
    *   Check `src/engine/ecs/` for new store implementations.
    *   **Violation**: Using `Map<Entity, T>` for high-frequency properties (Position, Velocity). These MUST use a specialized `Store` with `Float32Array` buffers.
2.  **SoA Compliance Check**:
    *   Identify "Object Bloat" in stores. 
    *   **Rule**: If a component has multiple numeric fields (e.g., `x, y, z`), they MUST be stored in individual primitive arrays (`px: Float32Array`, `py: Float32Array`, etc.).
3.  **Persistence Gap**:
    *   Verify that any new Component added to the `World` has a corresponding entry in `RUN_SAVE`.

## 2. Refinement Strategies
*   **The SoA Pattern (Structure of Arrays)**:
    *   **Pattern**: Implement `remove()` via "Swap-and-Pop" in all primitive buffers to maintain contiguity.
    *   **Benefit**: Linear iteration speed increases by 400% due to L1 cache hits.
*   **Capacity Hygiene**:
    *   Initial store capacity should be `4096`. 
    *   Expansion logic must use power-of-two growth (`oldCapacity * 2`).
*   **Atomic Setters**:
    *   Always implement `setPosition(e, x, y, z)` methods that accept scalars to avoid temporary `{x,y,z}` object allocation in the caller.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: Use `Int32Array` for the `sparse` lookup table and `dense` identity array to prevent hidden class transitions in the V8 engine.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After evolving the schema, perform the **Mutation Check**:
1.  **Memory**: Did the heap size grow unexpectedly?
2.  **Action**: Check for redundant copies of data between ECS and Physics. Move to "Physics-Only" storage if the data isn't needed for Game Logic.