# [PROTOCOL] Lens & Narrative (Cinematics)
> **Trigger**: `RUN_CINEMATIC`
> **Target**: `src/engine/graphics/camera-manager.service.ts`, `src/engine/controllers/`
> **Version**: 1.0 (Genesis)
> **Axiom**: "The Camera is the Observer. Motion defines Emotion. Scale requires Perspective."

## 1. Analysis Routine
1.  **Frustrum Integrity**:
    *   Check `near` and `far` planes. 
    *   **Violation**: `near < 0.05` causes depth buffer precision issues (z-fighting).
2.  **Transition Damping**:
    *   Verify `OrbitControls` or `CameraManager` easing. 
    *   **Requirement**: "Hard Realism" forbids instant snaps. All movements must use `lerp` or `smoothstep`.
3.  **POV Consistency**:
    *   Ensure `eyeLevel` remains constant during locomotion unless explicitly performing a "Crouch" or "Landing" state.

## 2. Refinement Strategies
*   **Cinematic Presets**:
    *   **The Drone**: High-angle, slow orbital glide with FOV > 80.
    *   **The Macro**: Extremely low angle, narrow FOV (30) for ground-level scale reference.
*   **FOV Pumping**:
    *   Dynamically increase FOV during high velocity (`RUN_ACTOR`) to enhance the perception of speed.
*   **Dynamic Clipping**:
    *   Increase `far` plane during "Areal View" transitions and reduce it during "Interior" scenes to optimize shadow map resolution.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: Transitioning from 1st to 3rd person feels most physical when the duration is exactly `0.5s` with an `ease-in-out` curve.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After tuning a cinematic sequence, perform the **Mutation Check**:
1.  **Nausea Check**: Did rapid rotation trigger visual artifacts?
2.  **Action**: Implement a "Motion Blur" intensity boost during fast camera rotations in `RUN_POST`.