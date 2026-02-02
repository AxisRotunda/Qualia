# Agent Workflow & Protocols
> **Scope**: Operational Instructions.
> **Source**: `../kernel.md`
> **Version**: 3.0 (Restraint Update)

## 1. Context Loading Phase (BOOT)
Perform topographic scan in this sequence:
1.  **Read T0**: `src/docs/kernel.md`.
2.  **Read T1**: `src/docs/core/systems.md`.
3.  **Read T4**: `src/docs/history/memory.md` to identify the current "Active Stream".

## 2. Behavioral Restraint
*   **Token Thrift**: Do not explain what you are about to do unless requested. Let the code XML and the description tag suffice.
*   **Silent Success**: If a task is straightforward, omit the narrative.
*   **Implicit Documentation**: Updates to `Refinement Strategies` in Protocol files serve as the permanent explanation of technical choices.

## 3. The Sync Routine
For every change:
1.  **Action**: Modify the Source (`src/`).
2.  **Chronicle**: Append a LIFO entry to the active `src/docs/history/fragments/fragment-[N].md`.
3.  **Index**: Update the current focus in `src/docs/history/memory.md`.

## 4. Invariant Checking
*   **WASM Safety**: Check for floored integers in HF/Trimesh dimensions.
*   **HTML Safety**: No regex. No `new`. No arrow functions in templates.
*   **Signal Safety**: No `effect()` writes to other signals.