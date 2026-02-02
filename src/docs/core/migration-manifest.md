# Migration Manifest
> **Status**: COMPLETED (100%)
> **ID**: MIGRATE_TIERED_V3
> **Axiom**: "Delete the Duplicate. Verify the Path."

## 1. COMPLETED TRANSITIONS
All legacy files moved to their respective tiered directories.

*   [x] `math-algorithms.md` -> `src/docs/architecture/`
*   [x] `optimization-report.md` -> `src/docs/history/`
*   [x] `persistence-schema.md` -> `src/docs/architecture/`
*   [x] `graphics-pipeline.md` -> `src/docs/architecture/`
*   [x] `interaction-model.md` -> `src/docs/architecture/`
*   [x] `runtime-architecture.md` -> `src/docs/architecture/`
*   [x] `state-topology.md` -> `src/docs/architecture/`
*   [x] `ui-architecture.md` -> `src/docs/architecture/`
*   [x] `content-pipeline.md` -> `src/docs/architecture/`
*   [x] `scene-logic.md` -> `src/docs/architecture/`
*   [x] `layout-topology.md` -> `src/docs/architecture/`
*   [x] `control-schemes.md` -> `src/docs/architecture/`
*   [x] `combat-system.md` -> `src/docs/architecture/`
*   [x] `input-system.md` -> `src/docs/architecture/`
*   [x] `mobile-strategy.md` -> `src/docs/architecture/`
*   [x] `knowledge-graph.md` -> `src/docs/core/`
*   [x] `agent-workflow.md` -> `src/docs/core/`
*   [x] `meta-heuristics.md` -> `src/docs/core/`
*   [x] `meta-commentary.md` -> `src/docs/history/`
*   [x] All `repair-log-*.md` -> `src/docs/history/repair-logs/`
*   [x] All `protocol-*.md` -> `src/docs/protocols/`
*   [x] `engine-api.md` -> `src/docs/architecture/`
*   [x] `physics-integration.md` -> `src/docs/architecture/`
*   [x] `refactoring-state.md` -> `src/docs/history/`

## 2. DUPLICATE PURGE LOG
| Duplicate Found | Resolution | Date |
|---|---|---|
| `src/docs/*.md` | Deleted. Root folder now contains only `kernel.md` and Tier folders. | 2025-05-20 |
| `src/engine-api.md` | Deleted. Moved to Architecture. | 2025-05-20 |

## 3. CONSOLIDATION RULES
1.  **No MD in root**: The `src/docs/` directory must only contain `kernel.md` and Tier subdirectories.
2.  **Relative Linking**: All cross-references must use relative paths.
3.  **Single Source of Truth**: If a Protocol is described in an Architecture doc, delete it from the Architecture doc and link to the Protocol.