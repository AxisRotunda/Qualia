# Refactoring State & Technical Debt
> **Scope**: Codebase Health, Deprecation Log, Optimization Queue.
> **Status**: Living Document.

## 4. Completed Refactors
*   **[COMPLETED] Input Abstraction Layer (Phase 81.0)**: Migrated `GameInputService` to a semantic action-mapping system. Hardware keys are no longer hardcoded in getters.
*   **[COMPLETED] Visuals Pipeline Decomposition (Phase 81.0)**: Split `VisualsFactoryService` into specialized Material and Geometry resolvers.
*   **[COMPLETED] Facade Hardening (Phase 80.0)**: Tightened `EngineService` by converting manual getters to direct signal property aliases. Reduced function call overhead in Zoneless change detection.
*   **[COMPLETED] Combat Integration (Phase 80.0)**: Promoted `WeaponService` to public `EngineService.combat` facade. Eliminated unsafe `Injector.get` workarounds in UI config.
*   **[COMPLETED] Game Loop Interpolation (Phase 73.0)**: Decoupled simulation from render frequency. Implemented double-buffered transforms and alpha blending. Resolved "judder" artifacts on high-Hz displays.
*   **[COMPLETED] Mobile Fill-Rate Hardening (Phase 73.0)**: Enforced strict pixel ratio and antialiasing caps for touch devices. 

## 5. Strategic Technical Debt (Industry Approximation)
> **Trigger**: `RUN_INDUSTRY`
> **Priority**: High (Engine Foundation).

*   **[PENDING] Asset Streaming**:
    *   **Current**: All assets are procedurally generated or hardcoded.
    *   **Target**: Implement `ResourceLoader` for external GLB support.
    *   **Cost**: Low complexity, high impact.
