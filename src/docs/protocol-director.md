
# [PROTOCOL] The Director (Timeline)
> **Trigger**: `RUN_DIRECTOR`
> **Target**: `src/engine/features/director/`, `src/engine/systems/cinematic.system.ts`
> **Version**: 1.0 (Genesis)
> **Axiom**: "The Cut is the Blink. Pacing is the Heartbeat. Control is Illusion."

## 1. Analysis Routine
1.  **State Transition Audit**:
    *   Identify manual `camera.position.lerp` calls in `Scene.onUpdate`.
    *   **Violation**: Ad-hoc transitions are hard to sequence. Move to `TimelineService`.
2.  **Pacing Check**:
    *   Verify `TimeScale` usage during events.
    *   **Heuristic**: "Impact Frames" (TimeScale 0.0 for 50ms) significantly improve combat feel.
3.  **Letterbox Integrity**:
    *   Ensure UI elements (HUD) are hidden or masked during "Cutscene" state.

## 2. Refinement Strategies
*   **The Timeline**:
    *   Implement a `Keyframe` system: `{ time: 0, command: 'CAM_MOVE', target: 'Hero' }`.
    *   Support `Tracks`: Camera, Time, PostProcess, UI.
*   **Attract Mode**:
    *   If user input idle > 30s, trigger `Director.autoCam()`.
    *   Cycle through interesting entities using `VisibilityManager` visibility scoring.
*   **Dynamic Framing**:
    *   **Rule of Thirds**: Offset camera target based on subject velocity.
    *   **Dutch Angle**: Apply Z-rotation during high-stress states (Low Health + High Velocity).

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: Cuts should happen on the "beat" of physics impacts, not arbitrary timers.
*   *Current Heuristic*: When slowing time (`RUN_CHRONOS`), strictly maintain Camera Velocity (unscaled) to emphasize the slowness of the world.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After sequencing a cutscene, perform the **Mutation Check**:
1.  **Disorientation**: Did the camera jump > 180 degrees between cuts?
2.  **Correction**: Enforce the "180 Degree Rule" in the `Director` logic to maintain spatial continuity.
