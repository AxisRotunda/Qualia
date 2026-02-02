
# [PROTOCOL] Artificial Intelligence
> **Trigger**: `RUN_AI`
> **Target**: `src/engine/ai/`, `src/content/algorithms/`
> **Version**: 1.0 (Genesis)
> **Axiom**: "Intelligence is reaction. State is explicit. Agents are expensive."

## 1. Analysis Routine
1.  **Update Loop Audit**:
    *   Scan for logic files performing direct `position.add()` or `rotation.set()` on entities based on conditions.
    *   **Violation**: Hardcoded behavior logic inside `Scene.onUpdate`. Move to `BehaviorSystem` or specific Logic Classes (e.g., `CityTrafficLogic`).
2.  **State Management**:
    *   Identify "Flag Soup" (e.g., `isWalking`, `isAttacking`, `isDead` booleans on the same class).
    *   **Recommendation**: Refactor to **Finite State Machine (FSM)** or **Behavior Tree** pattern if states > 3.
3.  **Spatial Query Check**:
    *   Verify AI isn't iterating `world.entities` to find targets. usage of `SpatialGrid` or `Physics.interactionGroups` is mandatory for perception checks.

## 2. Refinement Strategies
*   **Steering Behaviors**:
    *   Prefer **Forces** (Steering) over **Translation**.
    *   Formula: `Steering = DesiredVelocity - CurrentVelocity`. Apply as `Force` or `Impulse` to Physics Body to maintain physical consistency.
*   **Pathfinding**:
    *   **Flow Fields**: For crowds (Traffic, Swarms), use Vector Fields (Flow Maps) instead of A* for every unit.
    *   **Navigation**: If A* is required, it must run in a Web Worker to prevent frame drops.
*   **LOD (Level of Detail)**:
    *   AI logic must throttle based on distance.
    *   < 50m: Update every frame.
    *   > 50m: Update every 10 frames.
    *   > 200m: Hibernate (Simulation stops, only data persists).

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: For vehicle traffic, simple "lane following" (spline interpolation) is 10x faster than physical steering and sufficient for non-hero cars.
*   *Current Heuristic*: Use Raycasts for "Whiskers" (obstacle avoidance) only when `velocity.lengthSq() > 0.1`.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After implementing AI, perform the **Mutation Check**:
1.  **Swarm Performance**: Did 100 agents drop FPS < 50?
2.  **Correction**: Implement **Instanced Logic** (update arrays in batch) or move logic to `GPU Compute Shader` (future).
