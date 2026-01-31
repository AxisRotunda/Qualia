
# System Knowledge Graph
> **Scope**: Dependency Topology, Adjacency Matrix.
> **Audience**: AI Agents (Impact Analysis).

## 1. Core Nodes
*   **[A] EngineService**: Main Facade.
*   **[B] EngineState**: Reactive Store.
*   **[C] Runtime**: Loop Scheduler.
*   **[D] Physics**: Rapier World.
*   **[E] Scene**: Three.js World.
*   **[F] ECS**: Entity Manager.

## 2. Critical Edges (Dependencies)
*   **A -> B**: Engine writes State.
*   **A -> C**: Engine starts Runtime.
*   **C -> D**: Runtime steps Physics.
*   **C -> E**: Runtime renders Scene.
*   **D -> F**: Physics updates ECS Transforms.
*   **F -> E**: ECS MeshRefs control Visuals.

## 3. Subsystem clusters

### 3.1 Input Cluster
`DOM` -> `GameInput` -> `InputManager` -> `Controllers` -> `ECS/Physics`.

### 3.2 Content Cluster
`SceneRegistry` -> `ScenePreset` -> `EntityLibrary` -> `AssetService` -> `Generators`.

### 3.3 Visual Cluster
*   `SceneService` -> `EnvironmentManager` (Renderer).
*   `VisualsFactory` -> `SceneGraph`.
*   `EntityAssembler` -> `VisualsFactory`.

### 3.4 Environment Cluster
*   `EnvironmentControlService` (Logic) -> `EnvironmentManagerService` (Render).
*   `EnvironmentControlService` -> `ParticleService` (Weather).

## 4. Ripple Effects
*   **Modifying `PhysicsBodyDef`**:
    *   Affects: `PhysicsFactory`, `ShapesFactory`, `EntityLibrary`, `EntityManager`, `PersistenceService`.
*   **Modifying `ScenePreset`**:
    *   Affects: `SceneRegistry`, `SceneLogicSystem`, `src/content/scenes/*.ts`.
*   **Modifying `EngineState`**:
    *   Affects: Almost ALL UI components, `InputManager`, `PhysicsSystem`.

## 5. Circular Dependency Risks
*   `EngineService` <-> `DebugService` (Known).
*   `SceneLogicSystem` -> `EngineService` (Resolved via Injector/Lazy).
