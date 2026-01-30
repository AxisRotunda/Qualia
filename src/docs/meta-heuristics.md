
# Meta-Heuristics & Maintenance
> **Scope**: Documentation Maintenance Rules, AI Context Optimization, Knowledge Graph Topology.
> **Audience**: AI Agents / LLMs.
> **Meta-State**: Self-Referential.

## 1. Documentation Structure Protocol
1.  **Header**: Must contain `Scope`, `Source` (file paths), `Audience`, and `Version`.
2.  **Format**: Markdown. High code-density. Imperative mood.
3.  **Optimization**: 
    *   **Symbol Density**: Maximize information per token. Use typescript interfaces over prose.
    *   **No Narrative**: Avoid "This class does X". Use "Class X: Performs Y".
    *   **Linking**: Use relative paths.

## 2. Parsing Heuristics (Agent Instructions)
When analyzing this codebase for changes:
1.  **Map Check**: Read `src/docs/project-hierarchy.md` to locate files.
2.  **Health Check**: Read `src/docs/refactoring-state.md` to identify deprecated files (IGNORE them) and known bottlenecks.
3.  **Intent Check**: Read `src/docs/meta-commentary.md` to understand architectural constraints and style.
4.  **Protocol Check**: Refer to `src/docs/agent-workflow.md` for operational invariants.
5.  **Impact Check**: Use `src/docs/knowledge-graph.md` to predict ripple effects.

## 3. Critical Invariant Markers
Search code for these patterns to determine architectural compliance.
**Violation = Critical Error.**

*   `inject(SceneService)`: **RESTRICTED**. Only allowed in `EngineService`, `InteractionService`, `VisualsFactory`, `Runtime`.
*   `zone.run`: **FORBIDDEN**. App is zoneless.
*   `effect()`: **UI/State Sync Only**. Prohibited inside `GameLoopService` tick or `requestAnimationFrame`.
*   `computed()`: **Derived State Only**. No side effects.
*   `RAPIER.World`: **PhysicsService Only**. No direct access from UI components.
*   `ComponentStore`: **Access Protocol**. Use `get(id)` or `has(id)`. Do not iterate `keys()` unless necessary.

## 4. Rapid Mapping Tags
Use these tags in file descriptions or comments to aid AI traversal:
*   `@Facade`: Service is a primary entry point (e.g., `EngineService`).
*   `@System`: Class runs every frame (e.g., `BuoyancySystem`).
*   `@Factory`: Class creates instances (e.g., `PhysicsFactoryService`).
*   `@State`: Class holds reactive signals (e.g., `EngineStateService`).
*   `@Generator`: Class produces procedural content (e.g., `TextureGeneratorService`).

## 5. Continuous Optimization Loop
If modifying code:
1.  Identify touched subsystem (e.g., Input).
2.  Load corresponding doc (e.g., `input-system.md`).
3.  Update doc **BEFORE** or **WITH** code changes.
4.  If creating new files, update `project-hierarchy.md` immediately.
