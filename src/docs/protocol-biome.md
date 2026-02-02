# [PROTOCOL] Biome Ecologist
> **Trigger**: `RUN_BIOME`
> **Target**: `src/engine/biomes/`, `src/config/biomes/`
> **Version**: 1.1 (Tiered Distribution Update)
> **Axiom**: "Nature follows rules. Distribution is probability. Scale is hierarchy."

## 1. Analysis Routine
1.  **Scatter Logic Check**:
    *   Scan Scenes (`src/content/scenes/`) for raw `for` loops spawning trees/rocks.
    *   **Violation**: Hardcoded loops are rigid. Move logic to a `BiomeDefinition` or specific Algorithm class.
2.  **Constraint Validation**:
    *   Ensure placement logic checks: **Height** (Sea level), **Slope** (Cliffs), and **Collision** (Overlap).
3.  **Density Audit**:
    *   Verify Object Counts. If > 1000 items/chunk, verify `InstancedMesh` usage via `RUN_GEO`.

## 2. Refinement Strategies
*   **Biome Definition**:
    *   Structure: `{ id: 'forest', layers: [ { asset: 'tree', density: 0.5, slopeMax: 30 } ] }`.
*   **The Three-Pass Standard**:
    1.  **Tier 1 (Hero)**: Primary flora/landmarks. Spaced widely, often with unique collision.
    2.  **Tier 2 (Fill)**: Boulders, logs, bushes. Masked by secondary noise octaves.
    3.  **Tier 3 (Detail)**: Shards, grass, pebbles. High density, GPU instanced only, no collision.
*   **Noise Masking**:
    *   Use Perlin/Simplex noise to create "clumps" and "clearings". Random uniform distribution looks artificial.
*   **Spatial Hashing**:
    *   Use a simple 2D Grid or Poisson Disk Sampling to ensure minimum distance between objects (prevent clipping).

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: "Big, Medium, Small". Always scatter in tiered passes to ensure visual balance.
*   *Current Heuristic*: Align normals for Trees to "Up" (World Y), but align Rocks to "Surface Normal".
*   *Current Heuristic*: For desert biomes, clumping vegetation near water sources (radial distance masking) provides subconscious realism.
*   *Current Heuristic*: Use `ridgedNoise` for Fill Tiers (Rocks) to simulate natural accumulation along ridge lines and dunes.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After generating biomes, perform the **Mutation Check**:
1.  **Patterning**: Can you see the grid or noise pattern repeating?
2.  **Correction**: If yes, mix two different noise frequencies (Domain Warping) to break the tiling artifact.