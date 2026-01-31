
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
*   **`EntityAssemblerService`**: [WATCH] High coupling. Manages Physics, Visuals, and ECS. Candidate for decomposition into `EntityFactory`.

## 3. Optimization Queue (Bottlenecks)
*   **`ECS ComponentStore`**: Uses `Map<number, T>`.
    *   *Issue*: Iteration overhead.
    *   *Fix*: Move hot components (Transform) to TypedArrays (SoA).

## 4. Pending Architecture Changes
1.  **Strict Typing**: Refactor `inject()` calls to use explicit types where inference is weak.

## 5. Completed Refactors
*   **Level Management**: Extracted `SceneLoaderService` from `LevelManagerService`. Loading logic is now separate from Game State logic.
*   **Physics Loop**: Extracted `PhysicsStepService` from `PhysicsWorldService`. Simulation accumulator logic is now isolated.
*   **Entity Management**: Extracted `duplicateEntity` logic from `EntityAssembler` to `EntityOpsService`.
*   **Terrain Generation**: Broken down monolithic `TERRAIN_WORKER_SCRIPT` into modular constants.
*   **Instancing**: `InstancedMeshService` logic extracted to `InstancedGroup`.
*   **Input Handling**: `PointerListenerService` now uses Lazy Binding.
*   **Worker Utilities**: `createInlineWorker` implemented.
*   **Graphics Pipeline**: `StageService` created to handle static world generation.
