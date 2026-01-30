
# Agent Workflow & Protocols
> **Scope**: Operational Instructions for AI Agents modifying the Codebase.
> **Audience**: LLMs / AI Agents.
> **Version**: 1.0

## 1. Context Loading Phase
Before generating code, the Agent MUST perform a topographic scan.
1.  **Read `src/docs/systems.md`**: Establish the root map.
2.  **Identify Target Subsystem**: Locate the relevant detailed doc (e.g., `physics-integration.md`).
3.  **Verify Invariants**: Check `src/docs/meta-heuristics.md` for forbidden patterns (e.g., `zone.run`).

## 2. Invariant Checking (Pre-Flight)
The Agent must simulate a compilation check against these rules:
*   **Zoneless**: Do NOT import `Zone` or `NgZone`. Use Signals.
*   **HTML Validity**: All tags must be closed. No Regex in templates.
*   **Injection**: `inject()` token usage must be strictly typed.
*   **Three.js**: Never extend `THREE` classes directly if composition is possible.
*   **Rapier**: Never access `RAPIER.World` outside `PhysicsService` / `PhysicsWorldService`.

## 3. Modification Protocol
When requested to change a feature:
1.  **Spec**: Define the change in abstract terms (Specification Block).
2.  **Refactor**: Identify which files need modification.
3.  **Doc Update**: Determine which `src/docs/*.md` files are invalidated by this change.
4.  **Execute**: Output the code changes AND the doc updates in the same response block (if possible) or sequentially.

## 4. Documentation Maintenance
*   **State Drift**: If you change a function signature in `src/services/*.ts`, you MUST update the corresponding markdown.
*   **New Features**: If creating a new Service, add a reference to `src/docs/systems.md`.
*   **Deprecation**: If removing a file, mark it as deprecated in docs or remove the entry.

## 5. Specific Domain Rules

### 5.1 Physics
*   **Updates**: Use `PhysicsService.updateBodyTransform` or `applyImpulse`. Never set `transform.position` on a dynamic body directly unless teleporting.
*   **Scaling**: Always use `PhysicsService.updateBodyScale` to ensure colliders match visuals.

### 5.2 Graphics
*   **Assets**: Use `AssetService` for geometry. Do not instantiate `new BoxGeometry` inside Components (Use `VisualsFactory`).
*   **Materials**: Register new materials in `MaterialService` config, do not instantiate `new MeshStandardMaterial` inside Components.

### 5.3 UI
*   **Signals**: UI Components should only READ signals.
*   **Actions**: UI Components should emit Output events or call Service Facade methods.
