# [T0] Tiered Architecture
> **ID**: ARCH_TIERS_V1.0
> **Role**: Knowledge Classification.

## 1. HIERARCHY DEFINITION

### T0: THE ROOT (`src/docs/kernel/`)
Constitutional laws and core principles. The definition of the "Self" for the agent.

### T1: CORE (`src/docs/core/`)
Navigation, Command definitions, Discovery maps, and Agent Workflow instructions.

### T2: ARCHITECTURE (`src/docs/architecture/`)
Technical blueprints. PBR standards, ECS schemas, Physics integration, and UI patterns.

### T3: PROTOCOLS (`src/docs/protocols/`)
Domain-specific logic engines (e.g., `protocol-flora`, `protocol-vfx`).

### T4: HISTORY (`src/docs/history/`)
Temporal logs, memory fragments, and repair history.

## 2. DISCOVERY PROTOCOL
Agents must scan from T0 downward to establish the context of the current system state.