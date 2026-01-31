
# [PROTOCOL] Refactoring Engine
> **Trigger**: `RUN_REF`
> **Target**: Code Hygiene, Architecture, Technical Debt.
> **Input**: `src/docs/refactoring-state.md`
> **Version**: 1.2 (Self-Learning)

## 1. Analysis Routine
1.  **READ** `src/docs/refactoring-state.md`.
2.  **SCAN** for Complexity Indicators:
    *   **God Classes**: Files > 400 lines or > 10 dependencies (injects).
    *   **Coupling**: Circular dependencies (using `Injector` to lazy-load).
    *   **Zombie Code**: Methods or imports unused by the system graph.
    *   **Type Safety**: Usage of `any` where an Interface exists in `src/engine/schema.ts` or a Service exists.

## 2. Refactoring Strategies
*   **Extraction**: Move logic to `features/` or `logic/` helper services.
*   **Facade Pattern**: Ensure public API surfaces (`EngineService`) are clean; move implementation details to Subsystems.
*   **Strict Typing**: Replace `any` with interfaces defined in `src/engine/schema.ts`.
*   **Cycle Resolution**: Use `import type { T }` when a Facade service needs to be passed as an argument to a child service, but the child service is injected into the Facade. This prevents runtime circular dependency errors (NG0200) while maintaining type safety.
*   **Composition**: Prefer Composition (Services) over Inheritance.

## 3. Execution Template
```typescript
// [REFACTOR]: ServiceName
// [STRATEGY]: Extraction / Decoupling
// [ACTION]: Moved logic X to NewService Y.
```

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After refactoring, perform the **Mutation Check**:
1.  **Pattern Recognition**: Did you find a repeated structural flaw? (e.g., "Too many services injecting `SceneService`").
2.  **Rule Generation**: If yes, add a new rule to Section 1 (`Analysis Routine`) forbidding that specific pattern.
3.  **Graph Sync**: If a file was split or moved, YOU MUST UPDATE `src/docs/project-hierarchy.md` and `src/docs/knowledge-graph.md`.
4.  **Health**: Update `src/docs/refactoring-state.md` to reflect the improved state.
