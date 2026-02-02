# State Topology
> **Scope**: Signal Graph, Data Flow, Facade Mappings.
> **Source**: `src/engine/engine-state.service.ts`, `src/engine/features/*.service.ts`

## 1. Root Store: `EngineStateService`
All signals are `readonly` to consumers, writable only by internal Engine systems or Feature Services.

### 1.1 Time & Performance
*   `fps` <- `GameLoopService`
*   `physicsTime` <- `PhysicsSystem`
*   `renderTime` <- `RenderSystem`

### 1.2 Simulation State
*   `isPaused` -> Controlled by `SimulationService`.
*   `loading` -> Controlled by `LevelManagerService`.
*   `gravityY` -> Controlled by `SimulationService`.

### 1.3 Interaction State
*   `mode` (`edit`|`walk`|`explore`) -> Controlled by `InputManagerService`.
*   `transformMode` -> Controlled by `SimulationService`.
*   `selectedEntity` -> Controlled by `InteractionService` & `EntityStoreService`.

### 1.4 Visual State
*   `wireframe` -> Controlled by `SimulationService`.
*   `texturesEnabled` -> Controlled by `SimulationService`.
*   `timeOfDay` -> Controlled by `EnvironmentControlService`.

## 2. Facade Layer: `EngineService`
The `EngineService` now acts as a macro-facade, delegating calls to specific Feature Services to maintain Separation of Concerns.

### 2.1 Delegation Map
| Method | Delegate | Responsibility |
|--------|----------|----------------|
| `deleteEntity` | `EntityOpsService` | ECS/Physics/Mesh cleanup. |
| `setGravity` | `SimulationService` | State update + Physics world update. |
| `loadScene` | `LevelManagerService` | Async loading, atmosphere, reset. |
| `spawnFromTemplate` | `SpawnerService` | Library lookup, Raycasting, Instantiation. |
| `setAtmosphere` | `EnvironmentControlService` | Lighting, Fog, Skybox. |

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

### 3.2 Visuals Creation Flow
```text
[SpawnerService] 
    | (Template ID)
    v
[EntityLibrary] --(Config)--> [TemplateFactory]
                                    |
        +---------------------------+---------------------------+
        |                           |                           |
[VisualsFactory]            [PhysicsFactory]            [EntityAssembler]
        |                           |                           |
[AssetService (Geo)]        [ShapesFactory (Collider)]  [ComponentStore (Data)]
        |                           |
[InstancedMeshService]      [PhysicsWorld (Body)]
```