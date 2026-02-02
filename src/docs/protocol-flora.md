
# [PROTOCOL] Botanical Synthesis (Flora)
> **Trigger**: `RUN_FLORA`
> **Target**: `src/services/generators/nature/nature-flora.service.ts`, `src/engine/graphics/shaders/`
> **Version**: 2.3 (Fern Update)
> **Axiom**: "Growth is mathematical. Complexity is recursive. Motion is fluid."

## 1. Analysis Routine
1.  **Branching Integrity**:
    *   Scan recursive functions for `maxDepth` constraints.
    *   **Violation**: Recursion without complexity scaling. All flora must accept a `0.0 - 1.0` complexity parameter.
2.  **Geometry Saturation**:
    *   Count total vertices per tree/shrub. 
    *   **Requirement**: Non-hero flora must target < 2000 vertices per instance.
3.  **Wind Physics Check**:
    *   Check for static foliage meshes.
    *   **Requirement**: All leaves/fronds must utilize **Vertex Displacement** (Wind Sway) in the shader.
4.  **UV Mapping**:
    *   Verify `mapCylinder` usage on trunks.
    *   **Violation**: Stretching bark textures. Trunks must use world-space or normalized cylindrical UVs.

## 2. Refinement Strategies
*   **Stochastic L-System Grammar**:
    *   Migrate manual branching to Weighted L-System rulesets.
    *   **Pattern**: `F -> [ { weight: 0.7, result: 'FF' }, { weight: 0.3, result: 'F[&F]' } ]`.
*   **3D Turtle Graphics**:
    *   Use `THREE.Quaternion` to maintain turtle orientation, avoiding Gimbal Lock inherent in Euler methods.
*   **Root Flare**:
    *   All Hero Trees must implement a "Root Flare" pass at Y=0.
    *   **Formula**: Exponential taper `width = base * (1 + (1-y)^2.5)` + Noise displacement for gnarled look.
*   **Volumetric Clusters**:
    *   Single-leaf terminals are forbidden for trees. Use `Cluster Clouds` (3-5 scaled elements) to simulate volume with fewer draw calls.
*   **Optimization (Instancing)**:
    *   Large groves MUST use `InstancedMesh`.
    *   Use `VisibilityManager` to zero-scale distant instances.

## 3. Species Definition Standard (Genesis Routine)
To add a new species, define a `FloraDNA` configuration object rather than writing a new function.

```typescript
interface FloraDNA {
    id: string;
    axiom: string;
    rules: Record<string, LRule>;
    params: {
        angleYaw: number;   // Turn (+/-)
        anglePitch: number; // Branch (&/^)
        angleRoll: number;  // Twist (//*)
        lenBase: number;    // Segment Length
        radiusBase: number; // Trunk Radius
        radiusDecay: number; // Thickness reduction per depth
    };
    foliage: {
        clusterSize: number;
        leafScale: number;
    };
}
```

## 4. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: For palm trees, use 12 fronds at complexity 1.0, 5 fronds at complexity 0.3.
*   *Current Heuristic*: Vertical oscillation on leaves creates a more "tropical" feel, while horizontal sway simulates high-wind "blizzard" conditions.
*   *Current Heuristic*: Adding random Roll (`/` or `*`) before pitching branching creates more organic, less planar trees.
*   *Current Heuristic*: Flattening leaf blobs (Scale Y = 0.6) makes them look less like floating stones and more like canopy layers.
*   *Current Heuristic*: Ferns can be simulated by reusing Palm frond logic but placing them radially at `y=0` with a high upward curl.

## 5. Meta-Update (Self-Optimization)
**INSTRUCTION**: After generating a forest biome, perform the **Mutation Check**:
1.  **FPS Stability**: Did the frame rate drop when looking at the grove?
2.  **Correction**: Reduce `radialSegments` on branches or implement billboard LODs in `RUN_GEO`.
