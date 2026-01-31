
# Qualia 3D System Manifest
> **VERSION**: 1.1.0 (Module Decomposition)
> **TYPE**: Master Index / Meta-Architecture
> **TARGET**: AI Agent Context Window
> **META_RULE**: Root Node. Recursive dependency resolution start point.

## 1. Global Architecture
**Stack**: Angular 19+ (Zoneless, Signals) | Three.js (r160) | Rapier3D (WASM/Compat)
**Pattern**: Entity Component System (ECS) with Modular Feature Services.

### 1.1 Core Principles
*   **Zoneless**: Application bootstraps with `provideZonelessChangeDetection`. No `zone.js`.
*   **Signal-First**: All state is reactive via Angular Signals in `EngineStateService`.
*   **Graphics Separation**: `SceneGraphService` owns the Scene structure. `SceneService` manages the Render Loop.
*   **Loop-Driven**: Physics and Rendering occur in `requestAnimationFrame` loop via `GameLoopService`.

## 2. Sub-System Documentation Map

### 2.1 Meta & Maintenance
*   **[Meta-Heuristics](./meta-heuristics.md)**: **CRITICAL**. Rules for maintenance, parsing, and invariant checking.
*   **[Agent Workflow](./agent-workflow.md)**: Operational protocols for AI modification of this codebase.
*   **[Project Hierarchy](./project-hierarchy.md)**: Complete file system tree and directory intent.
*   **[Refactoring State](./refactoring-state.md)**: Tracking debt, deprecations, and bottlenecks.
*   **[Meta-Commentary](./meta-commentary.md)**: Internal dev diary and aesthetic guidelines.
*   **[Knowledge Graph](./knowledge-graph.md)**: System dependency topology.

### 2.2 Core Engine & Mathematics
*   **[Math & Algorithms](./math-algorithms.md)**: **NEW**. Detailed formula reference for Procedural Gen, Physics, and Shaders.
*   **[Runtime Architecture](./runtime-architecture.md)**: Game Loop, System Priorities, Transform Sync.
*   **[ECS Architecture](./ecs-architecture.md)**: Data structures (`ComponentStore`), Entity Lifecycle, Assemblers.
*   **[Physics Integration](./physics-integration.md)**: Rapier setup, Collision Events, Mass Calculation logic.
*   **[Graphics Pipeline](./graphics-pipeline.md)**: Rendering, Instancing, Culling, Threaded Texture Generation.
*   **[State Topology](./state-topology.md)**: Signal graph, Data flow, Facade mappings.

### 2.3 Interaction & Gameplay
*   **[Input System](./input-system.md)**: Hardware abstraction, Controller Logic, Joystick normalization.
*   **[Control Schemes](./control-schemes.md)**: Mapping inputs to UI feedback and Virtual Controls.
*   **[Interaction Model](./interaction-model.md)**: Raycasting, Physics Grabbing, Placement Ghosts.
*   **[Scene Logic](./scene-logic.md)**: Specific logic hooks for Scene Presets (`onUpdate`).

### 2.4 Content & UI
*   **[UI Architecture](./ui-architecture.md)**: Global styling, Signal flow, Component patterns.
*   **[Layout Topology](./layout-topology.md)**: Z-Index layers, Screen regions, Responsive definitions.
*   **[Mobile Strategy](./mobile-strategy.md)**: Touch heuristics, Drawer patterns, Gesture handling.
*   **[Content Pipeline](./content-pipeline.md)**: Procedural Generation domains, Asset definitions.
*   **[Persistence Schema](./persistence-schema.md)**: Save/Load data structures.

## 3. Cross-System Invariants
*   **Physics <-> ECS**: Synced via `EntityTransformSystem` in `EngineRuntimeService`.
*   **Visuals <-> Graph**: `VisualsFactoryService` now handles SceneGraph insertion autonomously.
*   **Environment**: `EnvironmentControlService` (Logic) -> `EnvironmentManagerService` (Renderer).
*   **Registry**: `PhysicsRegistryService` maps Rapier Handles to ECS Entity IDs.
*   **Input <-> ECS**: Mediated via `InputManager` -> `Controller` -> `Physics/Transform`.
*   **UI <-> State**: Mediated via `EngineService` facade (delegating to Feature Services).

## 4. Scene Context API
The `SceneContext` provides a safe, declarative API for Scene Scripts.
*   `spawn(templateId, x, y, z, options)`: Creates an entity.
*   `modify(entityId, props)`: Updates Transform/Scale/Rotation, syncing Physics bodies.
*   `terrain(config)`: Orchestrates procedural terrain chunk generation.
*   `scatter(count, range, cb)`: Utility for random placement.
