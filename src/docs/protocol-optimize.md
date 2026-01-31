# [PROTOCOL] Optimization Engine
> **Trigger**: `RUN_OPT`
> **Target**: Runtime Performance (FPS, Memory, GC).
> **Input**: `src/docs/optimization-report.md`
> **Version**: 1.1 (Self-Learning)

## 1. Diagnosis Routine
1.  **READ** `src/docs/optimization-report.md` for current bottlenecks.
2.  **SCAN** target files using these evolved heuristics:
    *   **Math Allocations**: Search for `new Vector3`, `new Quaternion`, `new Matrix4` inside `update()`, `render()`, or `tick()` methods.
    *   **Array Churn**: Search for `.filter()`, `.map()`, `.slice()` on arrays > 100 elements inside hot paths.
    *   **Main Thread Blocking**: Identify `for` loops > 1000 iterations running synchronously.
    *   **Signal Thrashing**: Search for `effect()` or `computed()` reading signals updated at 60fps (e.g., `physicsTime`, `renderTime`).

## 2. Execution Template
Output the optimization using this structure:

```typescript
// [TARGET]: ClassName.methodName
// [ISSUE]: Allocation of X objects per frame.
// [FIX]: Implemented Object Pooling / Scalar Passing / Zero-Alloc Pattern.

// ... optimized code ...
```

## 3. Heuristic Database (Dynamic)
*   **ECS Iteration**: Use `for(i=0; i<len; i++)` over `.forEach`.
*   **Physics Sync**: Use `syncActiveBodies` callback with scalars (x, y, z...) instead of Objects.
*   **Math**: Use `gl-matrix` style in-place mutation (e.g., `vec.add(v)`) over immutable ops (`vec.clone().add(v)`).
*   **Culling**: Update `SpatialGrid` only on movement `delta > epsilon`.
*   **Events**: Use `Subject.next()` over creating new Event objects.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After applying an optimization, perform the **Mutation Check**:
1.  **Discovery**: Did you identify a new type of bottleneck not listed in Section 1 or 3?
2.  **Action**: If yes, **APPEND** the new pattern to the `Heuristic Database` or `Diagnosis Routine` in this file immediately.
    *   *Goal*: The `Diagnosis Routine` should become a comprehensive list of all known anti-patterns over time.
3.  **Logging**: Append the specific optimization result to `src/docs/optimization-report.md`.