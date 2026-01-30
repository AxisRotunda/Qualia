
# Control Schemes
> **Scope**: Input Controller Mappings, Mode Switching, Gizmo Behaviors.
> **Source**: `src/engine/controllers/`, `src/engine/input-manager.service.ts`

## 1. Input Modes
The `EngineState.mode` signal determines the active `ControllerService`.

### 1.1 Edit Mode (`CameraControlService`)
*   **Goal**: Scene composition and object manipulation.
*   **Input**: `OrbitControls`.
    *   **Desktop**: RMB to Orbit, MMB to Pan, Wheel to Zoom.
    *   **Mobile**: 1-finger Orbit, 2-finger Pan/Zoom.
*   **UI**: `GizmoManager` is active. Selection allowed.
*   **Cursor**: Standard pointer.

### 1.2 Walk Mode (`CharacterControllerService`)
*   **Goal**: First-person exploration and physics interaction.
*   **Input**: FPS Style.
    *   **Desktop**: WASD to Move, Mouse to Look (Pointer Locked). Space to Jump.
    *   **Mobile**: Virtual Joysticks.
*   **UI**: Gizmo hidden. Reticle visible.
*   **Physics**: Kinematic Capsule collider active.

### 1.3 Explore Mode (`FlyControlsService`)
*   **Goal**: Free-flight debugging and cinematography.
*   **Input**: 6DOF Flight.
    *   **Desktop**: WASD + QE (Up/Down). Mouse Look. Inertia enabled.
    *   **Mobile**: Virtual Joysticks (Left: Move XZ, Right: Look).
*   **UI**: Minimal.

## 2. Object Manipulation Scheme
When an entity is selected in `Edit` mode, control logic forks.

### 2.1 Gizmo Interaction (Desktop Priority)
*   **Trigger**: Clicking `TransformControls` handles (Arrows/Rings).
*   **Behavior**:
    *   Blocks Camera controls.
    *   Directly modifies Mesh Matrix.
    *   `EntityTransformSystem` syncs Physics Body to match Mesh (Teleport).

### 2.2 Physics Grab (Mobile/Joystick Priority)
*   **Trigger**: Activating 'Object' control layer on mobile or specific hotkey.
*   **Behavior**:
    *   Creates `ImpulseJoint` (Spring) between Cursor (Hand) and Object.
    *   Object collides with world while moving.
    *   "Weighty" feel.

## 3. Hotkeys & Shortcuts
Managed by `KeyboardService` and `MenuConfig`.

| Action | Key | Context |
|--------|-----|---------|
| **Tools** | W, E, R | Translate, Rotate, Scale |
| **Focus** | F | Camera looks at Selection |
| **Grid** | G | Toggle Grid |
| **HUD** | H | Toggle UI Visibility |
| **Delete** | Del | Destroy Selection |
| **Duplicate**| Ctrl+D | Clone Selection |
| **Undo** | Ctrl+Z | Revert (Stubbed) |
| **Save** | Ctrl+S | Quick Save |
