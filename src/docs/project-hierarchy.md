# Project Hierarchy
> **Scope**: File System Map, Directory Intent.
> **Audience**: AI Agents.
> **Update Trigger**: File creation/deletion/move.
> **Version**: 2.6 (Sub-Generator & Feature Sync)

## 1. Root Structure
```text
src/
├── app.component.ts                # [Entry] Root Angular component
├── components/                     # [UI] Angular Components (View Layer)
│   ├── inspector/                  # [UI] Entity/World manipulation panels
│   │   └── tabs/                   # [UI] World-level settings categorization
│   ├── menu/                       # [UI] Main menu and navigation system
│   ├── ui/                         # [UI] HUD, Virtual Joysticks, Drawers
│   │   ├── hud/                    # [UI] Combat/Tactical overlays
│   │   └── touch/                  # [UI] Mobile-specific interaction layers
├── config/                         # [Data] Hard-Realism Asset & Material definitions
│   ├── assets/                     # [Data] Domain-specific asset configurations
│   └── ...                         # [Data] PostProcess, Atmosphere, Physics configs
├── content/                        # [Level] Scene definitions and Algorithms
│   ├── algorithms/                 # [Level] Procedural generation engines (City, Ice, etc.)
│   └── scenes/                     # [Level] Scene presets and environment logic
├── data/                           # [Data] Static Templates (ECS definitions)
│   └── templates/                  # [Data] Category-mapped entity definitions
├── docs/                           # [Meta] System Documentation (Tier 0-5)
├── engine/                         # [Core] Framework-Agnostic Engine Logic
│   ├── controllers/                # [Logic] Input Strategies (Walk, Fly, Camera)
│   ├── ecs/                        # [Core] SoA Component Stores & Entity World
│   ├── events/                     # [Logic] Semantic Event Definitions
│   ├── features/                   # [Logic] Engine Feature Modules
│   │   ├── city/                   # [Logic] Urban grid & road generation
│   │   ├── combat/                 # [Logic] Weapons, Ballistics, Viewmodels
│   │   ├── vfx/                    # [Logic] Particle Pooling & Emission
│   │   └── ...                     # [Logic] Spawner, Placement, Terrain, Transform
│   ├── graphics/                   # [Render] Three.js abstractions & Shaders
│   │   ├── geometry/               # [Render] Specialized mesh resolvers
│   │   ├── materials/              # [Render] Custom Shader Injections & Factories
│   │   ├── shaders/                # [Render] GLSL Chunks (Nature, Water, Fog)
│   │   ├── textures/               # [Render] Procedural synthesis orchestrators
│   │   └── ...                     # [Render] Instancing, Visibility, Renderer
│   ├── input/                      # [Logic] Hardware Normalization & Listeners
│   ├── interaction/                # [Logic] Raycasting & Selection Logic
│   ├── level/                      # [Logic] Scene Loader & Context API
│   ├── logic/                      # [Logic] Pure Math & Celestial Engines
│   ├── runtime/                    # [Core] Game Loop & System Scheduler
│   ├── systems/                    # [ECS] Per-frame Logic Systems (Priority 0-1100)
│   ├── utils/                      # [Utils] String/Thread/Worker helpers
│   └── workers/                    # [Core] Inline Worker Root Scripts
│       ├── terrain/                # [Worker] Heightfield & Erosion code
│       └── textures/               # [Worker] Procedural PBR Generators
├── physics/                        # [Core] Rapier3D WASM Integration
│   ├── logic/                      # [Logic] Mass/Scale/Interaction algorithms
│   └── optimization/               # [Logic] Bitmask & Rigidity presets
├── services/                       # [Glue] Angular Facades (UI to Engine)
│   ├── factories/                  # [Glue] Entity assembly pipelines
│   ├── generators/                 # [Glue] Procedural Asset Geometry Dispatchers
│   │   ├── actor/                  # [Glue] Biological/Robotic anatomy
│   │   ├── architecture/           # [Glue] Civil & Infrastructure geometry
│   │   ├── combat/                 # [Glue] Weapon & Projectile design
│   │   ├── interior/               # [Glue] Furnishing & Structural geometry
│   │   ├── nature/                 # [Glue] Flora, Geology & Terrain dispatchers
│   │   └── scifi/                  # [Glue] Advanced Station & Vessel geometry
│   └── ui/                         # [Glue] Accessibility & Layout management
└── ...                             # [Root] Angular Bootstrap & Configs
```