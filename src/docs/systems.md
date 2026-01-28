# Qualia 3D System Manifest
> **VERSION**: 0.2.1
> **TYPE**: Master Index / Meta-Architecture
> **META_RULE**: This is the root node. Refer to sub-documents for implementation details.

## 1. Global Architecture
**Stack**: Angular 19+ (Zoneless, Signals) | Three.js (r160) | Rapier3D (WASM/Compat)
**Pattern**: Entity Component System (ECS) with Angular Service Facades.

### 1.1 Core Principles
*   **Zoneless**: Application bootstraps with `provideZonelessChangeDetection`. No `zone.js`.
*   **Signal-First**: All state is reactive via Angular Signals.
*   **Facade Pattern**: UI Components never touch `Three.js` or `Rapier` objects directly. They interact via `EngineService`.
*   **Loop-Driven**: Physics and Rendering occur in `requestAnimationFrame` loop via `GameLoopService`.

## 2. Sub-System Documentation Map
Detailed architectural specs are split by domain:

*   [ECS Architecture](./ecs-architecture.md): Data structures, Component definitions, and Entity Lifecycle.
*   [Physics Integration](./physics-integration.md): Rapier setup, Body types, Factories, and Character Controller.
*   [Graphics Pipeline](./graphics-pipeline.md): Rendering, Asset Generation, Materials, and Atmosphere.

## 3. Project Structure
```text
src/
├── app.component.ts         # Root
├── engine/                  # Core Logic (Framework Agnostic-ish)
│   ├── core.ts              # ECS Types & World Class
│   ├── entity-manager.ts    # Entity Lifecycle & Sync
│   ├── interaction.ts       # Raycasting & Input Events
│   ├── persistence.ts       # Save/Load Logic
│   └── engine-state.ts      # Reactive State Store
├── services/                # Angular Services (Logic Glue)
│   ├── engine.service.ts    # Main Facade
│   ├── physics.service.ts   # Rapier Wrapper
│   ├── scene.service.ts     # Three.js Wrapper
│   └── ...                  # Specific Systems (Input, Particles, etc)
├── components/              # UI Components (Dumb/Smart)
│   ├── ui-panel.ts          # Generic UI Container
│   ├── scene-tree.ts        # Entity List
│   ├── inspector.ts         # Property Editor
│   └── ...
└── data/                    # Static Definitions
    ├── entity-templates.ts  # Spawnable Object Configs
    └── scene-definitions.ts # Level Layouts
```

## 4. Implementation Heuristics
*   **Adding Entities**: Define in `entity-templates.ts`, ensure `AssetService` supports geometry.
*   **State Updates**: Never mutate Signals directly from Components. Call Service methods.
*   **Performance**: ECS stores use `Map<Entity, T>` for O(1) access. Avoid array iteration in hot loops where possible. Use `ComponentStore.forEach`.