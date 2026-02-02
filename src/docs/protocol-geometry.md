
# [PROTOCOL] Geometry Refinement
> **Trigger**: `RUN_GEO`
> **Target**: `src/engine/graphics/primitive-registry.service.ts`, `src/services/generators/`
> **Version**: 1.8 (Liquid Resolution Update)

## 1. Analysis Routine
1.  **Vertex Count Check**: Scan generators for `segments` parameters. If `segments > 32` for non-hero assets, flag for reduction.
2.  **Topology Check**: Identify meshes using `toNonIndexed()` unnecessarily. Indexed geometry is preferred for memory unless flat shading or CSG merging is required.
3.  **UV Integrity Scan**:
    *   Detect `BoxGeometry` or extruded shapes that lack UV scaling logic.
    *   **Violation**: Stretching textures on long objects (e.g., Roads, Walls) is forbidden.
4.  **Pivot Alignment**:
    *   Verify origin consistency. "Standing" objects (Trees, Pillars) MUST pivot at Bottom `(0, 0, 0)`. "Floating" or "Physics" primitives (Boxes, Rocks) should pivot at Center.
5.  **Normal Integrity**:
    *   If vertices are displaced by noise, `computeVertexNormals()` MUST be called immediately after.

## 2. Refinement Strategies
*   **Fluent Builder**: Use `Geo` helper from `src/engine/graphics/geo-builder.ts`.
    *   **Pattern**: `Geo.box(w,h,d).mapBox().toNonIndexed().get()`.
*   **Vertex Modification**:
    *   **Pattern**: Use `geo.mapVertices((v) => { ... })` instead of manual `getAttribute/fromBufferAttribute` loops.
    *   **Reason**: Encapsulates buffer access safety and reduces boilerplate code.
*   **UV Normalization**:
    *   Apply `scaleUVs(geo, w, h, d)` for box-mapped objects.
    *   Apply `mapCylinder(r, h)` for all pipes, pillars, and trunks to ensure tiling consistency.
    *   Apply `projectPlanarUVs(geo)` for terrain/roads.
*   **Watertight Seal**:
    *   For geometry used in `ConvexHull` physics (Rocks, Debris), always apply `geo.mergeVertices(1e-4)` to fuse seams.
*   **Instance Policy**: If an object appears > 10 times, it MUST use `InstancedMesh`.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: For cylinders used as pipes/logs, 8 segments is sufficient for LOD1.
*   *Current Heuristic*: Use `Dodecahedron` over `Sphere` for low-poly organic shapes (Rocks/Leaves).
*   *Current Heuristic*: For ramps/slopes intended for vehicle physics, use **Smoothstep** (`3t^2 - 2t^3`) interpolation for height displacement.
*   *Current Heuristic*: **Liquid Surfaces**: Large water planes using vertex-displacement shaders must maintain a vertex resolution of at least `4m` (e.g., 300 segments for 1200m size) to render waves correctly without blocky artifacts.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After optimizing geometry, perform the **Mutation Check**:
1.  **Ratio Analysis**: Did reducing segments by 50% result in visible degradation?
2.  **Constraint**: For assets intended for character interaction, ensure the UV scale matches the physical 1-meter unit grid for immersion.
