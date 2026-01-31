
# [PROTOCOL] Structural Architect
> **Trigger**: `RUN_ARCH`
> **Target**: `src/services/generators/architecture/`, `src/engine/features/city-grid.service.ts`
> **Version**: 1.3 (Heuristic Update)
> **Axiom**: "Structure follows Gravity. Geometry must be habitable."

## 1. Analysis Routine
1.  **Gravity Check**:
    *   Scan for objects spawned at hardcoded `y` values (e.g., `y: 0`).
    *   **Violation**: Buildings must use `alignToBottom` or raycast to terrain surface.
    *   **Exception**: Space/Orbit scenes.
2.  **Intersection Scan**:
    *   Verify `CityGridService` usage. Assets placed without reserving grid cells are illegal.
    *   Detect Z-Fighting potential: Coplanar faces in generated meshes (e.g., floors overlapping walls).
3.  **Scale Integrity**:
    *   Doorways must be `2m - 3m` height.
    *   Steps/Stairs must be `0.15m - 0.2m` riser height. (Anything > 0.25m is a violation).
    *   Floors must be `3.5m - 4.5m` slab-to-slab.

## 2. Refinement Strategies
*   **Foundation Rule**: All terrestrial structures must generate a "foundation block" extending `2m` below their origin `y` to handle uneven terrain without floating.
*   **Grid Quantization**:
    *   City placement must snap to `CITY_CONFIG.GRID_UNIT` (15m).
    *   Rotations must be `Math.PI / 2` increments unless specifically "organic".
*   **Physics Loyalty**:
    *   Colliders for walkable interiors must be `trimesh`.
    *   Colliders for exterior block-outs must be `convex-hull` or `box` (Performance).
*   **Navigable Geometry**:
    *   Ramps must not exceed `30 degrees` incline.
    *   Corridors must be minimum `2m` wide for camera/character capsule clearance.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: High-rise structures (>4 floors) must use flared columns (tapered 1.5x) or a wider podium to visually support the mass.
*   *Current Heuristic*: Main entrances require a distinct vestibule frame (protruding ~0.5m) to provide human-scale context against massive facades.
*   *Current Heuristic*: Procedural windows should align with floor slabs, never crossing them.
*   *Current Heuristic*: Staircase generation parameters (height/steps) must yield risers approx 0.18m.
*   *Current Heuristic*: Use `scaleUVs` on extruded or scaled geometry (like Roads) to prevent texture stretching.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After generating or refactoring architecture, perform the **Mutation Check**:
1.  **Clipping**: Did visual meshes flicker?
2.  **Correction**: If yes, add a `0.01` offset (bias) rule to Section 2 and update the generator code.
3.  **Navigation**: Did the character get stuck in a doorway?
4.  **Correction**: Increase minimum door width in Section 1 heuristics.
