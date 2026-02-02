# [PROTOCOL] Scene Optimizer (Master Architect)
> **Trigger**: `RUN_SCENE_OPT`
> **Target**: `src/content/scenes/`, `src/content/algorithms/`
> **Version**: 2.0 (Three-Pass Standard)
> **Role**: Specialized optimization, refactoring, and feature implementation for Scene Definitions.
> **Axiom**: "The Scene is an Ecosystem. Balance is Performance. Budget is Law."

## 0. Scene Archetypes
Before analysis, categorize the target scene. Each archetype carries specific constraints:

| Archetype | Ground Source | Primary Physics | typical Density |
|---|---|---|---|
| **EXTERIOR (Wild)** | Heightfield (HF) | Convex Hulls | High (Flora) |
| **URBAN (Civil)** | HF + Slabs | Boxes / Primitives | Medium (Buildings) |
| **INTERIOR (Structured)**| Trimesh / Slabs | Trimesh / Boxes | Low (Furniture) |
| **HYBRID (Complex)** | HF + Trimesh | Mixed | High (Varies) |
| **VOID (Minimal)** | Single Slab | Primitives | Low (Space) |

## 1. Analysis Routine (The Audit)
1.  **Monolith Check**: 
    *   **Violation**: If the `.scene.ts` file exceeds 150 lines or contains complex nested `for` loops.
    *   **Action**: DELEGATE to `src/content/algorithms/[name].algorithm.ts`.
2.  **Preload Integrity**:
    *   **Violation**: `preloadAssets` containing Template IDs (e.g., `terrain-highway`) instead of Mesh/Asset IDs (e.g., `gen-road-highway`).
    *   **Check**: Are high-complexity procedural assets (Trees, Rocks, Sci-Fi Hubs) missing from the warmup?
3.  **Yield Integrity**:
    *   **Violation**: Loops > 50 iterations without `await yieldToMain()`.
    *   **Check**: Is the scene updating `engine.state.loadingProgress` during long phases?
4.  **Physics Load**:
    *   **Constraint**: Max 15 `trimesh` colliders per scene.
    *   **Action**: Convert background/non-walkable buildings to `box` or `convex-hull`.
5.  **Liquid Integrity**:
    *   **Rule**: Large transparent planes (Water/Acid) MUST set `mesh.renderOrder = 10` and use `terrain-water-ocean` if size > 500m.

## 2. Refinement Strategies (The Build)
Refactor scenes to follow the **Three-Pass Build Standard**:

### Pass 1: Hero Infrastructure (Tier 1)
*   Spawn landmarks (Stations, Monoliths, HQ).
*   Initialize primary lighting (Shadow-casting lights).
*   Register unique interaction triggers (Buttons, Terminals).

### Pass 2: Fill & Biome (Tier 2)
*   Use `ctx.grid()` or `ctx.scatter()` for secondary assets (Trees, Rocks, Small Buildings).
*   **Enforce Instancing**: If count > 10, verify the template uses the `instanced` tag.
*   **Ground Alignment**: Terrestrial assets MUST use `snapToSurface: true` or `alignToBottom: true`.

### Pass 3: Detail & Telemetry (Tier 3)
*   Scatter non-colliding debris (Cinderblocks, Shards).
*   Initialize `fauna` (Penguins, Drones) via `BehaviorSystem`.
*   Apply final cinematic camera presets and `viewMode` defaults.

## 3. Performance Budget (The Cap)
Scenes exceeding these limits must be flagged for `RUN_OPT`:
*   **Entities**: < 400 total.
*   **Lights**: Max 1 Directional (Sun), Max 4 active Point/Spot lights.
*   **Resolution**: Terrain resolution max `128` (Desktop) / `64` (Mobile).
*   **Memory**: Estimated VRAM < 128MB.

## 4. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: Placing the "Bedrock Platform" at `y = -2.0` prevents character tunneling on fast descents better than `y = 0`.
*   *Current Heuristic*: Scenes using `walk` mode feel better if the camera is positioned behind a "Hero Asset" looking toward the horizon (Establishing Shot).
*   *Current Heuristic*: Preloading `primitive` shapes (Box, Sphere) is redundant; only preload procedural `AssetDef` keys.

## 5. Meta-Update (Self-Optimization)
**INSTRUCTION**: After optimizing a scene, perform the **Mutation Check**:
1.  **Metric**: Did the load time stay under 4 seconds?
2.  **Telemetry**: Did `physicsTime` stay under 6ms in the target area?
3.  **Action**: If limits are exceeded, update Section 3 with more aggressive culling rules.