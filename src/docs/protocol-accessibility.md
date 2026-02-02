
# [PROTOCOL] Accessibility Standard (A11y)
> **Trigger**: `RUN_A11Y`
> **Target**: `src/components/`, `src/services/ui/`, `src/engine/input/`
> **Version**: 1.1 (Motion Sensitivity Update)
> **Axiom**: "The world is for everyone. Assumptions are barriers. Compatibility is quality."

## 1. Analysis Routine
1.  **Canvas Accessibility**:
    *   Check `canvas` element for `aria-label` or `role="application"`.
    *   **Requirement**: The canvas is a black box to screen readers. Ensure strictly UI overlays handle all critical information.
2.  **Motion Sensitivity**:
    *   Check for `matchMedia('(prefers-reduced-motion: reduce)')`.
    *   **Action**: If true, disable `CameraControl` damping, Head Bob, and Auto-Rotation in menus.
3.  **Color Contrast**:
    *   Audit text colors in `src/components/`.
    *   **Constraint**: Text/Background contrast ratio must be > 4.5:1 (WCAG AA). Avoid relying solely on color (e.g., Red = Enemy) for gameplay information.

## 2. Refinement Strategies
*   **Input Remapping**:
    *   Ensure all actions triggerable by Mouse/Touch are also triggerable by Keyboard (Tab navigation).
    *   Implement `FocusManagerService` to trap focus within active Modals/Drawers.
*   **UI Scaling**:
    *   Use `rem` units for UI layout where text flow matters.
    *   Ensure HUD panels do not clip content when browser zoom is 200%.
*   **Announcer System**:
    *   Implement `LiveRegionService` (polite/assertive aria-live) to announce 3D events (e.g., "Objective Updated", "Entered Bio-Dome") to screen readers.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: Providing a "Pause" toggle is an accessibility feature. Ensure the game can be paused at any time (except multiplayer).
*   *Current Heuristic*: Subtitles/Captions for audio logs (`RUN_AUDIO`) are mandatory.
*   *Current Heuristic*: OS-level reduced motion preference should explicitly toggle OrbitControls damping. Damping creates a "floaty" delay that triggers vestibular-ocular mismatch in sensitive users.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After applying A11y updates, perform the **Mutation Check**:
1.  **Navigation**: Can you reach the "Spawn Menu" using only the `Tab` and `Enter` keys?
2.  **Correction**: If no, add `tabindex="0"` to custom buttons (divs) and bind `(keydown.enter)` listeners.
