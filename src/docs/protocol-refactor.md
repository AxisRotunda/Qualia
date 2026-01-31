# [PROTOCOL] Refactoring Engine
> **Trigger**: `RUN_REF`
> **Target**: Code Hygiene, Architecture, Technical Debt.
> **Input**: `src/docs/refactoring-state.md`

## 1. Analysis Routine
1.  **READ** `src/docs/refactoring-state.md`.
2.  **IDENTIFY** Monolithic Classes (Lines > 400 or Deps > 10).
    *   *Current Targets*: `EntityAssemblerService`.
3.  **CHECK** Circular Dependencies (using `inject()` pattern vs Constructor).

## 2. Refactoring Strategies
*   **Extraction**: Move logic to `features/` or `logic/` helper services.
*   **Facade Pattern**: Ensure public API surfaces (`EngineService`) are clean.
*   **Strict Typing**: Replace `any` with interfaces defined in `src/engine/schema.ts`.

## 3. Meta-Update (Self-Optimization)
**INSTRUCTION**:
1.  If a file is split, UPDATE `src/docs/project-hierarchy.md`.
2.  If a Service dependency changes, UPDATE `src/docs/knowledge-graph.md`.
3.  Mark completed items in `src/docs/refactoring-state.md`.
