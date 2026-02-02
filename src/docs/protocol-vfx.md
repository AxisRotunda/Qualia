
# [PROTOCOL] Visual Effects (VFX)
> **Trigger**: `RUN_VFX`
> **Target**: `src/services/vfx/`, `src/engine/graphics/particles/`
> **Version**: 1.0 (Genesis)
> **Axiom**: "Every particle tells a story. Instancing is law. Overdraw is the enemy."

## 1. Analysis Routine
1.  **Performance Scan**:
    *   Check for `new THREE.Sprite()` or `new THREE.Points()` inside update loops.
    *   **Violation**: Individual particle actors are forbidden. Use pooled `BufferGeometry` or `InstancedMesh`.
2.  **Shader Integrity**:
    *   Verify particle materials use `depthWrite: false` and `blending: AdditiveBlending` (or Custom) to prevent z-sorting artifacts.
    *   Soft Particles: Ensure fragment shader reads the depth buffer to fade out near geometry intersections (prevents hard clipping).

## 2. Refinement Strategies
*   **System Architecture**:
    *   **CPU Emitters**: For logic-heavy effects (e.g., debris bouncing physically). Use `Points` with dynamic attribute updates.
    *   **GPU Emitters**: For aesthetic volume (e.g., snow, rain, dust). Move logic to Vertex Shader using `time` uniforms.
*   **Pooling**:
    *   Implement a ring-buffer strategy for transient effects (impacts). Do not destroy/create buffers; overwrite old indices.
*   **LOD**:
    *   Disable particle systems entirely if distance > 100m (except "Hero" effects like Beacons).

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: For "Hard Realism", debris should interact with the floor (y=0 plane) even if simplified. Use a simple mathematical floor check in the update loop.
*   *Current Heuristic*: Use Texture Atlases for particles to allow variation without binding new textures.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After implementing VFX, perform the **Mutation Check**:
1.  **Fill-Rate**: Did the frame rate drop when the camera looked through a smoke cloud?
2.  **Correction**: Reduce particle size or count, or implement half-resolution rendering for transparency buffers.
