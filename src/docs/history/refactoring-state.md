# Refactoring State & Technical Debt
> **Scope**: Codebase Health, Deprecation Log, Optimization Queue.
> **Status**: Living Document.
> **Tier**: Tier 4 (History/State)

## 4. Completed Refactors
*   **[COMPLETED] Knowledge Integrity Sync (Phase 88.5)**: Audited all `.md` documentation against modern codebase structure. Fixed broken service paths, updated frame-loop priorities, and synchronized the Engine API facade.
*   **[COMPLETED] Input Abstraction Layer (Phase 81.0)**: Migrated `GameInputService` to a semantic action-mapping system. Hardware keys are no longer hardcoded in getters.
*   **[COMPLETED] Visuals Pipeline Decomposition (Phase 81.0)**: Split `VisualsFactoryService` into specialized Material and Geometry resolvers.
*   **[COMPLETED] Facade Hardening (Phase 80.0)**: Tightened `EngineService` by converting manual getters to direct signal property aliases.
*   **[COMPLETED] Game Loop Interpolation (Phase 73.0)**: Decoupled simulation from render frequency. Implemented double-buffered transforms and alpha blending.

## 5. Strategic Technical Debt (Industry Approximation)
> **Trigger**: `RUN_INDUSTRY`
> **Priority**: High (Engine Foundation).

*   **[PENDING] Asset Streaming**:
    *   **Current**: All assets are procedurally generated or hardcoded.
    *   **Target**: Implement `ResourceLoader` for external GLB support.
    *   **Cost**: Low complexity, high impact.