
# Qualia 3D System Manifest
> **VERSION**: 0.4.0
> **TYPE**: Master Index / Meta-Architecture
> **META_RULE**: This is the root node. Refer to sub-documents for implementation details.

## 1. Global Architecture
**Stack**: Angular 19+ (Zoneless, Signals) | Three.js (r160) | Rapier3D (WASM/Compat)
**Pattern**: Entity Component System (ECS) with Linear Service Facades.

### 1.1 Core Principles
*   **Zoneless**: Application bootstraps with `provideZonelessChangeDetection`. No `zone.js`.
*   **Signal-First**: All state is reactive via Angular Signals.
*   **Strict Graphics Boundary**: `SceneService` is the **only** permitted entry point for rendering operations.
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
│   ├── engine-state.ts      # Reactive State Store
│   └── graphics/            # Rendering Systems (Internal)
│       ├── environment-manager.ts # Lights, Fog, Sky
│       └── visuals-factory.ts     # Mesh & Geometry Gen
├── services/                # Angular Services (Logic Glue)
│   ├── engine.service.ts    # Main App Facade
│   ├── physics.service.ts   # Rapier Wrapper
│   ├── scene.service.ts     # Three.js Facade (The Renderer)
│   ├── asset.service.ts     # Procedural Asset Generation (Trees/Rocks)
│   ├── material.service.ts  # Texture & Material Management
│   └── ...                  
└── components/              # UI Components
```

## 4. Implementation Heuristics
*   **Data Flow**: ECS → EngineService → SceneService. Never bypass `SceneService` to touch meshes directly from Logic components.
*   **State Updates**: Never mutate Signals directly from Components. Call Service methods.
*   **Performance**: ECS stores use `Map<Entity, T>` for O(1) access. 
*   **Memory Management**: `VisualsFactoryService` tracks created geometries and disposes of them when `SceneService.removeEntityVisual` is called.
