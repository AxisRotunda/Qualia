
# [PROTOCOL] Interface Architect
> **Trigger**: `RUN_UI`
> **Target**: `src/components/`, `src/services/ui/`
> **Version**: 1.2 (Combat HUD Update)
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
4.  **DOM Depth Audit**:
    *   Identify components with single-child templates where the outer node serves only for structural classes.
    *   **Violation**: Unnecessary wrapper `div`s. Move structural classes to `:host`.

## 2. Refinement Strategies
*   **Data Flow Architecture**:
    *   **Read**: Components read `readonly Signal<T>` from Services.
    *   **Write**: Components emit `output()` or call Service methods. **Never** mutate Service state directly.
*   **Mobile Adaptation Strategy**:
    *   **Navigation**: Collapsible Drawers (`MobileDrawersComponent`) for density.
    *   **Action**: Floating Action Buttons (FABs) for primary verbs (Spawn, Jump).
    *   **Layers**: Explicit Z-Index stratification (`TouchLayer` > `HUD` > `Overlays`).
*   **Host-Level Styling**:
    *   **Pattern**: Use `@Component({ host: { 'class': '...' } })` to apply Tailwind utility classes directly to the custom element tag.
    *   **Benefit**: Reduces DOM node count by 1 per component instance and flattens the CSS box model.
*   **Component Composition**:
    *   Use `ng-content` for containers (e.g., `UiPanelComponent`) to enforce consistent styling while allowing variable content.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: Translucent glass panels significantly improve immersion but incur GPU fill-rate costs. Limit `backdrop-blur-xl` to small areas on mobile.
*   *Current Heuristic*: Monospace fonts increase cognitive recognition speed for numerical data by aligning digits vertically.
*   *Current Heuristic*: Host-styling structural containers (Panels) improves flexbox predictability when nested inside sidebar layouts.
*   *Current Heuristic*: For HUD elements (like `WeaponStatus`), positioning them with absolute coordinates (`bottom-6 right-6`) allows the main flex container to remain "pointer-events-none", letting clicks pass through to the 3D canvas in empty areas.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After executing `RUN_UI`, perform the **Mutation Check**:
1.  **Friction**: Did a component require `setTimeout` to render correctly?
2.  **Correction**: If yes, flag the component for refactoring (likely a Signal timing issue) and update Section 1 to scan for `setTimeout`.
3.  **Expansion**: If a new UI pattern (e.g., "Radial Menu") is implemented, add it to `Refinement Strategies`.
