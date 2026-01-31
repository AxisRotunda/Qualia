
# Project Hierarchy
> **Scope**: File System Map, Directory Intent.
> **Audience**: AI Agents.
> **Update Trigger**: File creation/deletion/move.

## 1. Root Structure
```text
src/
├── app.component.ts                # [Entry] Root Angular component
├── components/                     # [UI] Angular Components (View Layer)
│   ├── inspector/                  # [UI] Entity properties, World settings
│   │   ├── entity-inspector.component.ts
│   │   ├── transform-panel.component.ts
│   │   ├── physics-panel.component.ts
│   │   └── world-settings-panel.component.ts
│   ├── menu/                       # [UI] Main Menu & Overlay systems
│   ├── ui/                         # [UI] Generic widgets (Joysticks, Context Menus)
│   │   ├── touch/                  # [UI] Mobile control layers
│   │   ├── game-hud.component.ts   # [UI] **NEW** HUD Container
│   │   └── ...
│   └── ...                         # [UI] Layout containers (MainLayout, Toolbar)
├── config/                         # [Data] Asset & Material definitions
│   ├── assets/                     # [Data] Procedural generation configs (Nature, Arch, etc.)
│   └── ...                         # [Data] Menu & Texture configs
├── content/                        # [Data] Scene definitions (Level Design)
│   └── scenes/                     # [Logic] Scene-specific setup & update loops
├── data/                           # [Data] Static Templates (ECS definitions)
│   └── templates/                  # [Data] Prefab definitions (Buildings, Props, Nature)
├── docs/                           # [Meta] System Documentation
├── engine/                         # [Core] Framework-Agnostic Logic
│   ├── controllers/                # [Logic] Input Strategies (Cam, Char, Fly)
│   ├── ecs/                        # [Core] ECS Implementation
│   │   ├── component-store.ts      # [Core] Sparse Set Data Structure
│   │   ├── entity-assembler.ts     # [Core] Entity Lifecycle (Spawn/Destroy)
│   │   ├── entity-store.ts         # [Core] State Container
│   │   └── world.ts                # [Core] Entity Container
│   ├── features/                   # [Logic] High-level gameplay features
│   │   ├── entity-ops.service.ts   # [Feature] CRUD operations
│   │   ├── environment-control.service.ts
│   │   ├── level-manager.service.ts
│   │   ├── object-manipulation.service.ts
│   │   ├── simulation.service.ts   # [Feature] Time/Debug/Pause
│   │   ├── spawner.service.ts      # [Feature] Placement logic
│   │   └── terrain-manager.service.ts # [Feature] **NEW** Chunk Logic
│   ├── graphics/                   # [Render] Three.js abstractions
│   │   ├── materials/              # [Render] Custom Shader Factories
│   │   ├── textures/               # [Render] Canvas 2D & Worker Generators
│   │   ├── instancing/             # [Render] **NEW** Instanced Mesh Logic
│   │   │   └── instanced-group.ts
│   │   ├── instanced-mesh.service.ts # [Render] Manager Service
│   │   ├── ghost-visuals.service.ts  # [Render] Placement Ghosts
│   │   ├── scene-graph.service.ts  # [Render] Scene Tree Manager (Add/Remove)
│   │   ├── visibility-manager.ts   # [Render] Culling & LOD
│   │   └── ...
│   ├── interaction/                # [Interaction] Raycasting & Spatial Queries
│   ├── input/                      # [Input] Raw pointer event handling
│   ├── logic/                      # [Logic] Pure math/transform utilities
│   ├── runtime/                    # [Core] Game Loop & System Scheduler
│   ├── systems/                    # [ECS] Per-frame Logic Systems
│   ├── utils/                      # [Utils] Shared helpers (Worker, Math)
│   ├── workers/                    # [Core] Inline Worker Scripts
│   │   ├── terrain/                # [Worker] Modularized Terrain Scripts
│   │   │   ├── noise.const.ts
│   │   │   ├── erosion.const.ts
│   │   │   └── main.const.ts
│   │   ├── terrain-worker.const.ts # [Worker] Terrain Aggregate
│   │   └── texture-worker.const.ts # [Worker] Texture Generation
│   ├── core.ts                     # [Core] Barrel file for Schema/ECS
│   └── schema.ts                   # [Core] Leaf-node Type Definitions
├── physics/                        # [Core] Rapier3D integration
│   ├── logic/                      # [Physics] Sub-logic (Mass, Scaling)
│   │   ├── mass-calculator.ts
│   │   └── physics-scaler.ts
│   ├── physics-registry.service.ts # [Physics] **NEW** Handle <-> Entity Map
│   ├── world.service.ts            # [Physics] RAPIER.World wrapper
│   └── ...
├── services/                       # [Glue] Angular Services (Facades & Factories)
│   ├── factories/                  # [Logic] Physics body creation logic
│   ├── generators/                 # [ProcGen] Geometry generation algorithms
│   ├── ui/                         # [Logic] Layout state management
│   ├── engine.service.ts           # [Facade] Main API Entry point
│   └── ...
└── ...                             # [Root] Configs
