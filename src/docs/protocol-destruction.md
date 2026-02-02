# [PROTOCOL] Fracture Engineer
> **Trigger**: `RUN_DESTRUCTION`
> **Target**: `src/services/generators/`, `src/engine/systems/physics.system.ts`
> **Version**: 1.0 (Genesis)
> **Axiom**: "Stability is temporary. Energy is conserved. Destruction creates detail."

## 1. Analysis Routine
1.  **Fracture Density**:
    *   Identify meshes intended for destruction.
    *   **Violation**: High-poly base meshes with > 50 fracture shards. This will kill physics performance on Mobile.
    *   **Constraint**: Max 12 shards for non-hero props.
2.  **Debris Lifecycle**:
    *   Check if shards have an expiration timer.
    *   **Violation**: Permanent debris that accumulates over time, slowing down the broadphase.
3.  **Material Propagation**:
    *   Ensure shard faces (interior) use a unique "Broken" material (e.g., rough concrete texture) different from the exterior facade.

## 2. Refinement Strategies
*   **Voronoi Partitioning**:
    *   Use procedural point-cloud generation to define fracture planes in `GeoBuilder`.
*   **Impulse-Based Triggering**:
    *   Destruction MUST only occur when `CollisionImpulse > MaterialStrength`.
*   **Instanced Shards**:
    *   For repetitive debris (e.g., glass shards), use `InstancedMesh` with a single shard-topology, varied by scale.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: "Hibernating Shards". Shards should be set to `kinematic` or `fixed` until the parent mesh breaks, then switched to `dynamic` to save CPU cycles.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After a destruction event, perform the **Mutation Check**:
1.  **Physics Jitter**: Did shards fly off at extreme speeds?
2.  **Correction**: Implement an **Impulse Clamp** and increase shard `linearDamping`.