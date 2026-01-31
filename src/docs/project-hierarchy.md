
# Project Hierarchy
> **Scope**: File System Map, Directory Intent.
> **Audience**: AI Agents.
> **Update Trigger**: File creation/deletion/move.

## 1. Root Structure
```text
src/
├── app.component.ts                # [Entry] Root Angular component
├── components/                     # [UI] Angular Components (View Layer)
│   └── ...                         # [UI] Layout, HUD, Inspectors
├── config/                         # [Data] Asset & Material definitions
├── content/                        # [Data] Scene definitions (Level Design)
├── data/                           # [Data] Static Templates (ECS definitions)
├── docs/                           # [Meta] System Documentation
├── engine/                         # [Core] Framework-Agnostic Logic
│   ├── controllers/                # [Logic] Input Strategies (Cam, Char, Fly)
│   ├── ecs/                        # [Core] ECS Implementation
│   ├── features/                   # [Logic] High-level gameplay features
│   │   ├── entity-ops.service.ts   # [Feature] CRUD operations
│   │   ├── environment-control.service.ts
│   │   ├── level-manager.service.ts
│   │   ├── object-manipulation.service.ts
│   │   ├── simulation.service.ts   # [Feature] Time/Debug/Pause
│   │   ├── spawner.service.ts      # [Feature] Placement logic
│   │   └── terrain-manager.service.ts # [Feature] **NEW** Chunk Logic
│   ├── level/                      # [Core] Scene Management
│   │   ├── scene-context.ts        # [Core] Scene API for scripts
│   │   └── scene-loader.service.ts # [Core] **NEW** Async Loading Pipeline
│   ├── graphics/                   # [Render] Three.js abstractions
│   ├── interaction/                # [Interaction] Raycasting & Spatial Queries
│   ├── input/                      # [Input] Raw pointer event handling
│   ├── logic/                      # [Logic] Pure math/transform utilities
│   ├── runtime/                    # [Core] Game Loop & System Scheduler
│   ├── systems/                    # [ECS] Per-frame Logic Systems
│   ├── utils/                      # [Utils] Shared helpers (Worker, Math)
│   └── workers/                    # [Core] Inline Worker Scripts
├── physics/                        # [Core] Rapier3D integration
│   ├── logic/                      # [Physics] Sub-logic (Mass, Scaling)
│   ├── physics-registry.service.ts # [Physics] Handle <-> Entity Map
│   ├── physics-step.service.ts     # [Physics] **NEW** Accumulator & Loop
│   ├── world.service.ts            # [Physics] RAPIER.World wrapper
│   └── ...
├── services/                       # [Glue] Angular Services (Facades & Factories)
│   ├── factories/                  # [Logic] Physics body creation logic
│   ├── generators/                 # [ProcGen] Geometry generation algorithms
│   ├── ui/                         # [Logic] Layout state management
│   ├── engine.service.ts           # [Facade] Main API Entry point
│   └── ...
└── ...                             # [Root] Configs
