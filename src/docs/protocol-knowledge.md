
# [PROTOCOL] Knowledge Integrity
> **Trigger**: `RUN_DOCS`
> **Target**: `src/docs/*.md`, `src/engine-api.md`
> **Version**: 2.1 (Zombie Detection)
> **Axiom**: "An outdated map is a trap. Documentation is Code."

## 1. Analysis Routine
1.  **Drift Scan**: Compare `src/engine-api.md` vs `EngineService`.
2.  **Zombie Scan**: Identify `.md` files that reference `.ts` files which no longer exist.
    *   *Action*: Mark as `[DEPRECATED]` in header or Delete.
3.  **Kernel Sync**: Ensure all Protocols cite `KERNEL_V6.1`.

## 2. Refinement Strategies
*   **Compression**: Reduce narrative. Use Tables.
*   **Auto-Doc**: When modifying a Facade, update `engine-api.md`.
*   **Vector Update**: Update `STATE_VECTOR` in `memory-stream.md`.

## 3. Heuristics (Dynamic)
*   *Observation*: `systems.md` is the most critical file for Agent grounding. It must be updated whenever a Service is created/deleted.

## 4. Meta-Update
**INSTRUCTION**: After update, verify `kernel.md` is the first file in the output list.
