
# [PROTOCOL] Animation Director
> **Trigger**: `RUN_ANIM`
> **Target**: `src/engine/animation/`, `src/services/animation/`
> **Version**: 1.2 (Zero-Alloc Update)
> **Axiom**: "Motion conveys emotion. Blending is fluid. Snapping is jarring."

## 1. Analysis Routine
1.  **Mixer Hygiene**:
    *   Check for `mixer.update(dt)` calls.
    *   **Violation**: Mixers must be managed by a central `AnimationSystem` to ensure they pause when the `EngineState` is paused.
2.  **Clip Management**:
    *   Scan for hardcoded clip names (`play('Walk')`).
    *   **Requirement**: Use typed Enums or String Unions for clip names to prevent runtime errors.
3.  **Performance Check**:
    *   Verify `cullFromInvisible` is enabled on `AnimationAction` where possible.
    *   **Optimization**: Check loop implementations. Using inline arrow functions in `forEach` inside `update()` is forbidden. Use bound class methods.

## 2. Refinement Strategies
*   **Controller Pattern**:
    *   Wrap `THREE.AnimationMixer` in an `AnimationController` class.
    *   Expose semantic methods: `fadeTo(clip, duration)`, `setWeight(clip, weight)`.
*   **Procedural Layering**:
    *   **IK (Inverse Kinematics)**: For feet placement on uneven terrain (`RUN_TERRAIN`).
    *   **LookAt**: Head bone tracking camera or target.
    *   **Blend Trees**: For mixing Walk/Run based on velocity magnitude.
    *   **Viewmodel Animation**: For First-Person items, use procedural code (Sway, Bob, Recoil) instead of baked animations to maintain frame-rate independence and responsiveness.
*   **Optimization**:
    *   Lower update rate for distant entities (every 2nd or 3rd frame).
    *   **Bound Callbacks**: In systems iterating over components, define the callback as `private readonly cb = (val, entity) => { ... }` to avoid per-frame allocation.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: Linear interpolation for animation blending often looks robotic. Use `smoothstep` weighting or non-linear easing (`t^2`, `elasticOut`) for more organic transitions.
*   *Current Heuristic*: For mechanical assets (`RUN_KINEMATICS`), procedural rotation of parts (gears, pistons) based on math is often cleaner than baked keyframe animation.
*   *Current Heuristic*: Viewmodel sway should include a rotational component (Wrist Lag) opposite to the camera movement to simulate weight.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After implementing animation, perform the **Mutation Check**:
1.  **Sliding**: Do feet slide while walking?
2.  **Correction**: If yes, tune the playback speed to match `CharacterController` velocity, or implement `Root Motion` logic.
