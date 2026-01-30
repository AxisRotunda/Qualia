
# Qualia 3D System Manifest
> **VERSION**: 0.9.5
> **TYPE**: Master Index / Meta-Architecture
> **TARGET**: AI Agent Context Window
> **META_RULE**: Root Node. Recursive dependency resolution start point.

## 1. Global Architecture
**Stack**: Angular 19+ (Zoneless, Signals) | Three.js (r160) | Rapier3D (WASM/Compat)
**Pattern**: Entity Component System (ECS) with Linear Service Facades.

### 1.1 Core Principles
*   **Zoneless**: Application bootstraps with `provideZonelessChangeDetection`. No `zone.js`.
*   **Signal-First**: All state is reactive via Angular Signals.
*   **Strict Graphics Boundary**: `SceneService` is the **only** permitted entry point for rendering operations.
*   **Loop-Driven**: Physics and Rendering occur in `requestAnimationFrame` loop via `GameLoopService`.

## 2. Sub-System Documentation Map

### 2.1 Meta & Maintenance
*   **[Meta-Heuristics](./meta-heuristics.md)**: Rules for maintaining and parsing this documentation.
*   **[Agent Workflow](./agent-workflow.md)**: Operational protocols for AI modification of this codebase.
*   **[Project Hierarchy](./project-hierarchy.md)**: Complete file system tree and directory intent.
*   **[Refactoring State](./refactoring-state.md)**: Tracking debt, deprecations, and bottlenecks.
*   **[Meta-Commentary](./meta-commentary.md)**: Internal dev diary and aesthetic guidelines.
*   **[Knowledge Graph](./knowledge-graph.md)**: System dependency topology.

### 2.2 Core Engine
*   **[Runtime Architecture](./runtime-architecture.md)**: Game Loop, System Priorities, Transform Sync.
*   **[ECS Architecture](./ecs-architecture.md)**: Data structures, Component definitions, and Entity Lifecycle.
*   **[Physics Integration](./physics-integration.md)**: Rapier setup, Collision Events, **Interaction Hand**, Body types.
*   **[Graphics Pipeline](./graphics-pipeline.md)**: Rendering, Materials, Textures, Atmosphere.
*   **[State Topology](./state-topology.md)**: Signal graph, Data flow, Facade mappings.

### 2.3 Interaction & Gameplay
*   **[Input System](./input-system.md)**: Hardware abstraction, Controller Logic.
*   **[Control Schemes](./control-schemes.md)**: **NEW**. Mapping inputs to UI feedback and Virtual Controls.
*   **[Interaction Model](./interaction-model.md)**: Raycasting, Physics Grabbing, Context Menus, Placement.
*   **[Scene Logic](./scene-logic.md)**: Specific logic hooks for Scene Presets.

### 2.4 Content & UI
*   **[UI Architecture](./ui-architecture.md)**: **UPDATED**. Global styling, Signal flow, Component patterns.
*   **[Layout Topology](./layout-topology.md)**: **NEW**. Z-Index layers, Screen regions, Responsive definitions.
*   **[Mobile Strategy](./mobile-strategy.md)**: **NEW**. Touch heuristics, Drawer patterns, Gesture handling.
*   **[Content Pipeline](./content-pipeline.md)**: Procedural Generation, Scene Registry, Asset Definitions.
*   **[Persistence Schema](./persistence-schema.md)**: Save/Load data structures and limitations.

## 3. Project Structure
See **[Project Hierarchy](./project-hierarchy.md)** for detailed map.

## 4. Cross-System Invariants
*   **Physics <-> ECS**: Synced via `EntityTransformSystem` in `EngineRuntimeService`.
*   **Input <-> ECS**: Mediated via `InputManager` -> `Controller` -> `Physics/Transform`.
*   **UI <-> State**: Mediated via `EngineService` facade. UI never touches `World` directly for writes.
