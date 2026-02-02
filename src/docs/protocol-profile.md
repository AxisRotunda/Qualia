
# [PROTOCOL] Hardware Profiler
> **Trigger**: `RUN_PROFILE`
> **Target**: `src/engine/core/profiler/`, `src/services/settings.service.ts`
> **Version**: 1.0 (Genesis)
> **Axiom**: "The Hardware dictates the Dream. 60FPS is the baseline. Scalability is survival."

## 1. Analysis Routine
1.  **Boot Metric Audit**:
    *   Implement a `BenchmarkService` that runs silently during the initial Loading Screen.
    *   **Metrics**: Frame time variance, Texture upload speed, Shader compile time.
2.  **GPU Fingerprinting**:
    *   Read `gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)`.
    *   **Rule**: Match against a heuristic list (Adreno = Mobile Tier, RTX = High Tier, Intel Iris = Low Tier).
3.  **Thermal Watch**:
    *   Monitor FPS degradation over time. If FPS drops by 20% over 60s with constant load, assume Thermal Throttling.
    *   **Action**: Downgrade Tier dynamically.

## 2. Refinement Strategies
*   **Tiered Configs**:
    *   Define `QualityProfile`: Low, Medium, High, Ultra.
    *   **Low**: No Shadows, 0.8 PixelRatio, No PostProcess, Simple Fog.
    *   **Medium**: Hard Shadows, 1.0 PixelRatio, Vignette only.
    *   **High**: Soft Shadows, 1.0 PixelRatio, Bloom + Grain, Volumetric Fog.
    *   **Ultra**: 2048 Shadows, 1.5 PixelRatio (Desktop), SSAO, High-Res Textures.
*   **Dynamic Resolution Scaling (DRS)**:
    *   Target `16ms` frame time.
    *   If `renderTime > 14ms`, reduce `renderer.setPixelRatio` incrementally (min 0.5).
    *   If `renderTime < 10ms`, increase up to Tier cap.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: Mobile devices with `devicePixelRatio > 2.5` usually have fill-rate issues. Cap internal render resolution to `1080p` equivalent regardless of screen DPI.
*   *Current Heuristic*: Instancing count limit should vary by Tier. Low = 500, High = 5000.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After implementing profiling, perform the **Mutation Check**:
1.  **False Positive**: Did the profiler downgrade a high-end device?
2.  **Correction**: Improve the GPU Fingerprint regex list or rely more on actual `performance.now()` benchmarks.
