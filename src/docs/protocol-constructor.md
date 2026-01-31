
# [PROTOCOL] Meta-Constructor
> **ID**: PROTO_CONSTRUCT_V1
> **Trigger**: `RUN_PROTOCOL`
> **Target**: `src/docs/protocol-*.md`
> **Role**: Factory & Optimizer for System Protocols.
> **Axiom**: "The Protocol builds the Builder."

## 1. Mode Selection
**IF** `Target` exists in `kernel.md` OR file exists:
-> **GOTO** Section 3 (Evolution).
**ELSE**:
-> **GOTO** Section 2 (Genesis).

## 2. Genesis Routine (New Protocol)
1.  **Namespace**: Derive filename `src/docs/protocol-[target].md`.
2.  **Scaffold**: Generate file with Standard 4-Phase Topology.
    *   **Phase 1 (Analysis Routine)**: Define specific heuristics to grep/scan for in TS/HTML/CSS files. Define what constitutes a "violation" or "opportunity" in this domain.
    *   **Phase 2 (Refinement Strategies)**: Define architectural patterns (e.g., Factory pattern, SoA, Composition) specific to the target.
    *   **Phase 3 (Self-Learning Heuristics)**: Create empty "Dynamic" section for future learning.
    *   **Phase 4 (Meta-Update)**: Copy standard mutation check instruction to ensure the new protocol evolves.
3.  **Injection**:
    *   Inject domain-specific axioms (e.g., "Hard Realism" for Physics protocols).
    *   Inject `Zoneless` constraints for UI protocols.
4.  **Registration**:
    *   Append `RUN_[TARGET]` to `src/docs/kernel.md` Command Registry.
    *   Log creation in `src/docs/memory-stream.md`.

## 3. Evolution Routine (Optimize Existing)
1.  **Ingest**: Read target Protocol.
2.  **Audit**: Review "Self-Learning Heuristics" section.
    *   *Check*: Are there observations that have been validated > 3 times?
3.  **Compress**: Move validated items from "Self-Learning Heuristics" (Dynamic) to "Refinement Strategies" (Static/Hard Rule).
4.  **Sharpen**: Convert qualitative rules (e.g., "Reduce memory") to quantitative metrics (e.g., "Use Int32Array for collections > 1000 items").
5.  **Prune**: Remove analysis steps that yielded no results in the last 3 execution cycles.
6.  **Version**: Increment Version ID (e.g., 1.0 -> 1.1).

## 4. Self-Compliance Check (The Mirror)
**Constraint**: Any generated or optimized Protocol MUST:
1.  Cite `src/docs/kernel.md` as root authority.
2.  Forbid `Zone.js` / `NgZone`.
3.  Enforce strict typing (No `any`).
4.  Include a `Meta-Update` section for self-repair.

## 5. Meta-Update (Self-Optimization)
**INSTRUCTION**: After executing `RUN_PROTOCOL` (creating or optimizing another protocol):
1.  **Efficiency**: Did the generated protocol structure miss a critical file pattern or directory?
2.  **Correction**: If yes, update `Genesis Routine` (Section 2) to include broader file scanning in Phase 1 of new protocols.
3.  **Recursion**: If the target was `RUN_PROTOCOL` (optimizing itself), apply the Evolution Routine to THIS file immediately.
