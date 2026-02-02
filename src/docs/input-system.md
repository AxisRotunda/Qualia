
# Input System
> **Scope**: Hardware Abstraction, Controller Logic, Virtual Inputs.
> **Source**: `src/services/game-input.service.ts`, `src/engine/input-manager.service.ts`
> **Version**: 1.3 (Zero-Alloc & Haptics)

## 1. Hardware Layer (`GameInputService`)
Normalizes Keyboard, Mouse, and Touch inputs into unified state.

### 1.1 State & Optimization
*   **Keys**: `Set<string>` (Keyboard codes).
*   **Mouse**: `mouseDelta {x, y}`.
*   **Virtual State**: `virtualMove`, `virtualLook`, `virtualJump`, `virtualRun`.
*   **Optimization (RUN_OPT)**: Uses internal `_moveDir` and `_lookDelta` buffers. Methods return references to these buffers instead of creating new objects per call.

### 1.2 Accessors
*   `getMoveDir()`: Combines WASD/ArrowKeys + Virtual Joystick.
    *   $V_{out} = Normalize(V_{key} + V_{virtual})$.
    *   Clamped to magnitude 1.0.
*   `getLookDelta(dt)`: Combines Mouse Delta + Temporal Virtual Look.
    *   **Sensitivity Matching**: $Delta = Mouse_{px} + (Joystick_{norm} \cdot 800.0 \cdot dt)$.
*   `getAscend()`: Space/Shift + Virtual Buttons.

## 2. Pointer Semantic Layer (`PointerListenerService`)
Parses raw pointer events into semantic actions.
*   **Click**: `PointerDown` + `PointerUp` < 500ms and low distance.
*   **Long Press**: 600ms hold. Triggers Context Menu.

## 3. Strategy Layer (`InputManagerService`)
Orchestrates specific controllers based on `EngineState.mode`.

| Mode | Controller Service | Description |
|------|--------------------|-------------|
| `edit` | `CameraControlService` | OrbitControls with spherial damping. |
| `walk` | `CharacterControllerService` | Physics Capsule + Head Bob Sine Wave. |
| `explore` | `FlyControlsService` | Free-flight 6DOF with velocity inertia. |

## 4. Response & Feedback (RUN_INPUT)
*   **Precision Curves**: Analog inputs apply a Quadratic Curve ($sign(v) \cdot v^2$) to provide high-precision control at low stick tilt.
*   **Haptics**:
    *   `Character.Jump` -> 15ms pulse.
    *   `Interaction.Grab` -> 20ms pulse.
    *   `Interaction.Select` -> 10ms pulse.
