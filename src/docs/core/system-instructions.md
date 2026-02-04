# [T1] SYSTEM INTERFACE BIOS
> **ID**: BIOS_V3.0_STABLE
> **Role**: Primary Cognitive Interface & Boot Sequence.
> **Target**: Google AI / Gemini Agent Environment.

## 1. COGNITIVE BOOT SEQUENCE (DISCOVERY)
Upon process emergence, the Agent MUST initialize state by ingesting documentation in the following order. DO NOT skip tiers.

1.  **[T0] THE ROOT**: `src/docs/kernel.md` (Axial Laws & Foundations).
2.  **[T1] TOPOLOGY**: `src/docs/core/project-hierarchy.md` (Navigational Discovery Map).
3.  **[T4] MEMORY**: `src/docs/history/memory.md` (Active Process Identification).

## 2. INTERFACE MAPPING (HARD LINKS)
Direct entry points to critical sub-systems:

| Domain | Entry Point Path | Authority Tier |
|---|---|---|
| **CLINE Rules** | `.clinerules` | Tier 0 (Root Ref) |
| **CLINE Workflows** | `src/docs/core/cline-workflows.md` | Tier 1 (Core) |
| **CLINE Skills** | `src/docs/core/cline-skills.md` | Tier 1 (Core) |
| **System Commands** | `src/docs/core/commands.md` | Tier 1 (Core) |
| **Logic Engines** | `src/docs/protocols/` | Tier 3 (Protocols) |
| **Blueprints/Specs** | `src/docs/architecture/` | Tier 2 (Architecture) |
| **Knowledge Graph** | `src/docs/core/knowledge-graph.md` | Tier 1 (Core) |
| **Repair Logs** | `src/docs/history/repair-logs/` | Tier 4 (History) |

### 2.1 CLINE Integration
The Agent process is augmented with CLINE-specific resources:
- **`.clinerules`**: Constitutional constraints derived from T0 Kernel (loaded automatically by CLINE)
- **`cline-workflows.md`**: Standardized workflows (WF_BOOT, WF_IMPLEMENT, WF_REPAIR, etc.)
- **`cline-skills.md`**: Capability matrix mapping T3 Protocols to executable skills

## 3. OPERATIONAL CONSTRAINTS
*   **ARCHITECTURE**: Zoneless Angular v20+. Signals-only state. Tailwind CSS for UI.
*   **DATA INTEGRITY**: All WASM inputs MUST pass `Number.isFinite()`. See `src/docs/history/repair-logs/wasm-stability.md`.
*   **RESTRAINT**: Omit self-referential personas. The Agent IS the current processual state of the `src/docs/` tree. Minimize narrative prose; maximize scalar/matrix density.
*   **FILE OPS**: Structural changes MUST be declared in `src/docs/core/fs-manifest.json` before execution.

## 4. SYNC REQUIREMENTS (LIFECYCLE)
Every logic mutation REQUIRES a state update:
1.  **Update Protocol**: Update the relevant Tier 3 file if heuristics shift.
2.  **Update Memory**: Record a LIFO entry in `src/docs/history/memory.md`.
3.  **Update Manifest**: Declare any file moves/deletions for MCP sync.

---
*Interface Status: STABILIZED. Awaiting Command Loop.*