# [PROTOCOL] Knowledge Integrity (The Chronicler)
> **Trigger**: `RUN_DOCS` | `RUN_KNOWLEDGE`
> **Target**: `src/docs/`
> **Version**: 4.0 (Tiered Architecture)
> **Axiom**: "An outdated map is a trap. Foundation precedes Function."

## 1. TIERED AUDIT SEQUENCE
When invoked, the agent MUST verify information across tiers in descending order.

### TIER 0: THE ROOT
*   **File**: `src/docs/kernel.md`
*   **Check**: Are all current system commands listed in the registry?
*   **Update**: Increment version ID on major logic shifts.

### TIER 1: NAVIGATION & TOPOLOGY
*   **Files**: `src/docs/core/systems.md`, `src/docs/core/project-hierarchy.md`.
*   **Check**: Do all technical docs listed in Tier 2/3 physically exist at the linked paths?
*   **Action**: Re-map orphans or delete deprecated references.

### TIER 2: DOMAIN ARCHITECTURES
*   **Location**: `src/docs/architecture/`
*   **Check**: Verify PBR standards, ECS component schemas, and Physics materials.
*   **Sync**: Ensure `engine-api.md` matches the current `EngineService` public facade.

### TIER 3: LOGIC ENGINES (PROTOCOLS)
*   **Location**: `src/docs/protocols/`
*   **Check**: Update `Self-Learning Heuristics` based on recent code successes.
*   **Density**: Compress qualitative advice into quantitative rules.

### TIER 4: TIMELINE & STATE
*   **Location**: `src/docs/history/`
*   **Check**: Prune `memory.md` to keep only the last 10 relevant operations.
*   **Logs**: Summarize `repair-logs/` into actionable heuristics in Tier 3.

## 2. DISCOVERY HEURISTIC (FOR AGENTS)
1.  **Start at Kernel**: Determine the Prime Directives.
2.  **Scan Hierarchy**: Use `src/docs/core/project-hierarchy.md` to locate the source of truth for the target feature.
3.  **Read Spec**: Read the corresponding `src/docs/architecture/` file for technical constraints.
4.  **Execute Protocol**: Follow the `src/docs/protocols/` file for implementation patterns.

## 3. LINK INTEGRITY
All Markdown files must use relative paths based on the new structure.
*   *Correct*: `[Registry](../architecture/engine-api.md)`
*   *Correct*: `[Refactor](./protocol-refactor.md)`

## 4. META-UPDATE (SELF-OPTIMIZATION)
**INSTRUCTION**: After a knowledge sync:
1.  **Drift Detection**: Did you find a protocol that contradicts the code? 
2.  **Mutation**: Mutate the protocol file immediately to reflect the reality of the implementation.
3.  **Compression**: If two protocols overlap > 50%, merge them.