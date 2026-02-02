# [PROTOCOL] Resource Lifecycle
> **Trigger**: `RUN_LIFECYCLE`
> **Target**: `src/engine/ecs/entity-lifecycle.service.ts`, `src/services/`
> **Version**: 1.0 (Genesis)
> **Axiom**: "What is created must be destroyed. Leaks are the death of the world."

## 1. Analysis Routine
1.  **Subscription Scan**:
    *   **Grep**: `subscribe(` without `.pipe(takeUntilDestroyed())`.
    *   **Violation**: All RxJS subscriptions MUST be tied to the component/service lifecycle.
2.  **GPU Buffer Audit**:
    *   Identify calls to `new BufferGeometry()` or `new Texture()`.
    *   **Requirement**: There must be a corresponding `.dispose()` call in the destruction path.
3.  **WASM Boundary Check**:
    *   Verify that `world.removeRigidBody()` is called for every entity removal.
    *   **Violation**: Orphans in the WASM heap cause silent performance degradation.

## 2. Refinement Strategies
*   **The Purge Hook**:
    *   Mandate usage of `entityLifecycle.onEntityDestroyed`. 
    *   Any service creating non-ECS state for an entity (e.g., custom sound loops) MUST listen to this subject.
*   **Factory Tracking**:
    *   `VisualsFactory` and `PhysicsFactory` must keep a weak reference to Bespoke resources to ensure they can be force-purged on `World Reset`.
*   **Zoneless Safety**:
    *   Use `DestroyRef` in all Services for manual cleanup of timer loops (`setInterval`).

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: Most leaks occur when a Scene uses a PointLight or ParticleSystem added directly to `Scene` instead of being parented to an `Entity`. Enforce entity-parenting for all scene objects.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After a manual memory cleanup, perform the **Mutation Check**:
1.  **Root Cause**: Why did the garbage collector fail to reclaim the memory?
2.  **Action**: Add a specific "Disposal Rule" to Section 1 for that resource type.