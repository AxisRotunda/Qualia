
# [PROTOCOL] Post-Process Compositor
> **Trigger**: `RUN_POST`
> **Target**: `src/engine/graphics/post/`, `src/engine/graphics/shaders/post/`
> **Version**: 1.0 (Genesis)
> **Axiom**: "Reality is boring; Style is essential. The frame is the final canvas."

## 1. Analysis Routine
1.  **Pipeline Cost Audit**:
    *   Count the number of active Passes in `EffectComposer`.
    *   **Constraint**: Mobile devices limited to **2 Passes** (Render + 1 Effect). Desktop limited to **4 Passes**.
    *   **Heavy Offenders**: SSAO, SSR, and Gaussian Blur (large radius).
2.  **Tone Mapping Integrity**:
    *   Verify `ToneMapping` is applied at the *end* of the chain (or via `OutputPass`).
    *   Ensure Bloom is applied *before* Tone Mapping to preserve HDR range.
3.  **Resolution Scaling**:
    *   Check if post-buffers match the `Renderer` pixel ratio.
    *   **Optimization**: Downsample heavy effects (Bloom, SSAO) to 0.5x resolution.

## 2. Refinement Strategies
*   **Effect Stacks**:
    *   **Cyberpunk**: Bloom (High threshold), Chromatic Aberration (Edge-only), Film Grain (Animated noise).
    *   **Realistic**: Vignette, Color Correction (LUT), Motion Blur (Per-object velocity).
*   **Shader Merging**:
    *   Combine simple effects (Vignette + Noise + Color Grade) into a single "Uber Shader" Pass to reduce draw calls and context switching.
*   **Uniform Management**:
    *   Inject `uTime`, `uResolution`, and `uCameraNear/Far` automatically into custom passes via `PostProcessSystem`.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: Chromatic Aberration creates a perception of "tech" or "glitch" aesthetic cheapy. Use it for UI feedback (taking damage).
*   *Current Heuristic*: On mobile, disable `UnrealBloomPass`. Use a simple `MeshBasicMaterial` with `gl_FragColor = vec4(10.0)` on specific layers for a "Fake Glow" effect.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After configuring post-processing, perform the **Mutation Check**:
1.  **Latency**: Did input latency increase (feel "floaty")?
2.  **Correction**: This indicates GPU bottleneck. Reduce buffer resolution or disable Motion Blur immediately.
