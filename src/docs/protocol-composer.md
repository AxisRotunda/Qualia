
# [PROTOCOL] Cinematic Composer
> **Trigger**: `RUN_COMPOSER`
> **Target**: `src/config/atmosphere.config.ts`, `src/engine/features/environment-control.service.ts`
> **Version**: 1.0 (Genesis)
> **Axiom**: "Visual consistency is subconscious trust. Balance the spectrum."

## 1. Analysis Routine
1.  **Luminance Audit**:
    *   Scan `AtmosphereDefinition` for `dirIntensity`.
    *   **Violation**: Intense sun (>5.0) combined with dark shadows without `HemisphereLight` bounce. This causes "Pitch Black" non-physical shadows.
2.  **Color Temperature**:
    *   Check `dirColor` vs `background`. 
    *   **Requirement**: Outdoor scenes must follow Kelvin logic. If sun is warm (#ffaa00), shadows/sky must be cool (#88aaff). Monochromatic lighting is forbidden except for "Stylized Horror" or "Deep Space".
3.  **Depth Perception Check**:
    *   Verify `Fog` usage. 
    *   **Requirement**: All large-scale terrestrial scenes (City, Forest) MUST use `Fog` to provide scale and hide horizon artifacts.

## 2. Refinement Strategies
*   **Palette Synthesis**:
    *   Define atmospheres using a **Three-Point Lighting** logic in the config:
        1.  **Primary**: Sun (Directional).
        2.  **Fill**: Sky (Hemisphere Top).
        3.  **Bounce**: Ground (Hemisphere Bottom).
*   **Atmospheric Post**:
    *   Sync `Bloom` and `Exposure` with the time of day. 
    *   High noon = Low Bloom, Sharp Exposure.
    *   Sunset/Neon = High Bloom, Lower Exposure.
*   **Horizon Blending**:
    *   Always match `Fog.color` precisely with `Scene.background`.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: For industrial "Cyberpunk" vibes, use a slightly green-shifted blue for shadows to simulate low-quality sodium vapor and industrial smog.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After tuning a scene's vibe, perform the **Mutation Check**:
1.  **Readability**: Can you still see the text of the HUD against the brightest part of the sky?
2.  **Correction**: If no, add a "UI Shield" rule (dark gradient behind top HUD) to `RUN_UI`.
