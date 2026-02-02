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

### 2.1 Visualized Execution Order
The flowchart below illustrates the precise order of system execution per frame, sorted by priority.

```mermaid
graph TD
    subgraph "Tick Start"
        A[Input System (0)]
    end
    subgraph "Pre-Physics Logic"
        B[Environment System (100)]
        C[Scene Logic System (150)]
        D[Behavior System (170)]
        E[Kinematic System (180)]
    end
    subgraph "Physics Simulation"
        F[Buoyancy System (190)]
        G[Combat System (195)]
        H[Physics System (200)]
        I[Destruction System (205)]
        J[Repair System (210)]
    end
    subgraph "Post-Physics & Animation"
        K[Animation System (350)]
        L[City Traffic System (400)]
        M[Material Animation System (800)]
        N[Weapon System (850)]
    end
    subgraph "Render Preparation"
        O[Terrain Manager (890)]
        P[Render System (900)]
        Q[VFX System (950)]
    end
    subgraph "Telemetry"
        R[Statistics System (1000)]
        S[Telemetry System (1100)]
    end

    A-->B; B-->C; C-->D; D-->E; E-->F; F-->G; G-->H; H-->I; I-->J; J-->K; K-->L; L-->M; M-->N; N-->O; O-->P; P-->Q; Q-->R; R-->S;
```

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

## 4. Time & Viewport Management
*   **Physics Step**: Fixed timestep `1/60`s inside `PhysicsWorldService`.
    *   Uses an accumulator to decouple Frame Rate from Physics Rate.
    *   Max Frame Time Cap: `0.1s` (Prevents "spiral of death" on lag).
*   **Render Step**: Variable timestep (Frame `dt`).
*   **Viewport Management**: 
    *   The engine uses a `ResizeObserver` on the primary viewport container.
    *   Resizing is reactive to DOM changes (sidebar toggles, CSS transitions) rather than just window events.
*   **Scene Logic**: Receives `dt` (ms) and `totalTime` (ms) for animations/shaders.