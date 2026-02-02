# Project Hierarchy
> **Scope**: File System Map.
> **Audience**: AI Agents (Discovery).
> **Version**: 3.0 (Tiered Docs Sync)

## 1. Documentation Tree (`src/docs/`)
```text
docs/
├── kernel.md                       # [Tier 0] Neural Core / Registry
├── core/                           # [Tier 1] Navigation & Discovery
│   ├── systems.md                  # Logic Map & Priorities
│   ├── project-hierarchy.md        # This file (Nav Map)
│   ├── knowledge-graph.md          # Adjacency Matrix
│   └── agent-workflow.md           # Operational Instructions
├── architecture/                   # [Tier 2] Blueprints & Specs
│   ├── ecs.md                      # SoA & Component logic
│   ├── graphics.md                 # Pipeline & Rendering
│   ├── physics.md                  # WASM & Materials
│   ├── engine-api.md               # Public Facade
│   ├── combat.md                   # Weapons & Ballistics
│   └── ...                         # Logic specifications
├── protocols/                      # [Tier 3] Logic Engines
│   ├── protocol-knowledge.md       # Tier Governance
│   ├── protocol-optimize.md        # Perf & GC
│   ├── protocol-refactor.md        # Arch cleanup
│   ├── protocol-flora.md           # Botanical synth
│   └── ...                         # Domain protocols
└── history/                        # [Tier 4] Memory & Logs
    ├── memory.md                   # Context Stream
    ├── refactoring.md              # Tech Debt State
    ├── optimization.md             # Benchmark Report
    └── logs/                       # Repair & Panic logs
```

## 2. Source Tree (`src/`)
```text
src/
├── app.component.ts                # [Entry] Root Component
├── components/                     # [UI] UI View Layer
├── config/                         # [Data] PBR & Physics Configs
├── content/                        # [Level] Algorithms & Scenes
├── data/                           # [Data] Static ECS Templates
├── engine/                         # [Core] Framework-Agnostic Logic
├── physics/                        # [Core] Rapier3D Integration
└── services/                       # [Glue] Facades & Assemblees
```