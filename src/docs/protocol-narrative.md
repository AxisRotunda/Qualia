
# [PROTOCOL] Narrative Director
> **Trigger**: `RUN_NARRATIVE`
> **Target**: `src/engine/features/logic/`, `src/data/narrative/`
> **Version**: 1.0 (Genesis)
> **Axiom**: "The world is the narrator. Action is dialogue. State is memory."

## 1. Analysis Routine
1.  **Trigger Sovereignty**:
    *   Scan for hardcoded `if` statements in `onUpdate` checking for specific entity positions.
    *   **Violation**: Move check to a `NarrativeTrigger` (Sensor).
2.  **Persistence Integrity**:
    *   Verify narrative state is serialized in `RUN_SAVE`.
    *   **Requirement**: A user loading a world must be at the same quest step they left.
3.  **Cue Delivery**:
    *   Identify narrative events with no feedback.
    *   **Requirement**: Every narrative state change must trigger a Visual (VFX) or Audio (UI) cue.

## 2. Refinement Strategies
*   **The Directed Graph**:
    *   Implement narrative as a graph of `Nodes` (Events) and `Edges` (Conditions).
*   **Spatial "Barks"**:
    *   Use Gemini (`RUN_NEURAL`) to generate contextual text for entities based on world state (e.g., "Scanning... Reactor Stable").
*   **Sequence Locking**:
    *   Implement a system-wide `NarrativeLock` that disables user-driven spawning during critical scripted events.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: "Show, Don't Tell". Trigger a dynamic lighting shift (Color change) to signal phase changes rather than a text popup.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After implementing a narrative sequence, perform the **Mutation Check**:
1.  **Softlock**: Can the user break the sequence by deleting a required entity?
2.  **Correction**: Mark narrative-critical entities as `indestructible` in the ECS metadata.