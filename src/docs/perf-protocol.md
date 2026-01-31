
# Performance Optimization Protocol (POP)
> **Role**: System Architect / Performance Engineer
> **Context**: Qualia 3D (Angular 19+, Zoneless, Rapier, Three.js)
> **Input**: `src/docs/optimization-report.md` (Current State)

## 1. Analysis Directive
You are tasked with analyzing the runtime performance of Qualia 3D.
1.  **Read `src/docs/optimization-report.md`** to understand previous bottlenecks.
2.  **Scan critical loops**:
    *   `PhysicsSystem.update()`
    *   `RenderSystem.update()`
    *   `EntityTransformSystem.syncPhysicsTransforms()`
3.  **Identify Bottlenecks**: Look for object allocations (GC), O(N^2) loops, or heavy synchronous computations on the main thread.

## 2. Heuristics & Constraints
*   **Zero-Allocation**: Hot loops must not allocate new Objects/Vectors/Arrays. Reuse buffers or pass scalars.
*   **Zoneless**: Do not introduce `Zone.js` or standard Angular change detection triggers. Use Signals.
*   **Workers**: Offload Procedural Generation (Textures/Terrain) to workers.
*   **Throttling**: Spatial structures (Hash/Grid) should only update on meaningful movement (delta > epsilon).

## 3. Execution Template
If optimization is required, generate a response following this structure:

### Phase 1: Diagnosis
*   **Target**: [Class/Method Name]
*   **Issue**: [Description of bottleneck, e.g., "Allocates 2 Vectors per entity per frame"]
*   **Metric**: [Estimated impact, e.g., "120k allocs/sec at 60fps"]

### Phase 2: Implementation
Provide the optimized code replacing the inefficient logic.
*   **Pattern**: [e.g., Object Pooling, Scalar Passing, Bitmasking]

### Phase 3: Reporting
Update `src/docs/optimization-report.md` with the new findings.

## 4. Invariant Checklist
*   [ ] Does the optimization break the `Physics -> ECS -> Visuals` sync flow?
*   [ ] Does it maintain the separation of concerns (Facade Pattern)?
*   [ ] Is it compatible with `provideZonelessChangeDetection`?

**Command**: Run this protocol on the codebase to identify the next highest-impact optimization.
