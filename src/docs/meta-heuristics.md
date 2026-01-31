
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
    *   **Linking**: Use relative paths `[Label](./file.md)`.

## 2. Parsing Heuristics (Agent Instructions)
When analyzing this codebase for changes:
1.  **Map Check**: Read `src/docs/systems.md` to establish the root hierarchy.
2.  **Math Check**: If touching Physics, Terrain, or Shaders, consult `src/docs/math-algorithms.md`.
3.  **Health Check**: Read `src/docs/refactoring-state.md` to identify deprecated files and bottlenecks.
4.  **Intent Check**: Read `src/docs/meta-commentary.md` to align with "Hard Realism" constraints.
5.  **Impact Check**: Use `src/docs/knowledge-graph.md` to predict ripple effects.

## 3. Critical Invariant Markers
Search code for these patterns to determine architectural compliance.
**Violation = Critical Error.**

*   `inject(SceneService)`: **RESTRICTED**. Only allowed in `EngineService`, `VisualsFactory`, `Runtime`, `Raycaster`.
*   `zone.run`: **FORBIDDEN**. App is zoneless.
*   `effect()`: **UI/State Sync Only**. Prohibited inside `GameLoopService` tick or `requestAnimationFrame`.
*   `computed()`: **Derived State Only**. No side effects.
*   `RAPIER.World`: **PhysicsService Only**. No direct access from UI components.
*   `ComponentStore`: **Access Protocol**. Use `get(id)` or `has(id)`. Do not iterate `keys()` unless necessary.

## 4. Rapid Mapping Tags
Use these tags in file descriptions or comments to aid AI traversal:
*   `@Facade`: Service is a primary entry point (e.g., `EngineService`).
*   `@Feature`: High-level game logic module (e.g., `EntityOpsService`).
*   `@System`: Class runs every frame (e.g., `BuoyancySystem`).
*   `@Factory`: Class creates instances (e.g., `PhysicsFactoryService`).
*   `@State`: Class holds reactive signals (e.g., `EngineStateService`).
*   `@Generator`: Class produces procedural content (e.g., `TextureGeneratorService`).

## 5. Continuous Optimization Loop
**Instruction**: Whenever code is generated, the Agent MUST verify if documentation needs updating.
1.  **Identify**: Which subsystem changed?
2.  **Load**: Corresponding doc.
3.  **Update**:
    *   If API signature changed -> Update Markdown interface defs.
    *   If **Formula/Algorithm** changed -> Update `math-algorithms.md`.
    *   If new file added -> Update `project-hierarchy.md`.
    *   If new architectural pattern -> Update `systems.md`.
4.  **Verify**: Ensure no `todo` or `deprecated` markers remain in active docs.
