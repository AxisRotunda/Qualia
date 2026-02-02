# [PROTOCOL] Refactoring Engine
> **Trigger**: `RUN_REF`
> **Target**: Code Hygiene, Architecture, Technical Debt.
> **Input**: `../history/refactoring.md`
> **Version**: 2.1 (MCP Integration)

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

## 3. Structural Organization Protocol (Declarative Filesystem)
To prevent "orphaned" or "ghost" files during complex refactors:

1.  **Declaration**: Whenever files are to be moved or deleted, update `src/docs/core/fs-manifest.json`.
2.  **MCP Execution (Primary)**:
    *   If `@modelcontextprotocol/server-filesystem` is available:
    *   Use `list_allowed_directories` to verify the environment.
    *   Execute the `move_file` or `delete_file` tools to synchronize the manifest immediately.
    *   Update the manifest status to `completed`.
3.  **Script Execution (Fallback)**:
    *   If no filesystem tools are available, leave the manifest in `pending`.
    *   The user will utilize the **Node.js Sync Utility** in the System Ops UI to finalize the changes manually.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After refactoring, perform the **Mutation Check**:
1.  **Pattern Recognition**: If a structural flaw repeats, add a new rule to Section 1.
2.  **Health**: Update `src/docs/history/refactoring-state.md`.