# [PROTOCOL] Systemic Repair (Healer)
> **Trigger**: `RUN_REPAIR`
> **Target**: `src/engine/systems/`, `src/physics/optimization/`
> **Version**: 1.0 (Genesis)
> **Axiom**: "Chaos is entropic. Stability is enforced. The World must not break."

## 1. Analysis Routine
1.  **NaN Detection**:
    *   Scan `EntityTransformSystem` for checks against `Number.isNaN` or `Infinity`.
    *   **Violation**: Physics engines can occasionally produce NaNs on high-impulse collisions.
2.  **Boundary Audit**:
    *   Check for entities with `y < -100` or `dist > 1000`.
    *   **Requirement**: "The Void" must be purged. Entities leaving the active simulation radius must be hibernated or destroyed.
3.  **Orphan Check**:
    *   Identify RigidBodies in Rapier with no corresponding ECS entity.
    *   Identify Meshes in Three.js with no corresponding ECS entity.

## 2. Refinement Strategies
*   **Sanity Guards**:
    *   Implement a `RepairSystem` (Priority 210, post-physics).
    *   **Logic**: If `pos.y` is NaN, reset to `(0, 5, 0)` and zero out velocity.
*   **Entropic Purge**:
    *   Automatically destroy `debris` tagged entities if they fall below the ground plane for > 5 seconds.
*   **State Reconciliation**:
    *   If `PhysicsRegistry` lookup fails during a sync, forcefully remove the orphaned body from the world.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: High angular velocity (> 100 rad/s) is a precursor to physics "explosions." Clamp maximum angular velocity in `ShapesFactory`.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After a simulation crash, perform the **Mutation Check**:
1.  **Root Cause**: What broke?
2.  **Action**: Add a new specific "Sanity Guard" to Section 2.