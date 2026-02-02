
# [PROTOCOL] Asset Polish
> **Trigger**: `RUN_POLISH`
> **Target**: `src/services/generators/`, `src/config/assets/`
> **Version**: 1.0 (Genesis)
> **Axiom**: "Every asset is a microcosm. Detail must justify the cost."

## 1. Analysis Routine
1.  **Identity Scan**:
    *   Is the asset "Hero" (Interactive/Focal) or "Fill" (Background)?
    *   **Hero**: Requires Beveled Edges, PBR (Normal/Roughness), Destructibility, Interaction Audio.
    *   **Fill**: Requires Low Poly, Aggressive LOD, Instancing.
2.  **Topology Audit**:
    *   Check `segments`. Cylinders should be 6-8 for Fill, 16-32 for Hero.
    *   Check `mergeVertices`. Hard edges on smooth objects (Spheres) need smoothing groups.
3.  **Physics Compliance**:
    *   Does the Collider match the Visual?
    *   Is `Mass` calculated via Density?
    *   Are `Friction/Restitution` material-appropriate?

## 2. Refinement Strategies
*   **The Bevel Rule**:
    *   Real objects rarely have 90-degree razor edges. Use `ChamferBox` logic or Normal Map baking to simulate bevels on Hero props.
*   **Texture Density**:
    *   Ensure UVs are scaled to world units (approx 1.0 UV = 1.0 Meter).
    *   Avoid stretching on long axes.
*   **Interaction Layer**:
    *   Add `tags: ['interactable', 'liftable']` if player can grab it.
    *   Ensure Mass < 50kg for liftable objects.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: For "Barrels", adding a randomized rotation to the Lid/Cap UVs breaks uniformity in instanced clusters.
*   *Current Heuristic*: Adding a subtle `emissive` map to "Tech" props (even if 0.1 intensity) significantly improves readability in dark scenes.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After polishing an asset, perform the **Mutation Check**:
1.  **Readability**: Does the asset silhouette stand out against the background?
2.  **Correction**: If no, adjust Albedo brightness or Specular highlights.