# [PROTOCOL] Photon Architect
> **Trigger**: `RUN_LIGHT`
> **Target**: `src/engine/graphics/environment-manager.service.ts`, `src/engine/features/environment-control.service.ts`
> **Version**: 1.3 (Ambient Motivation Update)
> **Axiom**: "Shadows define volume. Light must be motivated. Darkness is not black."

## 1. Analysis Routine
1.  **Shadow Config Audit**:
    *   Verify `shadowMap.type` is `PCFSoftShadowMap`.
    *   Check `shadow.bias`. For large outdoor scenes (City/Terrain), bias must be negative (`-0.00005` to `-0.0005`) to prevent self-shadowing acne.
    *   Check `shadow.camera` bounds. Must cover the active gameplay area (e.g., `+/- 250` units) without wasting resolution on the void.
2.  **PBR Value Check**:
    *   **Sun Intensity**: In non-physical units, should range `1.0 - 5.0`.
    *   **Ambient**: Pure `AmbientLight` flattens geometry. Prefer `HemisphereLight` with distinct Sky/Ground colors to simulate bounce lighting.
    *   **Black Level**: Avoid pure `0x000000` for shadows/ambient unless in Space. Use deep blue/purple for artistic "night".
3.  **Celestial Integrity**:
    *   Verify `CelestialEngine` is used for solar positioning. Do not hardcode orbits in Features.

## 2. Refinement Strategies
*   **Biome Integration**:
    *   Baseline lighting (Intensity, Colors, Fog) MUST be defined in `src/config/atmosphere.config.ts`.
    *   Avoid manual `ctx.light()` calls in Scene files if the atmosphere preset already provides the desired look.
*   **Ambient Motivation Rule**:
    *   **Constraint**: Hemisphere ground colors must represent **terrain bounce albedo**.
    *   **Formula**: Lerp the celestial ground contribution with the biome's ambient background. Avoid simple HSL darkening which creates non-physical mud tones.
*   **Shadow Follow Strategy**:
    *   Lights follow the active camera (snapped to shadow-map texels) to ensure local resolution remains high even in infinite worlds.
*   **Atmosphere Layering**:
    *   Use `FogExp2` for primary density.
    *   Sync Fog Color with `HemisphereLight.skyColor` to blend the horizon.
*   **Optimization**:
    *   Disable `castShadow` on small debris via `VisualsFactory`.
    *   Use `normalBias: 0.05` on Directional Lights to reduce procedural geometry acne.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: `normalBias: 0.05` is essential for procedural buildings to prevent " peter-panning" while fixing acne.
*   *Current Heuristic*: Sun intensity > 8.0 causes ACES Filmic tone mapping to bloom excessively; cap intensity in the state manager.
*   *Current Heuristic*: Centralizing lighting defaults in the Biome config reduces the boilerplate in `.scene.ts` files by ~40%.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After optimizing lighting, perform the **Mutation Check**:
1.  **Flicker**: Do shadows flicker when the camera moves?
2.  **Correction**: Check `snapShadowCamera` texel alignment math in `EnvironmentManager`.
