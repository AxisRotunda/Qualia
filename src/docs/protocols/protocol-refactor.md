# [PROTOCOL] Refactoring Engine
> **Trigger**: `RUN_REF`
> **Target**: Code Hygiene, Architecture, Technical Debt.
> **Input**: `../history/refactoring.md`
> **Version**: 1.6 (Tiered Migration)

## 1. Analysis Routine
1.  **God Classes**: Files > 400 lines or > 10 dependencies.
2.  **Input Sanitization**: Detect missing `.trim()` for string inputs at boundaries.
3.  **Coupling**: Identify circular dependencies resolved via `Injector`.
4.  **Zombie Code**: Detect unused methods or imports.

## 2. Refactoring Strategies (Topology Mutation)
*   **System Promotion**: If logic runs every frame, move to `GameSystem`.
*   **Extraction**: Separate distinct responsibilities into new files.
*   **Elimination**: DELETE deprecated files with 0 references.
*   **Facade Pattern**: Keep `EngineService` API clean; move details to Subsystems.

## 3. Meta-Update (Self-Optimization)
**INSTRUCTION**: After refactoring, perform the **Mutation Check**:
1.  **Pattern Recognition**: If a structural flaw repeats, add a new rule to Section 1.
2.  **Health**: Update `src/docs/history/refactoring.md`.