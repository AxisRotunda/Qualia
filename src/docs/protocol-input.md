
# [PROTOCOL] Input Standard
> **Trigger**: `RUN_INPUT`
> **Target**: `src/services/input/`, `src/engine/input/`
> **Version**: 1.5 (Abstraction Layer Update)
> **Axiom**: "The Controller is an extension of the Will. Latency is failure."

## 1. Analysis Routine
1.  **Abstraction Check**:
    *   Scan for hardcoded keycodes (`KeyW`, `ArrowUp`) in Gameplay Logic AND Service layers.
    *   **Violation**: Logic must bind to **Semantic Actions** (`MOVE_FORWARD`, `JUMP`), not Keys. `GameInputService` should map Keys -> Actions, and Controllers should read Actions.
    *   **Critical Gap**: Current implementation mixes Key polling directly in `getMoveDir()`.
2.  **Device Agnosticism**:
    *   Ensure every Action has a binding for: Keyboard/Mouse, Touch (Virtual Joystick), and Gamepad (Standard Mapping).
3.  **Haptic Audit**:
    *   Verify `navigator.vibrate()` is called for tactile feedback on Mobile during high-impact events (Collision, UI Error, Selection, Grab).
4.  **Input Delta Audit**:
    *   Identify if Joysticks are treated as Deltas. 
    *   **Violation**: Joysticks are absolute axis positions. They must be treated as **Velocity** and multiplied by `dt` in the controller logic.

## 2. Refinement Strategies
*   **Action Mapping**:
    *   Maintain a central registry `InputMap` defining `Action -> Key[] | Button[]`.
    *   Implement `InputMappingService` to allow runtime re-binding.
*   **Analog Normalization**:
    *   All analog inputs (Mouse Delta, Joystick, Trigger) must be normalized to `-1.0` to `1.0` range before reaching the Controller Logic.
    *   Apply **Deadzone** (min 0.1) to all Gamepad axis reads.
    *   **Polarity Standard**: UP (North) must always map to Positive Y in the normalized delta.
*   **Response Curves**:
    *   Apply **Power Curves** (`sign(v) * v^k`, k=2.2) to joystick inputs to allow for high precision near the center while maintaining top speed at the perimeter.
*   **Mobile Scaling**:
    *   **Rule**: Apply a `2.0x - 3.0x` sensitivity multiplier for "Look" actions on mobile devices to compensate for the narrow thumb-track range compared to desktop mouse pads.
*   **Haptic Layers**:
    *   **Selection**: 10ms pulse.
    *   **Grab/Action**: 20ms thrum.
    *   **Collision**: Variable duration based on impulse magnitude.
*   **Temporal Scaling**:
    *   Always scale Virtual Joystick "Look" and "Move" inputs by `dt`.
    *   Formula: `Movement += JoystickPos * Speed * dt`.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: On mobile, the "Look" sensitivity usually needs to be 2.5x higher than desktop mouse sensitivity.
*   *Current Heuristic*: Instantaneous character turning (`TURN_SMOOTHING > 20.0`) feels better for mobile FPV than high inertia.
*   *Current Heuristic*: Standard FPS controls require additive Pitch (`pitch += look.y`). Flight controls require subtractive Pitch (`pitch -= look.y`) for the "Inverted" feel.
*   *Current Heuristic*: Gamepad support requires polling in the `requestAnimationFrame` loop; events are unreliable.
*   *Current Heuristic*: Pointer capture on joysticks prevents losing control during aggressive swipes.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After updating input logic, perform the **Mutation Check**:
1.  **Drift**: Does the camera move when the controller is idle?
2.  **Correction**: Increase Deadzone threshold in `Refinement Strategies`.
3.  **Sensitivity**: Did the joystick spinning feel too fast?
4.  **Correction**: Check if `dt` scaling was applied twice or missed. Ensure curves are normalized.
