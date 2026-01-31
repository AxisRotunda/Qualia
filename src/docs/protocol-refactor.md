
# [PROTOCOL] Refactoring Engine
> **Trigger**: `RUN_REF`
> **Target**: Code Hygiene, Architecture, Technical Debt.
> **Input**: `src/docs/refactoring-state.md`
> **Version**: 1.4 (Evolution - System Promotion)

## 1. Analysis Routine
1.  **READ** `src/docs/refactoring-state.md` for prioritized debt.
2.  **SCAN** for Complexity Indicators:
    *   **God Classes**: Files > 400 lines or > 10 dependencies (injects).
    *   **Coupling**: Circular dependencies (using `Injector` to lazy-load).
    *   **Zombie Code**: Methods or imports unused by the system graph.
    *   **Type Safety**: Usage of `any` where an Interface exists in `src/engine/schema.ts` or a Service exists.
    *   **Manual Hooks**: Services/Systems that require manual `update()` calls inside `Scene.onUpdate` instead of being registered in `EngineRuntime`.
3.  **File System Health**:
    *   **Orphans**: Files not imported by any other file (excluding entry points like `main.ts`).
    *   **Bloat**: Directories containing > 15 files without sub-categorization.

## 2. Refactoring Strategies (Topology Mutation)
The Agent is authorized to Create, Delete, and Edit files to achieve architectural purity.

*   **System Promotion (Feature)**:
    *   **Rule**: If a logic class runs every frame and interacts with Physics/ECS, it MUST implement `GameSystem` and be registered in `EngineRuntimeService`.
    *   **Action**: Implement interface -> Register in Runtime -> Remove manual calls.
*   **Extraction (Create)**:
    *   **Rule**: If a Service has distinct responsibilities (e.g., Physics logic inside a Renderer), extract the logic to a new file `src/[domain]/[feature].service.ts`.
    *   **Action**: Create new file -> Update imports -> Update `project-hierarchy.md`.
*   **Decomposition (Split)**:
    *   **Rule**: If a file exceeds 400 lines, split into `[name].core.ts` and `[name].utils.ts` or specific sub-modules.
*   **Elimination (Delete)**:
    *   **Rule**: If a file is marked `Deprecated` in docs AND has 0 references in code, DELETE it.
    *   **Action**: Delete file -> Remove from `refactoring-state.md` -> Remove from `project-hierarchy.md`.
*   **Facade Pattern (Edit)**:
    *   **Rule**: Ensure public API surfaces (`EngineService`) are clean; move implementation details to Subsystems.
*   **Cycle Resolution**:
    *   **Rule**: Use `import type { T }` to resolve circular dependency errors (NG0200).

## 3. Self-Learning Heuristics (Dynamic)
> **Status**: Learning Active.
*   *Current Heuristic*: `BuoyancySystem` proved that promoting utility classes to full Systems simplifies Scene Logic significantly and reduces boilerplate.
*   *Current Heuristic*: `EntityAssemblerService` creates excessive coupling between Physics and Visuals. Moving visual creation to `VisualsFactoryService` reduced dependencies by 30%.
*   *Current Heuristic*: Inline Web Workers (`.const.ts`) are superior to separate files for build simplicity, but require strict string concatenation rules.
*   *Current Heuristic*: Using `Injector` for lazy-loading `EngineService` inside `SceneLogicSystem` prevents 90% of circular dependency crashes.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After refactoring, perform the **Mutation Check**:
1.  **Pattern Recognition**: Did you find a repeated structural flaw? (e.g., "Too many services injecting `SceneService`").
2.  **Rule Generation**: If yes, add a new rule to Section 1 (`Analysis Routine`) forbidding that specific pattern.
3.  **Graph Sync**: If a file was split, moved, or deleted, YOU MUST UPDATE `src/docs/project-hierarchy.md` and `src/docs/knowledge-graph.md`.
4.  **Health**: Update `src/docs/refactoring-state.md` to reflect the improved state.
