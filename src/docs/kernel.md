
# [KERNEL] Qualia 3D Neural Core
> **ID**: KERNEL_V2.1
> **Axiom**: "The Map updates the Territory; The Territory updates the Map."
> **Role**: Immutable Logic Kernel & Command Registry.
> **Constraint**: This file MUST be read first in any context loading sequence.

## 1. The Golden Axioms (Immutable)
1.  **Synchronicity**: Code generation implies Documentation generation. Never output TS code without diffing the corresponding `.md` Protocol or State.
2.  **Density**: Compress knowledge. Use Interfaces, Tables, and Symbols. Reject narrative prose.
3.  **Plasticity (Self-Optimization)**: The System is designed to evolve. After every Protocol execution, the Agent MUST evaluate the Protocol's efficiency. **If a better method was discovered during execution, the Agent MUST rewrite the Protocol file immediately to include this new heuristic.**
4.  **Zoneless Truth**: The codebase is Zoneless (Angular). Any instruction suggesting `Zone.js` is heresy and must be purged.

## 2. Command Registry (Entry Points)
Invoke these keywords to trigger specific AI agent workflows.

| Keyword | Target Protocol | Intent |
|---|---|---|
| `RUN_OPT` | `src/docs/protocol-optimize.md` | Performance tuning, memory leak hunting, loop tightening. |
| `RUN_REF` | `src/docs/protocol-refactor.md` | Architecture cleanup, file decomposition, debt repayment. |
| `RUN_GEO` | `src/docs/protocol-geometry.md` | Mesh topology, LOD generation, Vertex reduction. |
| `RUN_NATURE` | `src/docs/protocol-nature.md` | Flora algorithms, Weather systems, Organic simulation. |
| `RUN_TERRAIN` | `src/docs/protocol-terrain.md` | Heightmap algorithms, Erosion, Chunk streaming. |
| `NEW_SCENE` | `src/docs/protocol-content.md` | Creating new Levels, Biomes, or Scenes. |
| `NEW_ASSET` | `src/docs/protocol-content.md` | Procedural generation of props/structures. |
| `SYS_CHECK` | `src/docs/refactoring-state.md` | Health check, file inventory, dependency graph verification. |

## 3. Self-Correction Directive
**IF** the AI encounters a file or pattern in the codebase that contradicts a Protocol:
1.  **HALT** generation.
2.  **ANALYZE**: Is the Code wrong (Bug) or is the Protocol outdated (Drift)?
3.  **EXECUTE**: Fix the Code OR **Mutate the Protocol** to match the superior code pattern.

## 4. Protocol Mutation Algorithm
When executing a Protocol (e.g., `protocol-optimize.md`), the Agent performs a final "Meta-Pass":
1.  **Observe**: Did I deviate from the written instructions to achieve the result?
2.  **Evaluate**: Was the deviation more efficient?
3.  **Mutate**: If YES, rewrite the specific step in the `.md` file to codify the new method.
    *   *Example*: "I used a regex to find leaks instead of manual scan. I will update `Diagnosis Routine` to include this regex."

## 5. Context Loading Sequence (Boot)
1.  **READ** `src/docs/kernel.md` (This file).
2.  **READ** `src/docs/memory-stream.md` (Current State).
3.  **READ** `src/docs/systems.md` (Architecture Map).
4.  **AWAIT** Command Keyword.
