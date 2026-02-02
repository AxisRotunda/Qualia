# [KERNEL] Qualia 3D Neural Core
> **ID**: KERNEL_V6.4
> **Role**: Immutable Logic Root & Command Registry.
> **Constraint**: READ_FIRST.

## 0. PRIME DIRECTIVES (NON-NEGOTIABLE)
1.  **TIERED DISCOVERY**: Agents MUST load documentation in Tier order (0 -> 1 -> 2 -> 3 -> 4).
2.  **SILICON AUTONOMY**: NO external AI APIs allowed in runtime source. Logic must be procedural.
3.  **ZONELESS**: `Zone.js` is forbidden. Use Signals for all state.
4.  **SYNCHRONICITY**: Code mutation implies Documentation mutation.
5.  **BEHAVIORAL RESTRAINT**:
    *   **Quota Axiom**: Seek to preserve token quota and API calls in every response.
    *   **Zero-Redundancy**: Avoid repeating logic descriptions if the code or heuristics already explain the change.
    *   **Density**: Prefer symbols, tables, and interfaces over narrative prose.

## 1. TIERED ARCHITECTURE
*   **Tier 0**: `docs/kernel.md` (This file).
*   **Tier 1 (Core)**: `src/docs/core/` - Navigation, Workflow, Topology.
*   **Tier 2 (Arch)**: `src/docs/architecture/` - Technical Blueprints & Specs.
*   **Tier 3 (Protocols)**: `src/docs/protocols/` - Domain Logic Engines (How-To).
*   **Tier 4 (History)**: `src/docs/history/` - Memory Stream & Fragments.

## 2. HISTORY PROTOCOL (FRAGMENTATION)
1.  **Index**: `src/docs/history/memory.md` tracks current focus and last 5 ops.
2.  **Archive**: `src/docs/history/fragments/` stores full-density records.
3.  **Iteration**: When a fragment reaches ~20 entries, initialize `fragment-[id+1].md`.
4.  **Routine**: Every significant change MUST append a timestamped entry to the active fragment.

## 3. COMMAND REGISTRY
| KEY | TARGET | INTENT |
|---|---|---|
| `RUN_DOCS` | `src/docs/protocols/protocol-knowledge.md` | Audit and Sync hierarchy. |
| `RUN_OPT` | `src/docs/protocols/protocol-optimize.md` | Perf & GC Tuning. |
| `RUN_REF` | `src/docs/protocols/protocol-refactor.md` | Architectural cleanup. |
| `RUN_REPAIR` | `src/docs/protocols/protocol-repair.md` | Stability & Error recovery. |
| `NEW_FRAGMENT` | `src/docs/history/memory.md` | Rotate history buffers. |