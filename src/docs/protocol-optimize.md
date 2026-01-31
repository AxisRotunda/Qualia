# [PROTOCOL] Optimization Engine
> **Trigger**: `RUN_OPT`
> **Target**: Runtime Performance (FPS, Memory, GC).
> **Input**: `src/docs/optimization-report.md`

## 1. Diagnosis Routine
1.  **READ** `src/docs/optimization-report.md` for current bottlenecks.
2.  **SCAN** target files for Anti-Patterns:
    *   `new Vector3()` / `new Quaternion()` in `update()` loops.
    *   `filter()` / `map()` on large arrays in hot paths.
    *   Synchronous heavy math on Main Thread (should be Worker).
    *   Unnecessary Reactivity (`effect()`) in render loop.

## 2. Execution Template
Output the optimization using this structure:

```typescript
// [TARGET]: ClassName.methodName
// [ISSUE]: Allocation of X objects per frame.
// [FIX]: Implemented Object Pooling / Scalar Passing.

// ... optimized code ...
```

## 3. Heuristic Database (Lookup)
*   **ECS Iteration**: Use `for(i=0; i<len; i++)` over `.forEach`.
*   **Physics Sync**: Use `syncActiveBodies` callback with scalars.
*   **Math**: Use `gl-matrix` style in-place mutation over Three.js immutable ops where possible in tight loops.
*   **Culling**: Update SpatialGrid only on movement `delta > epsilon`.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After applying an optimization, you MUST append a new entry to `src/docs/optimization-report.md` recording the change and its estimated impact.
