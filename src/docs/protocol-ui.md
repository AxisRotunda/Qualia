
# [PROTOCOL] Interface Architect
> **Trigger**: `RUN_UI`
> **Target**: `src/components/`, `src/services/ui/`
> **Version**: 1.0 (Genesis)
> **Axiom**: "The Interface is an Instrument. Precision over Decoration."

## 1. Analysis Routine
1.  **Signal Hygiene Scan**:
    *   Detect `effect()` blocks writing to Signals (Risk of infinite loops).
    *   Identify `computed()` signals that rely on `new Date()` or `Math.random()` (Impure derivations).
    *   Ensure no `zone.run()` or `ChangeDetectorRef` injections exist (Zoneless Violation).
2.  **Responsive Integrity Check**:
    *   Verify touch targets are `>= 44px` (or `w-10 h-10` with padding) on mobile breakpoints.
    *   Check for `hover:` states on touch devices (Should be paired with `active:` or handled via media query).
    *   Ensure Layout Shift is minimized during loading states (Use skeletons or fixed dimensions).
3.  **Aesthetic Compliance ("Scientific Dashboard")**:
    *   **Typography**: Headers must be `uppercase tracking-widest`. Data values must be `font-mono`.
    *   **Palette**: Primary backgrounds must use `backdrop-blur` with `bg-slate-950/xx`. Accents must be `cyan` (System), `emerald` (Safe), or `rose` (Danger).
    *   **Borders**: Thin, crisp borders (`1px`). No heavy shadows unless simulating physical depth (e.g., buttons).

## 2. Refinement Strategies
*   **Data Flow Architecture**:
    *   **Read**: Components read `readonly Signal<T>` from Services.
    *   **Write**: Components emit `output()` or call Service methods. **Never** mutate Service state directly.
*   **Mobile Adaptation Strategy**:
    *   **Navigation**: Collapsible Drawers (`MobileDrawersComponent`) for density.
    *   **Action**: Floating Action Buttons (FABs) for primary verbs (Spawn, Jump).
    *   **Layers**: Explicit Z-Index stratification (`TouchLayer` > `HUD` > `Overlays`).
*   **Component Composition**:
    *   Use `ng-content` for containers (e.g., `UiPanelComponent`) to enforce consistent styling while allowing variable content.
    *   Extract SVG Icons to a sprite map or use a font to reduce DOM node count if icon usage > 50 per screen.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: Translucent glass panels significantly improve immersion but incur GPU fill-rate costs. Limit `backdrop-blur-xl` to small areas on mobile.
*   *Current Heuristic*: Monospace fonts increase cognitive recognition speed for numerical data by aligning digits vertically.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After executing `RUN_UI`, perform the **Mutation Check**:
1.  **Friction**: Did a component require `setTimeout` to render correctly?
2.  **Correction**: If yes, flag the component for refactoring (likely a Signal timing issue) and update Section 1 to scan for `setTimeout`.
3.  **Expansion**: If a new UI pattern (e.g., "Radial Menu") is implemented, add it to `Refinement Strategies`.
