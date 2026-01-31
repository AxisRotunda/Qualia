
# [PROTOCOL] Texture Synthesis
> **Trigger**: `RUN_TEXTURE`
> **Target**: `src/engine/graphics/textures/`, `src/engine/workers/textures/`
> **Version**: 1.2 (Contrast Update)
> **Axiom**: "Pixels cost Frames. Synthesize asynchronously. Contrast creates Scale."

## 1. Analysis Routine
1.  **Main Thread Audit**:
    *   Scan for `document.createElement('canvas')` or `canvas.getContext('2d')` in Services.
    *   **Violation**: Any texture generation > 16x16px MUST occur in `TextureWorkerService`.
2.  **PBR Completeness**:
    *   Material definitions should use `NormalMap` or `RoughnessMap` generated from the same seed as the Albedo.
    *   "Flat" textures are forbidden for `Arch` and `Nature` categories.
3.  **Performance Check**:
    *   Verify `createAsyncTexture` is used.
    *   Ensure `ImageBitmap` transfer is used (Zero-Copy) instead of `ImageData` cloning where possible.
4.  **Value Check**:
    *   **Violation**: Albedo textures with mean brightness > 200 (0.8) are prohibited for large surfaces (Walls, Ground). They cause washout under HDR lighting.
    *   **Target**: Aim for mean brightness ~100-150 for concrete/stone.

## 2. Refinement Strategies
*   **Worker Migration**: Move logic from `[Type]TextureService` to `generators-[type].const.ts`.
*   **Noise Reuse**: Use the `hash(n)` and `noise(x,y)` functions in `common.const.ts` instead of `Math.random()` to ensure deterministic textures across reloads.
*   **Normal Generation**: Use `generateNormalMap(heightData)` in the worker for consistent lighting falloff.
*   **Panelization**: For architectural textures, overlay a grid or panel pattern to provide scale reference.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: 512x512 is the sweet spot for mobile PBR. 1024x1024 often causes hitching during upload to GPU.
*   *Current Heuristic*: For 'Ice' or 'Glass', use scratch layers in the Roughness map rather than Albedo for better light catch.
*   *Current Heuristic*: Use a vertical "Grime Gradient" (darker at bottom) on building textures to ground them visually.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After optimizing textures, perform the **Mutation Check**:
1.  **Upload Lag**: Did the `renderTime` spike when the texture loaded?
2.  **Correction**: If yes, implement **Progressive Loading** (4px -> 64px -> 512px) in `NatureTextureService`.