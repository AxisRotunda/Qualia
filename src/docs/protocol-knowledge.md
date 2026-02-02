# [PROTOCOL] Knowledge Integrity (The Chronicler)
> **Trigger**: `RUN_DOCS`
> **Target**: `src/docs/*.md`, `src/engine-api.md`
> **Version**: 3.1 (Deep Sync Update)
> **Axiom**: "An outdated map is a trap. Foundation precedes Function. Documentation is Code."

## 1. Priority Subsystem (Execution Order)
When `RUN_DOCS` is invoked, the Agent MUST verify and update files in the following strict order. Do not skip tiers.

| Tier | Category | File(s) | Intent |
|---|---|---|---|
| **0** | **Foundation** | `kernel.md` | Core Axioms and Prime Directives. |
| **1** | **Navigation** | `project-hierarchy.md` | **Critical**. Physical file discovery and disk topology. |
| **2** | **Logic Map** | `systems.md` | Domain clusters and execution priorities. |
| **3** | **Interface** | `engine-api.md` | Public Facade and Signal Registry. |
| **4** | **Protocols** | `protocol-*.md` | Domain-specific refinement instructions. |
| **5** | **State** | `memory-stream.md` | Chronological action logs and phase vectors. |

## 2. Analysis Routine (Tier-Down Audit)
1.  **Tier 1 Check (The Map)**: Compare the physical file list provided in the prompt against `project-hierarchy.md`.
    *   **Action**: If a file exists in the prompt but not the hierarchy, update Tier 1 immediately.
    *   **Check**: Are sub-directories properly categorized?
2.  **Tier 2 Check (The Systems)**: Verify if new Services or Systems were created.
    *   **Action**: Map new classes to clusters in `systems.md`. Ensure frame-loop priorities align with `EngineRuntimeService`.
3.  **Tier 3 Check (The Facade)**: Check `EngineService` for method signature changes or new public signals.
    *   **Action**: Synchronize with `engine-api.md`. Verify Signal return types.
4.  **Tier 4 Check (The Logic)**: Audit specialized protocols.
    *   **Action**: If a specific logic domain (e.g., `Fauna`) was heavily modified, update its `Self-Learning Heuristics`.
5.  **Tier 5 Check (The Stream)**: Ensure `memory-stream.md` captures the current action.

## 3. Refinement Strategies
*   **Cascading Sync**: A change in Tier 1 (e.g., moving a file) usually triggers a Tier 2 update (dependency shift) and potentially Tier 3 (API path change).
*   **Compression**: Reject narrative fluff. Use markdown tables and lists to maximize knowledge density per token.
*   **Zombie Detection**: Mark any `.md` file referencing non-existent `.ts` files as `[DEPRECATED]` and remove from `systems.md`.

## 4. Discovery Directive
**If the agent is lost**, it MUST:
1.  Read `kernel.md` to reset directives.
2.  Read `project-hierarchy.md` to locate tools.
3.  Read `systems.md` to understand execution.

## 5. Meta-Update (Self-Optimization)
**INSTRUCTION**: After a knowledge sync:
1.  **Drift Check**: Did the documentation catch a bug in the code?
2.  **Mutation**: If the tiered approach was too slow, merge Tier 2 and 3. If too ambiguous, split Tier 4 into specific "Sub-Tier" directories.