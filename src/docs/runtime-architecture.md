
# Runtime Architecture
> **Scope**: Game Loop, System Scheduling, Delta Time, Transform Sync.
> **Source**: `src/engine/runtime/engine-runtime.service.ts`, `src/engine/system.ts`, `src/engine/systems/*.ts`

## 1. The Game Loop (`GameLoopService`)
*   **Mechanism**: `requestAnimationFrame`.
*   **Frequency**: Display Refresh Rate (usually 60Hz or 144Hz).
*   **State**: `fps` signal updated every 1s.
*   **Callback**: `(dt: number) => void`. `dt` is delta time in milliseconds since last frame.

## 2. System Scheduler (`EngineRuntimeService`)
Orchestrates the execution of `GameSystem` implementations.
Systems are injected and sorted by `priority` at initialization.

### 2.1 Execution Order
| Priority | System | Responsibility |
|----------|--------|----------------|
| **0** | `InputSystem` | Updates Camera/Character controllers and Object Manipulation inputs. |
| **100** | `EnvironmentSystem` | Updates Particle Systems (Weather). |
| **150** | `SceneLogicSystem` | Executes Scene-specific `onUpdate` hooks (e.g., Elevator logic). |
| **200** | `PhysicsSystem` | Steps Rapier World, Syncs Physics -> ECS. |
| **900** | `RenderSystem` | Updates Gizmo visuals, Renders Three.js Scene. |

## 3. Transform Synchronization (`EntityTransformSystem`)
The most critical system for data consistency. It manages the bidirectional flow between the Physics World (Rapier) and the Visual World (Three.js), mediated by the ECS.

### 3.1 Mode: Simulation (`play`)
*   **Direction**: `Physics -> ECS -> Visuals`.
*   **Optimization**: Iterates ONLY active (awake) bodies from `PhysicsWorldService`. Sleeping bodies are skipped entirely, reducing complexity from O(N) to O(Active).
*   **Logic**:
    1.  Call `physics.syncActiveBodies(callback)`.
    2.  Inside callback, receive entity ID, position, rotation.
    3.  Update `ECS.Transform`.
    4.  Update `ECS.MeshRef`.
    
### 3.2 Mode: Edit (`edit`)
*   **General**: Same as Simulation (Physics drives Visuals).
*   **Exception**: **Selected Entity Override**.
    *   If `GizmoManager.isDraggingGizmo() == true` AND `Entity == Selected`:
        *   **Direction**: `Visuals (Gizmo) -> ECS -> Physics`.
        *   **Logic**: The Gizmo modifies the Three.js mesh directly. The System reads the mesh position and forcefully updates the Physics Body (`setTranslation`, `setRotation`).
    *   **Reason**: Prevents physics fighting the user during manipulation.

### 3.3 Controller Inputs
*   **Object Control**: Joystick inputs call `applyTransformDelta`.
    *   Updates ECS `Transform` and Physics `Body` simultaneously to ensure responsiveness.
    *   Visuals are updated immediately to prevent frame lag perception.

## 4. Time Management
*   **Physics Step**: Fixed timestep `1/60`s inside `PhysicsWorldService`.
    *   Uses an accumulator to decouple Frame Rate from Physics Rate.
    *   Max Frame Time Cap: `0.1s` (Prevents "spiral of death" on lag).
*   **Render Step**: Variable timestep (Frame `dt`).
*   **Scene Logic**: Receives `dt` (ms) and `totalTime` (ms) for animations/shaders.
