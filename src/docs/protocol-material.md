
# [PROTOCOL] Material Physicist
> **Trigger**: `RUN_MAT`
> **Target**: `src/config/material.config.ts`, `src/services/material.service.ts`, `src/engine/graphics/shaders/`
> **Version**: 1.0 (Genesis)
> **Axiom**: "Light is conserved. Surfaces are physical. Metalness is binary."

## 1. Analysis Routine
1.  **PBR Integrity Scan**:
    *   Check `metalness` values. In "Hard Realism", values between `0.1` and `0.9` are rare (mostly dust/rust). Most surfaces are either Metal (1.0) or Dielectric (0.0).
    *   Check `color` (Albedo). Pure Black (`0x000000`) or Pure White (`0xffffff`) are forbidden for standard materials as they break lighting calculations. Range should be `0x111111` to `0xeeeeee`.
2.  **Shader Cost Check**:
    *   Identify usage of `MeshPhysicalMaterial`. It is ~2x more expensive than `MeshStandardMaterial`. Ensure it is used ONLY for `Glass`, `Ice`, or `Water` (Transmission/Clearcoat).
    *   Verify `side: THREE.DoubleSide`. This prevents GPU backface culling. Use only for thin geometry (Leaves).
3.  **Texture Slot Verification**:
    *   If a material has a `normalMap`, ensure it has `normalScale` tuned (often defaults to 1, but procedural textures might need 2-4).

## 2. Refinement Strategies
*   **Shared Registry**: Do not instantiate materials inside Components or Generators. Register them in `material.config.ts` and reference by ID string.
*   **Injection Pattern**: Use `onBeforeCompile` to inject custom shader logic (e.g., Vertex Displacement) into standard materials instead of using `ShaderMaterial` directly. This preserves Three.js lighting/shadow support.
*   **Scale Compensation**: For materials applied to scaled meshes (e.g., Walls), ensure texture tiling (`map.repeat`) is adjusted or use **Triplanar Mapping** via shader injection.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: For "wet" surfaces, increase `roughness` slightly on the fresnel edge to simulate absorption, or use a Clearcoat layer.
*   *Current Heuristic*: `MeshStandardMaterial` is sufficient for 95% of game objects. Reserve `Physical` for "Hero" transparent objects.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After optimizing materials, perform the **Mutation Check**:
1.  **Compilation**: Did shader compilation cause a stutter on spawn?
2.  **Correction**: If yes, implement `warmup()` routine in `MaterialService` to force-compile materials during the loading screen.
