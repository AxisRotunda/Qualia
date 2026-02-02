
# [PROTOCOL] Localization (I18n)
> **Trigger**: `RUN_I18N`
> **Target**: `src/services/i18n/`, `src/assets/i18n/`
> **Version**: 1.0 (Genesis)
> **Axiom**: "Language is a variable. Text is data. Context is key."

## 1. Analysis Routine
1.  **Literal Scan**:
    *   **Grep**: Scan `.ts` files (Components) for string literals inside templates (e.g., `<h3>Settings</h3>`).
    *   **Violation**: Hardcoded user-facing text is forbidden.
    *   **Exception**: Debug logs (`console.warn`) and internal IDs (`mat-concrete`) are exempt.
2.  **Date/Number Formatting**:
    *   Check for manual string concatenation of numbers (e.g., `val + " m/s"`).
    *   **Requirement**: Use `Intl.NumberFormat` or Angular pipes for locale-aware formatting.

## 2. Refinement Strategies
*   **Translation Service**:
    *   Implement a `TranslationService` that exposes a `currentLang` Signal.
    *   Load dictionaries (`en.json`, `jp.json`) lazily.
*   **Key Architecture**:
    *   Use nested keys for structure: `UI.HUD.STATUS.ONLINE`.
    *   Use `Pipes` in templates: `{{ 'UI.MENU.START' | translate }}`.
*   **Interpolation**:
    *   Support dynamic parameters: `Hello, {{name}}` -> `t('GREETING', { name: 'User' })`.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: For a "Sci-Fi" aesthetic, some text generally remains in English (System Codes, Hex values) regardless of locale. Identify "Lore Text" vs "UI Text".
*   *Current Heuristic*: Text length varies by ~30% between languages. Ensure UI panels (`UiPanelComponent`) handle overflow or text-wrapping gracefully.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After implementing I18n, perform the **Mutation Check**:
1.  **Layout Break**: Did a German word break the UI layout?
2.  **Correction**: If yes, add a `min-width` rule or `text-overflow: ellipsis` to the `RUN_UI` protocol.
