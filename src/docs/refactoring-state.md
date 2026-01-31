
# Refactoring State & Technical Debt
> **Scope**: Codebase Health, Deprecation Log, Optimization Queue.
> **Audience**: AI Agents (Pre-Modification Check).
> **Status**: Living Document.

## 1. Cleaned Up (Deleted)
These files have been successfully removed to reduce cognitive load.
*   `src/services/environment.service.ts`
*   `src/services/factories/mesh-factory.service.ts`
*   `src/scene/scene-visuals.service.ts`
*   `src/services/generators/structure-generator.service.ts`
*   `src/services/scene-generator.service.ts`
*   `src/engine/systems/core-systems.ts`
*   `src/services/camera-control.service.ts` (Old version)
*   `src/services/fly-controls.service.ts` (Old version)
*   `src/services/character-controller.service.ts` (Old version)
*   `src/engine/entity-manager.service.ts`
*   `src/services/object-control.service.ts`

## 2. Monolith Watch
Classes approaching high complexity. Refactor if adding > 3 new methods.
*   **`EngineService`**: [STABLE] Acts as a clean facade. Complex logic delegates to `EntityAssembler` or `LevelManager`.
*   **`SceneService`**: [STABLE] Rendering pipeline coordinator.

## 3. Optimization Queue (Bottlenecks)
*   **`ECS ComponentStore`**: Uses `Map<number, T>`.
    *   *Issue*: Iteration overhead.
    *   *Fix*: Move hot components to TypedArrays.

## 4. Pending Architecture Changes
1.  **Strict Typing**: Refactor `inject()` calls to use explicit types where inference is weak. (In Progress: Asset Templates heavily typed).

## 5. Completed Refactors
*   **Terrain Generation**: Broken down monolithic `TERRAIN_WORKER_SCRIPT` into modular constants (`noise`, `erosion`, `main`). Extracted geometry generation logic from `TerrainManagerService` to `NatureTerrainService`.
*   **Instancing**: `InstancedMeshService` logic extracted to `InstancedGroup` class to handle large scale object counts cleanly.
*   **Input Handling**: `PointerListenerService` now uses Lazy Binding (attaching window listeners only on interaction) to prevent event pollution.
*   **Worker Utilities**: `createInlineWorker` implemented to standardize procedural generation threading.
*   **Graphics Pipeline**: `StageService` created to handle static world generation.
*   **Input Normalization**: `GameInputService` refactored to unify Joystick and Mouse sensitivity math.
*   **Physics Loop**: Timestep clamping implemented.
*   **Level Management**: `reset()` now correctly disposes of Meshes via `EntityAssembler`, fixing "ghost mesh" memory leaks.
*   **Spawning**: `SpawnerService` now supports aerial spawning (camera forward vector) when raycast fails.
*   **Scene Context**: Added `modifyBatch` and `hero-ice-spire` template to cleanup `Ice` scene logic.
