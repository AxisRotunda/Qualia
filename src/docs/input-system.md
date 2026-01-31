
# Input System
> **Scope**: Hardware Abstraction, Controller Logic, Virtual Inputs.
> **Source**: `src/services/game-input.service.ts`, `src/engine/input-manager.service.ts`
> **Reference**: See `[Math & Algorithms](./math-algorithms.md)` for normalization formulas.

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
*   `getMoveDir()`: Combines WASD/ArrowKeys + Virtual Joystick.
    *   $V_{out} = Normalize(V_{key} + V_{virtual})$.
    *   Clamped to magnitude 1.0.
*   `getLookDelta()`: Combines Mouse Delta + Virtual Look Joystick.
    *   **Sensitivity Matching**: $Delta = Mouse_{px} + (Joystick_{norm} \cdot SensitivityFactor)$.
    *   $SensitivityFactor \approx 15.0$ to match pixel-movement feel.
*   `getAscend()`: Space/Shift + Virtual Buttons.

## 2. Pointer Semantic Layer (`PointerListenerService`)
Parses raw pointer events into semantic actions.
*   **Click**: `PointerDown` + `PointerUp` < 500ms duration & < $20px^2$ distance.
*   **Long Press**: `PointerDown` > 600ms without significant move. Triggers Context Menu.
*   **Drag**: Movement > threshold. Sets `isDragging` signal.

## 3. Strategy Layer (`InputManagerService`)
Orchestrates specific controllers based on `EngineState.mode`.

| Mode | Controller Service | Description |
|------|--------------------|-------------|
| `edit` | `CameraControlService` | OrbitControls (Three.js). Damped spherical coordinates. |
| `walk` | `CharacterControllerService` | FPS-style WASD + Physics Capsule + Head Bob (Sine Wave). |
| `explore` | `FlyControlsService` | Free-flight 6DOF. Inertia Lerp: $v = lerp(v, target, dt \cdot damping)$. |

## 4. Object Control (`ObjectManipulationService`)
*   **Context**: Active only in `edit` mode when `selectedEntity != null`.
*   **Inputs**: `move` (Left Stick), `rotLift` (Right Stick).
*   **Action**:
    *   **Translate**: Physics Grab (Spring Joint). Target position offset relative to Camera Basis.
    *   **Rotate/Scale**: Direct ECS Transform modification + Physics Sync.
