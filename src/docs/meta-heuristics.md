
# Meta-Heuristics & Maintenance
> **Scope**: Documentation Maintenance, AI Context Optimization, Knowledge Graph Topology.
> **Audience**: AI Agents / LLMs.
> **Version**: 2.0 (Agent-Readability)

## 1. Documentation Structure Protocol
1.  **Header**: Must contain `Scope`, `Source`, `Audience`, and `Version`.
2.  **Format**: Markdown. High code-density. Imperative mood.
3.  **Linking**: Use relative paths `[Label](./file.md)`.

## 2. Agent-Readability Protocol (Code Generation)
To maximize the efficiency of future AI sessions reading this code:
1.  **Explicit Types**: Return types MUST be explicit. Avoid `infer` where complex objects are returned.
    *   *Good*: `function getPos(): THREE.Vector3 { ... }`
    *   *Bad*: `function getPos() { return this.pos; }`
2.  **Immutable Interfaces**: Define `readonly` on properties that should not be mutated by consumers.
3.  **Semantic Grouping**: Group class properties by domain (e.g., `// Dependencies`, `// State`, `// Config`, `// Scratch`).
4.  **Zero-Ambiguity**: Avoid variable names like `data` or `item`. Use `physicsBodyDef` or `weaponTemplate`.

## 3. Parsing Heuristics (Agent Instructions)
1.  **Map Check**: Read `src/docs/systems.md` to establish the root hierarchy.
2.  **Invariant Check**: Search code for `CRITICAL`, `FIXME`, or `VIOLATION` comments.
3.  **Health Check**: Read `src/docs/refactoring-state.md`.

## 4. Critical Invariant Markers
*   `inject(SceneService)`: **RESTRICTED**.
*   `zone.run`: **FORBIDDEN**.
*   `effect()`: **UI/State Sync Only**.
*   `RAPIER.World`: **PhysicsService Only**.

## 5. Cognitive Load Management
*   **File Size**: Keep files < 300 lines. If larger, Split.
*   **Context Window**: When updating docs, do not output the entire file if only one section changed. Use precise `sed`-like edits or targeted XML replacement if the tool allows (currently utilizing full-file replacement for safety).
*   **Summary**: `memory-stream.md` must be pruned. Keep only the last 10 significant actions.

## 6. Continuous Optimization Loop
**INSTRUCTION**: Whenever code is generated, the Agent MUST verify if documentation needs updating.
1.  **Identify**: Which subsystem changed?
2.  **Load**: Corresponding doc.
3.  **Update**: If API signature changed -> Update Markdown.
