# Input System
> **Scope**: Hardware Abstraction, Controller Logic, Virtual Inputs.
> **Source**: `src/services/game-input.service.ts`, `src/engine/input-manager.service.ts`
> **Version**: 1.5 (Path Sync)

## 1. Hardware Layer (`GameInputService`)
Normalizes Keyboard, Mouse, and Touch inputs into unified state.

### 1.1 State & Optimization
*   **Action Mapping**: Logic binds to `InputAction` (e.g., `MOVE_FORWARD`).
*   **Virtual State**: `virtualMove`, `virtualLook`, `virtualJump`, `virtualRun`.
*   **Optimization (RUN_OPT)**: Uses internal `_moveDir` and `_lookDelta` buffers. Methods return references to these buffers instead of creating new objects per call.

### 1.2 Accessors
*   `getMoveDir()`: Combines WASD/ArrowKeys + Virtual Joystick.
*   `getLookDelta(dt)`: Combines Mouse Delta + Temporal Virtual Look.
*   `getAscend()`: Space/Shift + Virtual Buttons.

## 2. Pointer Semantic Layer (`PointerListenerService`)
Parses raw pointer events into semantic actions.
*   **Click**: `PointerDown` + `PointerUp` < 500ms and low distance.
*   **Long Press**: 600ms hold. Triggers Context Menu.

## 3. Strategy Layer (`InputManagerService`)
Orchestrates specific controllers based on `EngineState.mode`.

| Mode | Controller Service | Location |
|------|--------------------|----------|
| `edit` | `CameraControlService` | `src/engine/controllers/camera-control.service.ts` |
| `walk` | `CharacterControllerService` | `src/engine/controllers/character-controller.service.ts` |
| `explore` | `FlyControlsService` | `src/engine/controllers/fly-controls.service.ts` |

## 4. Response & Feedback (RUN_INPUT)
*   **Precision Curves**: Analog inputs apply a Quadratic Curve to provide high-precision control at low stick tilt.
*   **Haptics**:
    *   `Character.Jump` -> 15ms pulse.
    *   `Combat.Fire` -> Variable recoil thrum.
    *   `Interaction.Select` -> 10ms pulse.