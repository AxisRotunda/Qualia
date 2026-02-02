# [PROTOCOL] Optimization Engine
> **Trigger**: `RUN_OPT`
> **Target**: Runtime Performance (FPS, Memory, GC).
> **Input**: `../history/optimization.md`
> **Version**: 2.3 (Tiered Migration)

## 1. Diagnosis Routine
1.  **READ** `../history/optimization.md` for current bottlenecks.
2.  **SCAN** target files using these evolved heuristics:
    *   **Library Sync**: Ensure Three.js and sub-modules use identical versions.
    *   **String Thrashing**: Detect `.toLowerCase()` or concatenation in `update()` loops.
    *   **Math Allocations**: Detect `new Vector3` inside hot paths.
    *   **Physics Argument Allocation**: Search for object literals `{x, y, z}` in physics calls.
    *   **Vector Math**: Replace `vec.length()` with `vec.lengthSq()` where possible.

## 2. Execution Template
Output the optimization using this structure:
```typescript
// [TARGET]: ClassName.methodName
// [ISSUE]: Allocation of X objects per frame.
// [FIX]: Implemented Object Pooling / Scalar Passing / Zero-Alloc Pattern.
```

## 3. Heuristic Database (Dynamic)
*   **ECS Iteration**: Use `for(i=0; i<len; i++)` over `.forEach`.
*   **Collection Types**: Prefer `Array` + Swap-and-Pop for hot lists.
*   **Physics Sync**: Pass raw scalars to callbacks instead of Objects.
*   **Math/Color**: Use in-place mutation (`vec.add(v)`) over immutable ops.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After applying an optimization, perform the **Mutation Check**:
1.  **Action**: APPEND new patterns to the `Heuristic Database` above.
2.  **Logging**: Update `src/docs/history/optimization.md`.