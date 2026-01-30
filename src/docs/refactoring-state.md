
# Refactoring State & Technical Debt
> **Scope**: Codebase Health, Deprecation Log, Optimization Queue.
> **Audience**: AI Agents (Pre-Modification Check).
> **Status**: Living Document.

## 1. Deprecation Log (Safe to Delete)
These files contain no logic or have been fully superseded.
*   `src/services/environment.service.ts`: Superseded by `EnvironmentManagerService`.
*   `src/services/factories/mesh-factory.service.ts`: Superseded by `VisualsFactoryService`.
*   `src/scene/scene-visuals.service.ts`: Merged into `SceneService`.
*   `src/services/generators/structure-generator.service.ts`: Split into `Architecture`/`Interior`/`SciFi` generators.
*   `src/services/scene-generator.service.ts`: Deprecated in favor of `SceneRegistry`.
*   `src/engine/systems/core-systems.ts`: Split into individual system files.

## 2. Monolith Watch
Classes approaching high complexity. Refactor if adding > 3 new methods.
*   **`EngineService`**: Acts as the "God Facade".
    *   *Risk*: Circular dependencies.
    *   *Action*: Move logic to `Features/*` services (e.g., `SpawnerService`, `LevelManagerService`).
*   **`PhysicsService`**: Mixes Facade, World Management, and Interaction logic.
    *   *Action*: Delegate more to `PhysicsWorldService` and `PhysicsInteractionService`.

## 3. Optimization Queue (Bottlenecks)
*   **`PhysicsWorldService.step`**: Uses a simple accumulator.
    *   *Issue*: Potential "Spiral of Death" if `dt` > `maxFrameTime`.
    *   *Fix*: Implement RK4 integration or stricter clamping.
*   **`ECS ComponentStore`**: Uses `Map<number, T>`.
    *   *Issue*: Iteration overhead in `EntityTransformSystem` (O(N)).
    *   *Fix*: Move hot components (`Transform`, `RigidBodyRef`) to `TypedArrays` (SoA - Structure of Arrays).
*   **`PointerListenerService`**: Adds listeners to `window` globally.
    *   *Issue*: Event pollution.
    *   *Fix*: Scope closer to Canvas, ensure `ngOnDestroy` cleans up aggressively.

## 4. Pending Architecture Changes
1.  **Input Normalization**:
    *   Current: `GameInputService` mixes "Keys" and "Virtual Joystick".
    *   Goal: Abstract `InputDevice` interface (Keyboard, Gamepad, Touch) -> `InputState`.
2.  **Asset Streaming**:
    *   Current: Procedural Gen is synchronous/blocking on load.
    *   Goal: Move `AssetService` generation to Web Worker or slice over frames.
3.  **Strict Typing**:
    *   Refactor `inject()` calls to use explicit types where inference is weak.

## 5. Invariant Violations (Fix Immediately)
*   *None currently detected.*
