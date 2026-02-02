# Migration Manifest
> **Status**: IN_PROGRESS (70%)
> **ID**: MIGRATE_TIERED_V1
> **Axiom**: "Delete the Duplicate. Verify the Path."

## 1. PENDING TRANSITIONS
Files currently in root `src/docs/` that MUST move to Tiered directories:

*   [ ] `math-algorithms.md` -> `src/docs/architecture/`
*   [ ] `optimization-report.md` -> `src/docs/history/`
*   [ ] `persistence-schema.md` -> `src/docs/architecture/`
*   [ ] `graphics-pipeline.md` -> `src/docs/architecture/`
*   [ ] `interaction-model.md` -> `src/docs/architecture/`

## 2. COMPLETED TRANSITIONS
*   [x] `systems.md` -> `src/docs/core/systems.md` (LEGACY DELETED)
*   [x] `project-hierarchy.md` -> `src/docs/core/project-hierarchy.md`
*   [x] `ecs-architecture.md` -> `src/docs/architecture/ecs-architecture.md`
*   [x] `memory-stream.md` -> `src/docs/history/memory.md`

## 3. DUPLICATE PURGE LOG
| Duplicate Found | Resolution | Date |
|---|---|---|
| `src/docs/systems.md` | Deleted. Authority moved to `core/systems.md`. | 2025-05-20 |
| `src/docs/physics-integration.md` | Pending deletion. Authority moved to `architecture/physics-integration.md`. | 2025-05-20 |

## 4. CONSOLIDATION RULES
1.  **No MD in root**: The `src/docs/` directory must only contain `kernel.md` and Tier subdirectories.
2.  **Relative Linking**: All cross-references must use relative paths.
3.  **Single Source of Truth**: If a Protocol is described in an Architecture doc, delete it from the Architecture doc and link to the Protocol.
