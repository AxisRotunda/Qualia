
# Project Hierarchy
> **Scope**: File System Map, Directory Intent.
> **Audience**: AI Agents.
> **Update Trigger**: File creation/deletion/move.

## 1. Root Structure
```text
src/
├── app.component.ts                # [Entry] Root Angular component
├── components/                     # [UI] Angular Components (View Layer)
│   ├── inspector/                  # [UI] Properties & Settings panels
│   ├── menu/                       # [UI] Main Menu & Overlay systems
│   ├── ui/                         # [UI] Generic widgets (Joysticks, Context Menus)
│   └── ...                         # [UI] Layout containers (MainLayout, Toolbar)
├── config/                         # [Data] Asset & Material definitions
│   ├── assets/                     # [Data] Procedural generation configs
│   └── ...                         # [Data] Menu & Texture configs
├── content/                        # [Data] Scene definitions (Level Design)
│   └── scenes/                     # [Logic] Scene-specific setup & update loops
├── data/                           # [Data] Static Templates (ECS definitions)
│   └── templates/                  # [Data] Prefab definitions (Buildings, Props)
├── docs/                           # [Meta] System Documentation
├── engine/                         # [Core] Framework-Agnostic Logic
│   ├── controllers/                # [Logic] Input Strategies (Cam, Char, Fly)
│   ├── features/                   # [Logic] High-level gameplay features (Spawner, LevelMgr, ObjManip)
│   ├── graphics/                   # [Render] Three.js abstractions
│   │   ├── materials/              # [Render] Custom Shader Factories
│   │   ├── textures/               # [Render] Canvas 2D Texture Generators
│   │   └── ...                     # [Render] Debug & Visuals
│   ├── input/                      # [Input] Raw pointer event handling
│   ├── logic/                      # [Logic] Pure math/transform utilities
│   ├── runtime/                    # [Core] Game Loop & System Scheduler
│   └── systems/                    # [ECS] Per-frame Logic Systems
├── physics/                        # [Core] Rapier3D integration
├── services/                       # [Glue] Angular Services (Facades & Factories)
│   ├── factories/                  # [Logic] Physics body creation logic
│   ├── generators/                 # [ProcGen] Geometry generation algorithms
│   │   ├── architecture/           # [ProcGen] Buildings & Roads
│   │   ├── interior/               # [ProcGen] Furniture & Decor
│   │   ├── nature/                 # [ProcGen] Trees, Rocks, Terrain
│   │   └── scifi/                  # [ProcGen] Space structures
│   └── ui/                         # [Logic] Layout state management
└── ...                             # [Root] Configs
```

## 2. Key File Mapping
| Pattern | Domain | Responsibility |
|---------|--------|----------------|
| `*.component.ts` | UI | View rendering, Signal consumption. |
| `*.service.ts` | Logic | State holding, API facades, Factory methods. |
| `*.system.ts` | Loop | `update(dt)` logic running every frame. |
| `*.scene.ts` | Content | Level initialization and scripting. |
| `*.config.ts` | Config | Static dictionaries (Materials, Assets). |
| `*.assets.ts` | Config | Asset-to-Generator mapping. |

## 3. Directory Invariants
*   **`src/engine/`**: Core systems. Should rarely depend on `src/components/`.
*   **`src/services/`**: The "Glue" layer. Connects Angular DI to Engine logic.
*   **`src/physics/`**: Direct Rapier3D wrappers. Isolated to prevent WASM leaks.
*   **`src/docs/`**: The Source of Truth for Architecture.
