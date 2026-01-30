# Input System
> **Scope**: Hardware Abstraction, Controller Logic, Virtual Inputs.
> **Source**: `src/services/game-input.service.ts`, `src/engine/input-manager.service.ts`

## 1. Hardware Layer (`GameInputService`)
Normalizes Keyboard, Mouse, and Touch inputs into unified state.

### 1.1 State
*   **Keys**: `Set<string>` (Keyboard codes).
*   **Mouse**: `mouseDelta {x, y}`.
*   **Pointer Lock**: Tracks lock state for cursor capture.
*   **Virtual State**:
    *   `virtualMove`: `{x, y}` (-1 to 1).
    *   `virtualLook`: `{x, y}` (-1 to 1).
    *   `virtualJump`: `boolean`.
    *   `virtualRun`: `boolean`.

### 1.2 Accessors
*   `getMoveDir()`: Combines WASD/ArrowKeys + Virtual Joystick. Normalized vector.
*   `getLookDelta()`: Combines Mouse Delta + Virtual Look Joystick (scaled).
*   `getAscend()`: Space/Shift + Virtual Buttons.

## 2. Pointer Semantic Layer (`PointerListenerService`)
Parses raw pointer events into semantic actions.
*   **Click**: `PointerDown` + `PointerUp` < 500ms duration & < 20px distance.
*   **Long Press**: `PointerDown` > 600ms without move. Triggers Context Menu.
*   **Drag**: Movement > threshold. Sets `isDragging` signal.

## 3. Strategy Layer (`InputManagerService`)
Orchestrates specific controllers based on `EngineState.mode`.

| Mode | Controller Service | Description |
|------|--------------------|-------------|
| `edit` | `CameraControlService` | OrbitControls (Three.js addon). Mouse/Touch Pan/Rotate. |
| `walk` | `CharacterControllerService` | FPS-style WASD + Physics Capsule + Head Bob. |
| `explore` | `FlyControlsService` | Free-flight camera with inertia and 6DOF look. |

### 3.1 Lifecycle
`setMode(mode)` handles teardown/setup:
1.  **Teardown**: Disable previous controller, exit Pointer Lock if needed.
2.  **Setup**: Initialize new controller, Request Pointer Lock (if explore/walk).

## 4. Object Control (`ObjectControlService`)
*   **Context**: Active only in `edit` mode when `selectedEntity != null`.
*   **Inputs**: `move` (Left Stick), `rotLift` (Right Stick).
*   **Action**: Delegates to `EntityTransformSystem.applyTransformDelta` for sync.