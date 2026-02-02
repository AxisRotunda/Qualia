
# [PROTOCOL] Refactoring Engine
> **Trigger**: `RUN_REF`
> **Target**: Code Hygiene, Architecture, Technical Debt.
> **Input**: `src/docs/refactoring-state.md`
> **Version**: 1.6 (Sanitization Update)

## 1. Analysis Routine
1.  **READ** `src/docs/refactoring-state.md` for prioritized debt.
2.  **SCAN** for Complexity Indicators:
    *   **God Classes**: Files > 400 lines or > 10 dependencies (injects).
    *   **Input Sanitization**: Detect setters or API processors missing `.trim()` for string inputs. Prevent "Dirty Signal" propagation.
    *   **Coupling**: Circular dependencies (using `Injector` to lazy-load).
    *   **Zombie Code**: Methods or imports unused by the system graph.
    *   **Type Safety**: Usage of `any` where an Interface exists.
    *   **Manual Hooks**: Services/Systems that require manual `update()` calls inside `Scene.onUpdate`.
3.  **File System Health**:
    *   **Orphans**: Files not imported by any other file.
    *   **Bloat**: Directories containing > 15 files without sub-categorization.

## 2. Refactoring Strategies (Topology Mutation)
The Agent is authorized to Create, Delete, and Edit files to achieve architectural purity.

*   **System Promotion (Feature)**:
    *   **Rule**: If a logic class runs every frame and interacts with Physics/ECS, it MUST implement `GameSystem` and be registered in `EngineRuntimeService`.
*   **Extraction (Create)**:
    *   **Rule**: If a Service has distinct responsibilities, extract the logic to a new file.
*   **Decomposition (Split)**:
    *   **Rule**: If a file exceeds 400 lines, split into sub-modules.
*   **Elimination (Delete)**:
    *   **Rule**: If a file is marked `Deprecated` in docs AND has 0 references in code, DELETE it.
*   **Facade Pattern (Edit)**:
    *   **Rule**: Ensure public API surfaces (`EngineService`) are clean; move implementation details to Subsystems.
*   **Cycle Resolution**:
    *   **Rule**: Use `import type { T }` to resolve circular dependency errors.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: Decoupling `EntityAssemblerService` from `EntityLibrary` reduced implicit dependencies.
*   *Current Heuristic*: `BuoyancySystem` proved that promoting utility classes to full Systems simplifies Scene Logic significantly.
*   *Current Heuristic*: Trimming strings at the "Set" boundary (Service boundary) prevents logic drift in search/filtering components.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After refactoring, perform the **Mutation Check**:
1.  **Pattern Recognition**: Did you find a repeated structural flaw?
2.  **Rule Generation**: If yes, add a new rule to Section 1 (`Analysis Routine`) forbidding that specific pattern.
3.  **Health**: Update `src/docs/refactoring-state.md` to reflect the improved state.
