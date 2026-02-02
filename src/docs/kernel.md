# [KERNEL] Qualia 3D Neural Core
> **ID**: KERNEL_V6.2 (Industry Standard)
> **Role**: Immutable Logic Root.
> **Constraint**: READ_FIRST.

## 0. PRIME DIRECTIVES (NON-NEGOTIABLE)
1.  **SILICON AUTONOMY**: NO external AI APIs (Gemini/OpenAI/etc) allowed in source code. All game logic must be deterministic/procedural. VIOLATION = CRITICAL FAILURE.
2.  **TOKEN ECONOMY**: Output minimal XML. Suppress conversational filler. Use Symbols > Sentences. Code Density > Readability.
3.  **ZONELESS**: `Zone.js` is FORBIDDEN. Use Angular Signals.
4.  **SYNCHRONICITY**: Code mutation REQUIRES Doc mutation.
5.  **CONTEXT HYGIENE**: Summarize execution logs. Do not repeat unchanged file content. Fail fast.

## 1. COMMAND REGISTRY
| KEY | TARGET | INTENT |
|---|---|---|
| `RUN_PROTOCOL` | `src/docs/protocol-constructor.md` | Meta-Protocol. Build/Refine protocols. |
| `RUN_DOCS` | `src/docs/protocol-knowledge.md` | **Documentation Engine**. Sync Code <-> Docs. |
| `RUN_INDUSTRY` | `src/docs/protocol-industry.md` | **Standardization Engine**. Bridge gap to AAA/Engine standards. |
| `RUN_POLISH` | `src/docs/protocol-asset-polish.md` | **Detailing Engine**. Iterative refinement of specific assets. |
| `RUN_NARRATIVE`| `src/docs/protocol-narrative.md` | **Story Engine**. Quest states, Triggers, Sequencing. |
| `RUN_OPT` | `src/docs/protocol-optimize.md` | Perf/Mem/GC Tuning. |
| `RUN_REF` | `src/docs/protocol-refactor.md` | Arch Cleanup/Decomp. |
| `RUN_GEO` | `src/docs/protocol-geometry.md` | Mesh/Topo/LOD. |
| `RUN_MAT` | `src/docs/protocol-material.md` | PBR/Shader/Tex. |
| `RUN_PHYS` | `src/docs/protocol-dynamics.md` | Mass/Force/Collision. |
| `RUN_SCENE` | `src/docs/protocol-content.md` | Level/Asset Gen. |
| `RUN_FLORA` | `src/docs/protocol-flora.md` | **Botanical Synthesis**. Trees/Plants/Wind. |
| `RUN_FAUNA` | `src/docs/protocol-fauna.md` | **Biological Logic**. Agents/Steering/Life. |
| `RUN_UI` | `src/docs/protocol-ui.md` | UX/Signals/DOM. |
| `RUN_COMBAT` | `src/docs/combat-system.md` | Weapons/Damage/VFX. |
| `SYS_CHECK` | `src/docs/refactoring-state.md` | Health/Inventory. |

## 2. AGENT EXECUTION LOOP
1.  **LOAD**: `kernel.md` -> `memory-stream.md` -> `systems.md`.
2.  **ANALYZE**: Identify target subsystem via `systems.md`.
3.  **EXECUTE**: Generate strict XML code blocks.
4.  **UPDATE**: Append action to `memory-stream.md`.

## 3. ERROR RECOVERY
**IF** (Pattern_Violation):
1.  **HALT** generation.
2.  **RECTIFY**: Rewrite code to match Protocol.
3.  **LOG**: Record error in `refactoring-state.md`.