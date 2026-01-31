
# [PROTOCOL] Geometry Refinement
> **Trigger**: `RUN_GEO`
> **Target**: `src/engine/graphics/primitive-registry.service.ts`, `src/services/generators/`
> **Version**: 1.0 (Genesis)

## 1. Analysis Routine
1.  **Vertex Count Check**: Scan generators for `segments` parameters. If `segments > 32` for non-hero assets, flag for reduction.
2.  **Topology Check**: Identify meshes using `toNonIndexed()` unnecessarily. Indexed geometry is preferred for memory unless flat shading is required.
3.  **LOD Opportunity**: Identify assets used in large quantities (Trees, Rocks). Ensure they support a `complexity` or `lod` parameter.

## 2. Refinement Strategies
*   **LOD Caching**: In `PrimitiveRegistry`, cache geometry keys with LOD suffix (e.g., `sphere_r1_lod2`).
*   **Merge Policy**: Use `BufferGeometryUtils.mergeGeometries` for static clusters.
*   **Instance Policy**: If an object appears > 10 times, it MUST use `InstancedMesh`.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: For cylinders used as pipes/logs, 8 segments is sufficient for LOD1.
*   *Current Heuristic*: Use `Dodecahedron` over `Sphere` for low-poly organic shapes (Rocks/Leaves).

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After optimizing geometry, perform the **Mutation Check**:
1.  **Ratio Analysis**: Did reducing segments by 50% result in visible degradation?
2.  **Adjustment**: If visual quality was lost, update the *Current Heuristic* to a safer baseline (e.g., "Minimum 12 segments for visible cylinders").
3.  **New Shape**: If you used a new primitive type (e.g., Icosahedron), add it to the Refinement Strategies list.
