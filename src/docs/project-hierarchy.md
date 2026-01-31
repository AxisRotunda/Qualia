
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
│   ├── level/                      # [Core] Scene Management
│   ├── graphics/                   # [Render] Three.js abstractions
│   ├── interaction/                # [Interaction] Raycasting & Spatial Queries
│   ├── input/                      # [Input] Raw pointer event handling
│   ├── logic/                      # [Logic] Pure math/transform utilities
│   ├── runtime/                    # [Core] Game Loop & System Scheduler
│   ├── systems/                    # [ECS] Per-frame Logic Systems
│   ├── utils/                      # [Utils] Shared helpers (Worker, Math)
│   └── workers/                    # [Core] Inline Worker Scripts
│       ├── terrain/                # [Worker] Procedural Terrain Logic
│       ├── textures/               # [Worker] Procedural Texture Logic (**NEW**)
│       │   ├── common.const.ts     # [Worker] Math & Util Helpers
│       │   ├── generators-arch.ts  # [Worker] Concrete/Brick
│       │   ├── generators-nature.ts# [Worker] Organic/Noise
│       │   ├── generators-tech.ts  # [Worker] Metal/Screens
│       │   └── worker-main.ts      # [Worker] Entry Point
│       ├── terrain-worker.const.ts # [Assembler] Terrain Worker
│       └── texture-worker.const.ts # [Assembler] Texture Worker
├── physics/                        # [Core] Rapier3D integration
│   └── ...
├── services/                       # [Glue] Angular Services (Facades & Factories)
│   ├── engine.service.ts           # [Facade] Main API Entry point
│   └── ...
└── ...                             # [Root] Configs
```
