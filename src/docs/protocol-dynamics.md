
# [PROTOCOL] Physics Dynamics
> **Trigger**: `RUN_DYNAMICS`
> **Target**: `src/config/physics-material.config.ts`, `src/physics/logic/mass-calculator.ts`
> **Version**: 1.0 (Genesis)
> **Axiom**: "Interaction is the Soul of the Sandbox. Weight must be felt."

## 1. Analysis Routine
1.  **Mass Ratio Audit**:
    *   Identify pairs of colliding objects where `Mass(A) / Mass(B) > 100`.
    *   **Violation**: Massive mass differences cause solver instability (objects clipping through floors or jittering).
    *   **Correction**: Scale the lighter object's mass or increase solver iterations in `PhysicsOptimizer`.
2.  **Damping Check**:
    *   Scan `ShapesFactory` and `CharacterPhysicsService` for `0.0` damping.
    *   **Violation**: Perfect vacuums are non-physical. All terrestrial dynamic bodies MUST have `linearDamping > 0.01` and `angularDamping > 0.05` to prevent infinite sliding/spinning.
3.  **Restitution Value Check**:
    *   **Violation**: `restitution > 1.0` is prohibited (perpetual motion). 
    *   **Heuristic**: Concrete/Rock should be `< 0.1`. Rubber should be `~0.7`.

## 2. Refinement Strategies
*   **Material Uniformity**:
    *   Ensure all new assets use a material key from `PHYSICS_MATERIALS`. Do not hardcode friction/restitution in `SceneContext` unless it is a "Hero" interaction.
*   **Volume-to-Mass Pipeline**:
    *   Mandate usage of `MassCalculator.resolve()`. If an object feels "wrong," adjust its `density` in the config, not its `mass` in the template.
*   **Impact Response**:
    *   For character interactions, use `CharacterPhysicsService.applyInteractionImpulses`. Ensure the `coupling` factor is proportional to the character's virtual mass.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: Objects under 1kg feel like "popcorn" in the Rapier engine. Bias minimum masses for small props (e.g., Cinderblocks) to at least 5kg for stable stacking.
*   *Current Heuristic*: Friction `1.0` is often necessary for slopes > 20 degrees to prevent constant sliding of static-looking props.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After tuning dynamics, perform the **Mutation Check**:
1.  **Instability**: Did the changes cause "exploding" stacks of objects?
2.  **Correction**: Revert to lower mass ratios and update Section 1 heuristics.
