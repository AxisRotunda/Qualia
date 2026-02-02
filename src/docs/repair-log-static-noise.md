
# [REPAIR_LOG] Static Noise & Aliasing
> **ID**: LOG_STATIC_NOISE
> **Status**: Resolved
> **Axiom**: "Noise must be coherent. White noise aliases. Mipmaps are mandatory."

## 1. Problem Definition
Users reported "highly aggressive static" appearing across various scenes. Screenshots indicate high-frequency shimmering artifacts on surfaces (floors, walls) rather than screen-space film grain.

## 2. Root Cause Analysis
The `DETAIL_NORMAL_FRAGMENT` shader chunk (introduced in Phase 61.4) utilized **Interleaved Gradient Noise (IGN)** to perturb surface normals for micro-detail.
*   **Mechanism**: `normal += ign(uv)`.
*   **The Flaw**: IGN is a pseudo-random white noise generator. When applied in Texture Space (UVs) without mipmapping (filtering), it creates single-pixel variances that flicker wildly when the camera moves or when the object is viewed at a distance/angle (Aliasing).
*   **Result**: Surfaces appear to be covered in "static" or "snow".

## 3. Resolution Strategy
*   **Immediate Fix**: Disabled procedural normal perturbation. Normal maps must rely on texture assets (which support mipmapping) or coherent noise (Perlin/Simplex) which is expensive to compute in real-time.
*   **Fallback**: Retained `roughness` modulation. Varying specular highlights is less visually jarring than varying surface geometry normals, preserving the "material detail" feel without the artifact.

## 4. Prevention Heuristics
1.  **No White Noise on Geometry**: Never apply `hash()` or `ign()` directly to `normal` or `position` in the Fragment Shader.
2.  **Texture Space Rule**: High-frequency procedural detail must fade out based on `fwidth(uv)` or distance to prevent aliasing.
3.  **Post-Process Distinction**: IGN is safe for Screen Space effects (Dithering, SSAO) because it aligns with screen pixels. It is unsafe for Surface Space.
