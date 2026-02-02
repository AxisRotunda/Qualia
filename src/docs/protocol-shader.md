
# [PROTOCOL] Shader Alchemist
> **Trigger**: `RUN_SHADER`
> **Target**: `src/engine/graphics/shaders/`, `src/engine/systems/material-animation.system.ts`
> **Version**: 1.1 (Aliasing Safety Update)
> **Axiom**: "The pixel is the stage. Math is the paint. Branching is the enemy."

## 1. Analysis Routine
1.  **Complexity Scan**:
    *   Check Fragment Shaders for `if/else` branching on non-uniforms (dynamic branching).
    *   **Violation**: Dynamic branching kills GPU parallelism. Use `step()`, `mix()`, or `smoothstep()` for branchless logic.
2.  **Dependency Check**:
    *   Verify `dependent texture reads` (UV coordinates derived from another texture read). Minimize depth of dependency chain.
3.  **Uniform Hygiene**:
    *   Check `material.uniforms` usage.
    *   **Constraint**: Uniforms updated every frame (e.g., `uTime`) must be managed by `MaterialAnimationSystem`. Do not update uniforms in random Components.
4.  **Noise Integrity**:
    *   **Violation**: Applying White Noise (Hash/IGN) directly to `normal` or `position` in the Fragment Shader.
    *   **Result**: Creates "Static" aliasing artifacts on mobile/high-res displays.
    *   **Fix**: Apply noise to `roughness` or `albedo` instead, or use filtered textures/mipmaps.

## 2. Refinement Strategies
*   **Injection Architecture**:
    *   Use `Three.js` `onBeforeCompile` pattern to inject logic into standard lighting models (`MeshStandardMaterial`).
    *   **Structure**: Define chunks as TS strings (e.g., `WATER_VERTEX_MAIN`). Use `#include <...>` replacement.
*   **Precision**:
    *   Use `mediump` or `lowp` for colors/uvs in Fragment Shader on mobile. `highp` is only for Position/Depth.
*   **Procedural Offload**:
    *   Move noise calculations to Vertex Shader if high-frequency detail isn't required (e.g., large waves). Pass result to Fragment via `varying`.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: `Simplex Noise` is expensive in GLSL. Use a pre-baked 3D Noise Texture and sample it with `uTime` offset for volumetric effects.
*   *Current Heuristic*: For mobile devices, limit `pow()` operations. They are surprisingly costly on older Adreno GPUs.
*   *Current Heuristic*: Interleaved Gradient Noise (IGN) is safe for Screen Space effects (Dithering, SSAO) because it aligns with pixels, but unsafe for Surface Space.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After writing shaders, perform the **Mutation Check**:
1.  **Compile Time**: Did the game stall for > 200ms on first load?
2.  **Correction**: If yes, implement `ShaderWarmupService` to render a 1x1 pixel of the material off-screen during the Loading phase.
