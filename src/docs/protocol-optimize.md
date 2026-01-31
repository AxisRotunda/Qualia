
# [PROTOCOL] Optimization Engine
> **Trigger**: `RUN_OPT`
> **Target**: Runtime Performance (FPS, Memory, GC).
> **Input**: `src/docs/optimization-report.md`
> **Version**: 1.9 (Self-Learning: Copy & Redundancy)

## 1. Diagnosis Routine
1.  **READ** `src/docs/optimization-report.md` for current bottlenecks.
2.  **SCAN** target files using these evolved heuristics:
    *   **Math Allocations**: Search for `new Vector3`, `new Quaternion`, `new Matrix4` inside `update()`, `render()`, or `tick()` methods.
    *   **Color Allocations**: Search for `new Color()` or `new Fog()` inside `update()` loops (e.g., Day/Night cycles).
    *   **Factory Churn**: Identify config factories (e.g., `() => ({ ... })`) being called repeatedly in hot loops instead of cached.
    *   **Array Churn**: Search for `.filter()`, `.map()`, `.slice()` on arrays > 100 elements inside hot paths.
    *   **Find vs Filter**: Search for `.filter(...)[0]` or `.filter(...)[length-1]`. Replace with `.find(...)` or loop.
    *   **Set Iteration**: Identify `Set.forEach` or `for(const x of Set)` in hot loops. Sets are slower than Arrays.
    *   **Main Thread Blocking**: Identify `for` loops > 1000 iterations running synchronously.
    *   **Signal Thrashing**: Search for `effect()` or `computed()` reading signals updated at 60fps (e.g., `physicsTime`, `renderTime`).
    *   **Physics Argument Allocation**: Search for object literals `{x, y, z}` passed to `applyImpulse` or `applyForce` in loops.
    *   **Closure Allocation**: Search for `(item) => { ... }` defined inside loop bodies or `forEach` calls in `update()` methods.
    *   **Vertex Loop Allocation**: Search for `new Vector3()` inside `for` loops iterating over BufferAttributes.
    *   **Getter Allocation**: Search for methods returning `{ ... }` or `[ ... ]` called in loops.
    *   **Redundant Checks**: Search for `has(key)` immediately followed by `get(key)` or `set(key)` on the same collection if the latter method safely handles missing keys.
    *   **Scene Graph Search**: Identify `scene.children.find(...)` or `scene.traverse(...)` inside `update()` loops. Replace with direct dependency injection or caching.

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
*   **Collection Types**: Prefer `Array` + Swap-and-Pop for hot lists. Use `Set` only for existence checks, not iteration.
*   **Physics Sync**: Use `syncActiveBodies` callback with scalars (x, y, z...) instead of Objects.
*   **Math/Color**: Use `gl-matrix` style in-place mutation (e.g., `vec.add(v)`, `col.lerp(c)`) over immutable ops (`vec.clone().add(v)`).
*   **Culling**: Update `SpatialGrid` only on movement `delta > epsilon`.
*   **Events**: Use `Subject.next()` over creating new Event objects.
*   **Argument Reuse**: For physics calls (Rapier), use a persistent scratch object and mutate its properties (`_scratch.x = ...`) instead of creating `{x:...}` literals.
*   **Callbacks**: Use bound class methods (`private cb = () => {}`) instead of inline arrow functions for repeated calls.
*   **Filtering**: Use `.find()` instead of `.filter()` when only the first match is needed to avoid allocating a new array.
*   **Config Caching**: If a config object is generated via function, cache the result if the inputs haven't changed, especially in `update()` loops.
*   **Return Values**: Prefer `copyTo(target)` pattern over returning new objects for frequent getters.
*   **Geometry Generation**:
    *   **Clone over New**: In generators, create a base `BufferGeometry` once and use `.clone()` inside loops. `new BoxGeometry` calculates internal topology every time; `clone` copies buffers (faster).
    *   **Zero-Alloc Vertex loops**: When modifying vertex positions in a loop, allocate `const v = new Vector3()` *outside* the loop and reuse it with `.fromBufferAttribute(pos, i)`.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After applying an optimization, perform the **Mutation Check**:
1.  **Discovery**: Did you identify a new type of bottleneck not listed in Section 1 or 3?
2.  **Action**: If yes, **APPEND** the new pattern to the `Heuristic Database` or `Diagnosis Routine` in this file immediately.
    *   *Goal*: The `Diagnosis Routine` should become a comprehensive list of all known anti-patterns over time.
3.  **Logging**: Append the specific optimization result to `src/docs/optimization-report.md`.