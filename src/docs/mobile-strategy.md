
# Mobile Strategy
> **Scope**: Touch Inputs, Gestures, Mobile UI Patterns, Performance on Mobile.
> **Source**: `src/components/ui/touch/`, `src/services/game-input.service.ts`

## 1. Touch Input Normalization
Mobile inputs are converted into "Virtual Hardware" states in `GameInputService`.

*   **Virtual Joystick (Left)** -> Maps to `WASD` (Move).
*   **Virtual Joystick (Right)** -> Maps to `Mouse Delta` (Look).
*   **Virtual Buttons**:
    *   `Jump` -> Maps to `Space`.
    *   `Run` -> Maps to `Shift`.

## 2. Control Layers (`TouchControlsComponent`)
The touch interface changes based on the user's context (Mode & Selection).

### 2.1 Camera Layer (Default)
*   **Active**: When `ControlMode == 'camera'`.
*   **Left Stick**: Move Character / Pan Camera.
*   **Right Stick**: Look / Orbit Camera.
*   **Actions**: Jump Button (Walk Mode only).

### 2.2 Object Layer (Manipulation)
*   **Active**: When `ControlMode == 'object'` (Requires Selection).
*   **Left Stick**: Translate X/Z (Slide object on ground).
*   **Right Stick**: Translate Y (Lift) / Rotate Y.
*   **Transition**: Toggled via the "GRAB/RELEASE" floating button.

## 3. Drawer System (`MobileDrawersComponent`)
To maximize viewport space, panels are hidden by default.

*   **Left Drawer**: Contains `SceneTree`. Animation: `slide-in-from-left`.
*   **Right Drawer**: Contains `Inspector`. Animation: `slide-in-from-bottom`. Height capped at 60vh.
*   **Trigger**: Toolbar buttons toggle visibility via `LayoutService`.
*   **Backdrop**: Clicking outside the drawer closes it (`LayoutService.closeAllPanels`).

## 4. Performance Heuristics
*   **Raycasting**: Reduced frequency on move.
*   **Gizmo**: Size increased (`1.5x`) for touch targets via `EngineService.setGizmoConfig`.
*   **Reticle**: Visual center marker added in `Walk`/`Explore` modes to aid aiming.

## 5. Context Actions
Floating Action Buttons (FABs) appear based on state:
*   **Selection Active**: Show "Deselect", "Delete", "Grab/Release".
*   **Edit Mode**: Show Transform Toolbar (Translate/Rotate/Scale pills).
