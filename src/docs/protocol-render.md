
# [PROTOCOL] Render Pipeline
> **Trigger**: `RUN_RENDER`
> **Target**: `src/engine/graphics/renderer.service.ts`, `src/engine/systems/render.system.ts`, `src/engine/graphics/environment-manager.service.ts`
> **Version**: 1.0 (Genesis)
> **Axiom**: "Frame time is budget. Spend it on the center of the screen."

## 1. Analysis Routine
1.  **Draw Call Audit**:
    *   Check `info.render.calls` in debug overlay. If > 100 for a simple scene, flag for **Instancing** or **Merging**.
2.  **Shadow Config Check**:
    *   Verify `shadowMap.type` is `PCFSoftShadowMap`.
    *   Check `shadow.bias`. For procedural terrain, `-0.00005` to `-0.0001` is usually required to prevent "shadow acne".
3.  **Resolution Scaling**:
    *   Verify `pixelRatio` strategy. It MUST be capped at `1.0` for mobile and `1.5` for desktop high-DPI screens. Uncapped (`window.devicePixelRatio`) kills fill-rate on 4K/Retina screens.

## 2. Refinement Strategies
*   **Culling Hierarchy**:
    1.  **Grid Culling**: `VisibilityManager` (CPU) disables entities > X meters away.
    2.  **Frustum Culling**: Three.js (CPU) checks bounding spheres.
    3.  **Instance Culling**: `InstancedMeshService` zeros scale matrix for invisible instances.
*   **Lighting Budget**:
    *   Limit to **1 Directional Light** (Sun) casting shadows.
    *   Limit to **4 Point Lights** visible at once. Use "baked" emissive textures for complex lighting (e.g., City windows) instead of real lights.
*   **Post-Processing** (Future):
    *   If adding Bloom, ensure threshold is > 1.0 to only glow on Emissive surfaces/Sun reflection.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: On mobile, disable Anti-Aliasing (`antialias: false`) if pixel ratio is >= 2.0 (the high density acts as natural AA).
*   *Current Heuristic*: Updating `instancedMesh.instanceMatrix` every frame is expensive. Only update dirty flags.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After optimizing the renderer, perform the **Mutation Check**:
1.  **Jank**: Is there a garbage collection spike during rendering?
2.  **Correction**: Check `RenderSystem` for temporary Vector3/Matrix4 allocations. Apply **Zero-Alloc Pattern** (`protocol-optimize.md`).
