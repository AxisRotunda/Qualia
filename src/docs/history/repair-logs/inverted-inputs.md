# [REPAIR_LOG] Input Inversion Fix
> **ID**: LOG_INPUT_INVERSION
> **Status**: Applied
> **Date**: Phase 65.3
> **Axiom**: "Up is Up. Down is Down. The Controller must disappear."

## 1. Problem Definition
User reported "inverted inputs" on mobile devices affecting:
1.  **Player Look**: Dragging/Pushing Up looked Down.
2.  **Camera Orbit**: Dragging/Pushing Up moved Camera Up (looking down), contrary to FPS expectations.
3.  **Entity Grab**: Manipulation felt disconnected due to camera reference frame mismatch.

## 2. Root Cause Analysis
The `GameInputService` normalizes inputs as follows:
*   **Mouse Up**: Negative Delta (Screen Y decreases).
*   **Joystick Up**: Positive Axis -> Converted to Negative Delta (`dy - jy`).
*   **Result**: "Up" input produces a **Negative Y** signal.

But the Consumers (`CharacterController`, `CameraControl`) were applying this delta additively:
*   `pitch += look.y` (Negative Input -> Pitch Decrease -> Look Down).
*   **Result**: Up Input = Look Down (Inverted Flight Style).

While "Inverted" is a valid preference for Flight Sims, the standard for FPS and Mobile Touch Interfaces is "Non-Inverted" (Up = Look Up).

## 3. Resolution Strategy
Inverted the sign of delta application in all Controller Services to enforce Standard mapping.

| Controller | Axis | Old Logic | New Logic | Effect |
|---|---|---|---|---|
| **Character** | Pitch (X) | `+= delta` | `-= delta` | Up Input -> Pitch Increase (Look Up) |
| **Fly** | Pitch (X) | `+= delta` | `-= delta` | Up Input -> Pitch Increase (Look Up) |
| **Orbit** | Phi (Y) | `+= delta` | `-= delta` | Up Input -> Phi Decrease (Cam moves Up/Top) |
| **Orbit** | Theta (X) | `-= delta` | `+= delta` | Right Input -> Theta Increase (Orbit Right) |

## 4. Validation
*   **Mouse**: Drag Down (Pos Y) -> Look Down.
*   **Touch**: Drag Down (Pos Y) -> Look Down.
*   **Joystick**: Stick Up (Neg Y equivalent) -> Look Up.

This unifies Mouse, Touch, and Gamepad behaviors under a single Cartesian consistency.