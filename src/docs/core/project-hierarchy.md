# Project Hierarchy
> **Scope**: File System Map.
> **Audience**: AI Agents (Discovery).
> **Version**: 3.1 (Manifest Sync)

## 1. Documentation Tree (`src/docs/`)
```text
docs/
├── kernel.md                       # [Tier 0] Constitutional Root
├── core/                           # [Tier 1] Navigation & Discovery
│   ├── systems.md                  # Logic Map & Priorities
│   ├── commands.md                 # [NEW] Operational Registry
│   ├── migration-manifest.md       # [NEW] Structural Integrity Tracker
│   ├── project-hierarchy.md        # This file (Nav Map)
│   ├── knowledge-graph.md          # Adjacency Matrix
│   └── agent-workflow.md           # Operational Instructions
├── architecture/                   # [Tier 2] Blueprints & Specs
│   ├── ecs.md                      # SoA & Component logic
│   ├── graphics.md                 # Pipeline & Rendering
│   ├── physics.md                  # WASM & Materials
│   └── ...                         # Specifications
├── protocols/                      # [Tier 3] Logic Engines
│   ├── protocol-knowledge.md       # Tier Governance
│   ├── protocol-optimize.md        # Perf & GC
│   ├── protocol-refactor.md        # Arch cleanup
│   └── ...                         # Domain protocols
└── history/                        # [Tier 4] Memory & Logs
    ├── memory.md                   # Context Stream
    ├── system-instructions.md      # [UPDATED] Operational Directives
    └── fragments/                  # History archives
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