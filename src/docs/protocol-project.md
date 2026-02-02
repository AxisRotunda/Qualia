# [PROTOCOL] Project Custodian
> **Trigger**: `RUN_PROJECT`
> **Target**: `metadata.json`, `index.html`, `src/app.config.ts`
> **Version**: 1.0 (Genesis)
> **Axiom**: "Stability is the foundation of quality. The environment is the boundary."

## 1. Analysis Routine
1.  **Applet Compliance**:
    *   Verify `index.html` loads Tailwind via script and has NO `<base>` tag.
    *   Ensure `zone.js` is NEVER imported.
2.  **Metadata Audit**:
    *   Check `metadata.json` for missing permissions (Camera, Microphone) if new features are added.
3.  **Library Drift**:
    *   Scan `importmap` for version mismatches or "mock" libraries.
    *   **Violation**: Using non-standard ESM providers for core libraries.

## 2. Refinement Strategies
*   **Zoneless Audit**:
    *   Periodically grep for `NgZone` or `Zone`. Flag for immediate removal.
*   **Asset Pre-Optimization**:
    *   Ensure no base64 images exist in the code. Use external placeholders.
*   **Type Hygiene**:
    *   Run a scan for `any` types. Enforce mapping to `unknown` or a specific Interface.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: Hash routing (`withHashLocation`) is the only supported routing pattern for Applets.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After a project build, perform the **Mutation Check**:
1.  **Payload**: Did the JS bundle grow by > 20%?
2.  **Correction**: Check for redundant library imports or large string constants. Move to Workers where possible.