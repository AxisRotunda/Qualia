# State Topology
> **Scope**: Signal Graph, Data Flow, Facade Mappings.
> **Source**: `src/engine/engine-state.service.ts`

## 1. Root Store: `EngineStateService`
All signals are `readonly` to consumers, writable only by internal Engine systems.

### 1.1 Time & Performance
*   `fps` <- `GameLoopService`
*   `physicsTime` <- `PhysicsSystem` (Measure Step)
*   `renderTime` <- `RenderSystem` (Measure Render)

### 1.2 Simulation State
*   `isPaused` -> Consumed by `PhysicsSystem` (Skips physics step), `StatusBar`.
*   `loading` -> Consumed by `MainLayout` (Spinner).
*   `gravityY` -> Consumed by `PhysicsWorldService`.

### 1.3 Interaction State
*   `mode` (`edit`|`walk`|`explore`) -> Consumed by `InputManager` (Switches Controllers), `Toolbar`.
*   `transformMode` -> Consumed by `GizmoManager`.
*   `selectedEntity` -> Consumed by `Inspector`, `GizmoManager` (Attach), `TouchControls`.

### 1.4 Visual State
*   `wireframe` -> Consumed by `MaterialService` (Iterates all mats).
*   `texturesEnabled` -> Consumed by `MaterialService` (Swaps Maps/Colors).
*   `timeOfDay` -> Consumed by `EnvironmentManager`.

## 2. Facade Layer: `EngineService`
Acts as the **Write API** for the UI.
*   **UI Component** calls `engine.setGravity(-9.8)`.
*   **EngineService** updates `state.gravityY`.
*   **EngineService** calls `physics.setGravity(-9.8)`.

## 3. Data Flow Diagrams

### 3.1 Physics Sync Flow
```text
[Rapier World] 
    | (Step)
    v
[PhysicsService.getBodyPose]
    |
    v
[EntityTransformSystem] --(Write)--> [ECS Components] --(Ref)--> [Three.js Meshes]
                                            ^
[Inspector UI] --(Read Signal)--------------|
```

### 3.2 Input Flow
```text
[DOM Events] 
    |
    v
[GameInputService] (Normalize)
    |
    v
[InputManager] --(Check Mode)--> [Active Controller]
                                        |
[CameraControl] OR [CharacterControl] OR [FlyControl]
```