
# [PROTOCOL] Tooling & Workbench
> **Trigger**: `RUN_TOOLING`
> **Target**: `src/components/inspector/`, `src/services/ui/layout.service.ts`
> **Version**: 1.0 (Genesis)
> **Axiom**: "The Workbench defines the Work. Tools must be ergonomic."

## 1. Analysis Routine
1.  **Layout Density Check**:
    *   Verify that new panels in the `Inspector` use the `shrink-0` flex strategy.
    *   **Violation**: Panels that expand and hide the "World Settings" on mobile.
2.  **Input Component Audit**:
    *   Check for raw `<input type="number">` without step/min/max.
    *   **Requirement**: All numerical inputs must have meaningful `step` values (e.g., `0.1` for position, `15` for rotation deg).
3.  **State Reflection**:
    *   Ensure every Tool UI component uses `Signal` reads.
    *   **Violation**: Using `setTimeout` to wait for the engine to update before refreshing the UI. Use `effect()` or `computed()`.

## 2. Refinement Strategies
*   **Inspector Pattern**:
    1.  **Snapshot**: Create a local `signal` snapshot of the target data on selection.
    2.  **Diff**: Only emit `output()` when the UI value differs from the snapshot.
    3.  **Feedback**: Trigger a haptic pulse (`RUN_INPUT`) on successful value commit.
*   **Header Action Pattern**:
    *   Use `[header-actions]` slot in `UiPanelComponent` for context-specific tools (e.g., "Reset Transform" or "Randomize Color").

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: Vertical space is the scarcest resource in the Inspector. Use grid layouts for XYZ properties to save 66% of vertical space.
*   *Current Heuristic*: Sliders are superior to text inputs for "Feel" properties (Friction, Bloom), but text inputs are required for "Precision" properties (Coordinates).

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After building a tool, perform the **Mutation Check**:
1.  **Latency**: Did the UI feel sluggish while dragging a slider?
2.  **Correction**: Implement "Optimistic UI" (update visual immediately) and throttle the Physics sync to 30Hz during interaction.
