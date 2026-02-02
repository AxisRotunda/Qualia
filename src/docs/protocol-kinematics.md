
# [PROTOCOL] Kinematics & Machinery
> **Trigger**: `RUN_KINEMATICS`
> **Target**: `src/engine/systems/`, `src/content/algorithms/`, `src/services/`
> **Version**: 1.0 (Genesis)
> **Axiom**: "Movement without Force requires Authority. Kinematics must govern Physics, not fight it."

## 1. Analysis Routine
1.  **Transform Hygiene Scan**:
    *   **Grep**: `mesh.position.set(...)` or `transform.position.y += ...` inside `update()` loops.
    *   **Violation**: Direct manipulation of Visuals or ECS Transforms for objects with `RigidBody` components is **forbidden**. It causes visual jitter and physics tunneling.
    *   **Correction**: Must use `PhysicsWorld.updateBodyTransform` or `body.setNextKinematicTranslation`.
2.  **Body Type Integrity**:
    *   Identify objects moved via code (Elevators, Doors).
    *   **Verify**: They MUST be initialized as `RigidBodyType.KinematicPositionBased`.
    *   **Violation**: Moving a `Dynamic` body manually breaks the physics solver's energy conservation (creates "God Force").
3.  **Passenger Logic Check**:
    *   If a platform moves, do standing entities move with it?
    *   **Requirement**: Kinematic platforms require high friction or explicit velocity transfer to passengers.

## 2. Refinement Strategies
*   **Kinematic Driver Pattern**:
    *   Create a specific `Logic` class (e.g., `ElevatorLogic`) or `System` (e.g., `KinematicSystem`).
    *   **Input**: Target Position, Speed/Duration, Easing Function.
    *   **Output**: In `update(dt)`, calculate next position. Call `body.setNextKinematicTranslation(pos)`.
    *   **Sync**: Let `EntityTransformSystem` handle the Visual update in the next frame (Physics drives Visuals).
*   **State Machines**:
    *   Machinery must have explicit states: `IDLE`, `MOVING`, `LOCKED`, `ERROR`.
    *   Avoid boolean flags (`isMoving`). Use Enums.
*   **Interpolation**:
    *   Use `MathUtils.smoothstep` or `lerp` for organic machinery start/stop.
    *   Never snap position instantly > 0.1m/frame unless teleporting.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: For fast-moving elevators (> 5m/s), standard friction isn't enough to keep characters glued. Apply a temporary downward force ("Artificial Gravity") to characters grounded on the platform.
*   *Current Heuristic*: Kinematic rotation is more expensive than translation in Rapier. Optimize rotational machinery by reducing update frequency if distant.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After implementing kinematics, perform the **Mutation Check**:
1.  **Jitter**: Did the passenger vibrate when the elevator moved?
2.  **Correction**: If yes, ensure the Kinematic update happens *before* the Physics Step in `EngineRuntime`.
3.  **Expansion**: If implementing complex chains (IK), create a separate `RUN_IK` protocol.
