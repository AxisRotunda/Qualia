
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
*   `src/physics/logic/physics-scaler.ts` (Merged into ShapesFactory)

## 2. Monolith Watch
Classes approaching high complexity. Refactor if adding > 3 new methods.
*   **`EngineService`**: [STABLE] Acts as a clean facade. Complex logic delegates to `EntityAssembler` or `LevelManager`.
*   **`SceneService`**: [STABLE] Rendering pipeline coordinator.
*   **`EntityAssemblerService`**: [WATCH] High coupling. Manages Physics, Visuals, and ECS. Candidate for decomposition into `EntityFactory`.

## 3. Optimization Queue (Bottlenecks)
*   **[COMPLETED] `ECS ComponentStore`**: Moved hot components (Transform) to `Float32Array` (SoA) in `TransformStore`.

## 4. Pending Architecture Changes
*   **[COMPLETED] Strict Typing**: Refactored `LevelManager` and `SceneLoader` to use `import type { EngineService }` to resolve circular dependencies without using `any`.

## 5. Completed Refactors
*   **Physics Scaling**: Merged `PhysicsScaler` logic into `ShapesFactory` to consolidate collider generation.
*   **Controller Input**: `CameraControlService` now autonomously polls `GameInputService`, removing plumbing code from `InputManagerService`.
*   **ECS Transform SoA**: Implemented `TransformStore` with `Float32Array` buffers for zero-allocation position/rotation updates.
*   **Level Management**: Extracted `SceneLoaderService` from `LevelManagerService`.
*   **Physics Loop**: Extracted `PhysicsStepService` from `PhysicsWorldService`.
*   **Entity Management**: Extracted `duplicateEntity` logic from `EntityAssembler` to `EntityOpsService`.
*   **Terrain Generation**: Modularized worker scripts.
*   **Instancing**: Refactored `InstancedMeshService` logic.
