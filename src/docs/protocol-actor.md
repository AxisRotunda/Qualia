# [PROTOCOL] Actor Synthesizer
> **Trigger**: `RUN_ACTOR`
> **Target**: `src/engine/ecs/entity-assembler.service.ts`, `src/engine/features/animation-control.service.ts`
> **Version**: 1.0 (Genesis)
> **Axiom**: "An Actor is a stack of components, not a single mesh. Identity is the handle; Behavior is the update."

## 1. Analysis Routine
1.  **Component Stack Audit**:
    *   Verify the entity has: `MeshRef`, `Transform`, `RigidBodyRef`, `AnimationRef`, and `Name`.
    *   **Violation**: Animated entities without a Kinematic/Dynamic body are "Zombies" (they don't interact with the world).
2.  **Skeleton Integrity**:
    *   Check for `root` bone alignment. 
    *   **Requirement**: Root must be at `(0, 0, 0)` for correct placement on floor heightfields.
3.  **Performance Check**:
    *   Count total bones. If > 60 for non-hero actors, flag for simplification.

## 2. Refinement Strategies
*   **The Actor Scaffold**:
    1.  **Spawn**: Use `EntityAssembler`.
    2.  **Animate**: Initialize `AnimationControlService` with clips (`walk`, `idle`, `action`).
    3.  **Logic**: Attach an FSM or simple logic hook in `onUpdate`.
*   **First-Person Isolation**:
    *   Maintain distinct `viewMode` logic. In FP, primary mesh MUST be hidden to prevent interior face clipping.
*   **Transition Hygiene**:
    *   Always use a `0.3s` cross-fade between locomotion states (Idle -> Walk).

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: Character actors feel "heavier" if the head-bob frequency matches the walk animation stride speed exactly.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After creating an Actor, perform the **Mutation Check**:
1.  **T-Pose**: Did the actor spawn in T-pose for one frame?
2.  **Correction**: If yes, update `AnimationControlService` to `mixer.update(0)` immediately upon initialization to force the first frame.