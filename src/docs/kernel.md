# [KERNEL] Qualia 3D Neural Core
> **ID**: KERNEL_V1
> **Axiom**: "The Map updates the Territory; The Territory updates the Map."
> **Role**: Immutable Logic Kernel & Command Registry.
> **Constraint**: This file MUST be read first in any context loading sequence.

## 1. The Golden Axioms (Immutable)
1.  **Synchronicity**: Code generation implies Documentation generation. Never output TS code without diffing the corresponding `.md` Protocol or State.
2.  **Density**: Compress knowledge. Use Interfaces, Tables, and Symbols. Reject narrative prose.
3.  **Recursion**: Every Protocol execution ends with a **Meta-Update Step**: "How could this protocol have been more efficient?" -> Update the protocol file.
4.  **Zoneless Truth**: The codebase is Zoneless (Angular). Any instruction suggesting `Zone.js` is heresy and must be purged.

## 2. Command Registry (Entry Points)
Invoke these keywords to trigger specific AI agent workflows.

| Keyword | Target Protocol | Intent |
|---|---|---|
| `RUN_OPT` | `src/docs/protocol-optimize.md` | Performance tuning, memory leak hunting, loop tightening. |
| `RUN_REF` | `src/docs/protocol-refactor.md` | Architecture cleanup, file decomposition, debt repayment. |
| `NEW_SCENE` | `src/docs/protocol-content.md` | Creating new Levels, Biomes, or Scenes. |
| `NEW_ASSET` | `src/docs/protocol-content.md` | procedural generation of props/structures. |
| `SYS_CHECK` | `src/docs/refactoring-state.md` | Health check, file inventory, dependency graph verification. |

## 3. Self-Correction Directive
**IF** the AI encounters a file or pattern in the codebase that contradicts a Protocol:
1.  **HALT** generation.
2.  **ANALYZE**: Is the Code wrong (Bug) or is the Protocol outdated (Drift)?
3.  **EXECUTE**: Fix the Code OR Update the Protocol immediately. Do not leave them out of sync.

## 4. Context Loading Sequence (Boot)
1.  **READ** `src/docs/kernel.md` (This file).
2.  **READ** `src/docs/memory-stream.md` (Current State).
3.  **READ** `src/docs/systems.md` (Architecture Map).
4.  **AWAIT** Command Keyword.
