
# Project Hierarchy
> **Scope**: File System Map, Directory Intent.
> **Audience**: AI Agents.
> **Update Trigger**: File creation/deletion/move.

## 1. Root Structure
```text
src/
├── app.component.ts                # [Entry] Root Angular component
├── components/                     # [UI] Angular Components (View Layer)
├── config/                         # [Data] Asset & Material definitions
├── content/                        # [Data] Scene definitions (Level Design)
├── data/                           # [Data] Static Templates (ECS definitions)
├── docs/                           # [Meta] System Documentation
├── engine/                         # [Core] Framework-Agnostic Logic
│   ├── controllers/                # [Logic] Input Strategies
│   ├── ecs/                        # [Core] ECS Implementation
│   ├── features/                   # [Logic] Feature modules
│   │   ├── city/                   # [Feature] Metropolis Infrastructure
│   │   ├── entity-library.service  # [Data] Template Registry
│   │   ├── placement.service.ts    # [Logic] Object ghosting/validation
│   │   └── ...
│   ├── level/                      # [Core] Scene Management
│   ├── graphics/                   # [Render] Three.js abstractions
│   │   ├── geometry/               # [Ref] Geometry Resolution
│   │   ├── instancing/             # [Core] Optimized rendering
│   │   ├── materials/              # [Ref] Material Resolution & Shaders
│   │   └── ...
│   ├── interaction/                # [Interaction] Raycasting
│   ├── input/                      # [Input] Raw pointer event handling
│   ├── logic/                      # [Logic] Pure math/transform utilities
│   ├── runtime/                    # [Core] Game Loop & System Scheduler
│   ├── systems/                    # [ECS] Per-frame Logic Systems
│   ├── utils/                      # [Utils] Shared helpers
│   └── workers/                    # [Core] Inline Worker Scripts
├── physics/                        # [Core] Rapier3D integration
├── services/                       # [Glue] Angular Services (Facades)
└── ...                             # [Root] Configs
```
