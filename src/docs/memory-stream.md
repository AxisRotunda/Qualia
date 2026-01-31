
# [MEMORY] Context Stream
> **ID**: MEM_STREAM
> **Role**: Persistent architectural RAM. Tracks decisions, active focus, and invariants.
> **Update Rule**: Append new decisions to log. Overwrite State on phase shift.

## 1. Active System State
*   **Phase**: 5.3 (Scene Vitality).
*   **Focus**: Implementing dynamic systems (Traffic) to enhance static procedural environments.
*   **Critical Alert**: None.

## 2. Architectural Invariants (Cached)
*   **[Zoneless]**: `provideZonelessChangeDetection` is active. UI uses Signals exclusively.
*   **[Facade]**: UI Components MUST NOT inject `PhysicsService` or `Three.js` objects directly. Use `EngineService`.
*   **[Physics]**: `Rapier` drives `Three.js` in `play` mode. `Gizmo` drives `Rapier` in `edit` mode.
*   **[Data]**: ECS Components (`ComponentStore`) use `Int32Array` for sparse lookups (Optimization V1).
*   **[Workers]**: Procedural generation (Mesh/Texture) must occur off-main-thread.

## 3. Decision Log (LIFO)
*   **[LOG_019]**: Executed `RUN_SCENE_OPT` (City). Implemented `CityTrafficLogic` using `InstancedMesh` to simulate 300+ vehicles with zero ECS overhead. Added `vehicle-traffic-puck` asset. Updated `city.scene.ts` to manage traffic lifecycle.
*   **[LOG_018]**: Executed `RUN_TEXTURE` (City). Refactored `city-window` to use deterministic hashing for consistent layouts. Implemented `city-window-normal` in `TextureWorker` to provide PBR depth to building facades.
*   **[LOG_017]**: Executed `RUN_MAT`. Refactored City materials (`concrete`, `asphalt`, `windows`) to follow Hard Realism PBR standards. Replaced expensive `MeshPhysicalMaterial` for skyscraper windows with optimized `MeshStandardMaterial` (`mat-city-window`) to improve mobile performance.
*   **[LOG_016]**: Executed `RUN_PROTOCOL` (Meta). Decomposed "Visuals" into 3 distinct protocols: `RUN_MAT` (Materials/Shaders), `RUN_RENDER` (Pipeline/Env), and kept `RUN_TEXTURE` (Synthesis). This allows finer-grained optimization tasks.
*   **[LOG_015]**: Executed `RUN_TEXTURE` (Materials). Complete migration of Tech textures (Screens, Vents, Racks) to Worker. Tuned `mat-snow` and `mat-concrete` brightness values to prevent HDR blowout.
*   **[LOG_014]**: Executed `RUN_TEXTURE` on architectural patterns. Migrated `grid`, `brick`, `marble`, and `carpet` generation from `PatternTextureService` (Main Thread) to `TextureWorker`.
*   **[LOG_013]**: Executed `RUN_TEXTURE`. Created `protocol-texture.md`. Migrated `Ice` texture generation from `NatureTextureService` (Main Thread) to `TextureWorker` (Offscreen).
*   **[LOG_012]**: Executed `RUN_REF`. Deleted unused `math.utils.ts`. Refactored `TemplateFactoryService` to use `PhysicsService` facade for shape operations, removing direct low-level factory injection.
*   **[LOG_011]**: Executed `RUN_SCENE_OPT` on `city`. Enabled instancing on 4 major building templates and highway pillars to reduce draw calls. Activated Day/Night cycle in `city.scene.ts`.
*   **[LOG_010]**: Executed `RUN_SCENE_OPT` on 4 target scenes (`forest`, `ice`, `desert`, `spaceship`). Applied **Warmup Injection** by populating `preloadAssets` with heavy procedural IDs (Mesh IDs).
*   **[LOG_009]**: Installed `RUN_SCENE_OPT` (`protocol-scene-optimizer.md`). Defines logic for intelligent scene refactoring (extracting algorithms) vs creation.
*   **[LOG_008]**: Executed `RUN_ARCH`. Optimized `CityGridService` to use bitwise packed integers for keys. Added UV scaling to `ArchRoadService`.
*   **[LOG_007]**: Constructed `protocol-architecture.md` via Meta-Constructor. Defined constraints for foundations, floor heights, and grid snapping.
*   **[LOG_006]**: Constructed `protocol-ui.md`. Established "Scientific Dashboard" as the immutable design language.
*   **[LOG_005]**: Installed `protocol-constructor.md`. System now has the capacity to generate and optimize its own operating protocols via `RUN_PROTOCOL`.
*   **[LOG_004]**: Implemented Geometry/Nature optimization protocols (Cloning & Zero-Alloc Loops).
*   **[LOG_003]**: Enforced "Hard Realism" physics tuning (Density-based mass).
*   **[LOG_002]**: Established `protocol-optimize.md` to replace `perf-protocol.md`.
*   **[LOG_001]**: Installed `kernel.md` as root authority. Deprecated narrative docs in favor of Protocols.

## 4. Pending Tasks (Backlog)
*   [ ] **Refactor**: Split `EntityAssemblerService` (High Coupling).
*   [x] **Optimization**: Move ECS Transform storage to `Float32Array` (SoA) - **COMPLETED**.
*   [ ] **Feature**: Implement Audio Engine.
