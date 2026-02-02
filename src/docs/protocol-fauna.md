
# [PROTOCOL] Biological Logic (Fauna)
> **Trigger**: `RUN_FAUNA`
> **Target**: `src/engine/features/fauna/`, `src/services/generators/actor/`
> **Version**: 1.4 (Volume Conservation Update)
> **Axiom**: "Intelligence is reaction. Locomotion is cyclic. Life is state-driven."

## 1. Analysis Routine
1.  **Autonomous Sovereignity**:
    *   Scan for AI logic inside `Scene.onUpdate`.
    *   **Violation**: Fauna logic must be encapsulated in a `BehaviorSystem` or dedicated `AgentController`.
2.  **Locomotion Sync**:
    *   Verify gait speed matches translation velocity.
    *   **Violation**: "Skating" artifacts (feet sliding over floor).
3.  **Perception Scan**:
    *   Identify how agents detect the world. 
    *   **Requirement**: Agents MUST use `RaycasterService` or `SpatialGrid` for perception, not `world.entities` iteration.
4.  **Physics Authority**:
    *   Fauna must use `RigidBodyType.KinematicPositionBased` for primary actors to allow collision-aware AI navigation.

## 2. Refinement Strategies
*   **Steering Logic (Boids)**:
    *   **Wander**: Use Reynolds' "Circle Wander" algorithm for organic, curvy paths instead of linear waypoint seeking.
    *   **Separation**: Apply inverse-square repulsion vectors from neighbors in `SpatialGrid`.
*   **State Machine (FSM)**:
    *   Required states for non-player lifeforms: `IDLE`, `WANDER`, `FLEE`, `FEED`.
    *   Store state in `AgentStore` (Int8 buffer) for cache locality.
*   **Animation Layering**:
    *   Use `AnimationControlService` to blend between walk/run cycles based on `velocity.length()`.
*   **LOD Behavior**:
    *   Distant agents (> 100m) should disable raycast-perception and switch to simple linear interpolation between waypoints.

## 3. Visual Standard (Rendering)
*   **Swarm Animation**:
    *   **Constraint**: For counts > 50, Skeletal Animation (`SkinnedMesh`) is forbidden.
    *   **Technique**: Use **Vertex Displacement Shaders** (Math-driven) or **VAT** (Baked Texture Animation).
    *   **Volume Conservation**: Procedural deformation MUST implement Squash & Stretch (`y_scale = 1/sqrt(xz_scale)`) during jumps/impacts to maintain biological mass.
*   **Integument (Fur/Feathers)**:
    *   **Technique**: Use **Shell Texturing** (Multi-pass geometry) OR **Rim-Fuzz** (Fresnel + Noise Shader) for mobile optimization.
    *   **Constraint**: Limit to < 16 shells if using geometry. Prefer Rim-Fuzz for small actors (< 1m).
*   **Shadows**:
    *   Small fauna (< 1m) should use baked Blob Shadows or disable `castShadow` at LOD1 to save Shadow Map resolution.

## 4. Anatomy Builder (Genesis Routine)
To add a new fauna asset, use the **Symmetry Mirror** pattern in `ActorDesignService`.

1.  **Define Body**: Use primitives (Box/Cylinder) for Torso/Head.
2.  **Define Limb**: Create a single `generateLimb(side: -1 | 1)` helper.
3.  **Assembly**:
    ```typescript
    parts.push(generateLimb(-1)); // Left
    parts.push(generateLimb(1));  // Right
    ```
4.  **Micro-Detail**: Apply bolts/seams *after* symmetry to break repetition if needed, or mirror them for industrial uniformity.

## 5. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: For small swarm fauna (Insects/Birds), use 100% GPU-based position updates (InstancedMesh + Shader) to support 1000+ units.
*   *Current Heuristic*: Land-based fauna should use "Whisker Raycasts" (Forward-Left, Forward-Right) to detect obstacles before collision.
*   *Current Heuristic*: "Stop-and-Go" behavior feels more biological than constant movement. Use `AgentStore.timer` to pause agents periodically.
*   *Current Heuristic*: Vertex shader animation phase must be randomized based on World Position (`hash(pos.xz)`) to prevent "synchronized dancing" in herds.

## 6. Meta-Update (Self-Optimization)
**INSTRUCTION**: After implementing a fauna complex, perform the **Mutation Check**:
1.  **Jitter**: Do agents vibrate when touching walls?
2.  **Correction**: Increase the `offset` parameter in the `KinematicCharacterController` or improve steering repulsion.
