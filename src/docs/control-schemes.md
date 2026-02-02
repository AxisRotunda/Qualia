# Control Schemes
> **Scope**: Input Controller Mappings, Mode Switching, Gizmo Behaviors.
> **Source**: `src/engine/controllers/`, `src/engine/input-manager.service.ts`

## 1. Input Modes
The `EngineState.mode` signal determines the active `ControllerService`.

### 1.1 Edit Mode (`CameraControlService`)
*   **Goal**: Scene composition and object manipulation.
*   **Input**: `OrbitControls`.
    *   **Desktop**: RMB to Orbit, MMB to Pan, Wheel to Zoom.
    *   **Mobile**: 1-finger Orbit, Virtual Joystick Pan.
*   **UI**: `GizmoManager` is active. Selection allowed.

### 1.2 Walk Mode (`CharacterControllerService`)
*   **Goal**: First-person exploration and tactical interaction.
*   **Input**: FPS Style.
    *   **Desktop**: WASD to Move, Mouse to Look (Pointer Locked).
    *   **Mobile**: Dual Virtual Joysticks + Action Cluster.
*   **Physics**: Kinematic Capsule collider with Auto-Step (0.5m).

### 1.3 Explore Mode (`FlyControlsService`)
*   **Goal**: Free-flight 6DOF navigation.
*   **Input**: WASD + QE (Up/Down) or Virtual Joysticks.
*   **Visuals**: Speed-driven FOV offset.

## 2. Object Manipulation Scheme
When an entity is selected in `Edit` mode, control logic forks.

### 2.1 Gizmo Interaction (Desktop)
*   **Mechanism**: Direct Mesh Matrix modification.
*   **Sync**: `EntityTransformSystem` teleports the Physics Body to match visuals.

### 2.2 Physics Grab (Mobile/Joystick)
*   **Service**: `ObjectManipulationService`.
*   **Mechanism**: `ImpulseJoint` (Spring) between Cursor and Object.
*   **Behavior**: High-fidelity "weighty" feel. Objects collide with the environment while being moved.

## 3. Hotkeys & Shortcuts

| Action | Key | Context |
|--------|-----|---------|
| **Translate/Rotate/Scale** | W, E, R | Edit Mode |
| **Focus Selection** | F | All Modes |
| **FP/TP Toggle** | V | Walk Mode |
| **Cycle Weapon** | Q | Walk Mode |
| **HUD Toggle** | H | All Modes |
| **Quick Save** | Ctrl+S | All Modes |