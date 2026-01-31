
# [PROTOCOL] Scene Optimizer
> **Trigger**: `RUN_SCENE_OPT`
> **Target**: `src/content/scenes/`, `src/content/algorithms/`
> **Version**: 1.2 (Heuristic Evolution)
> **Role**: Specialized optimization, refactoring, and feature implementation for Scene Definitions.

## 1. Routing Logic
**INPUT**: `target_scene_id` (string).
1.  **Scan**: Does `src/content/scenes/[target_scene_id].scene.ts` exist?
2.  **Branch**:
    *   **IF MISSING**: **DELEGATE** to `NEW_SCENE` (see `protocol-content.md`) immediately.
    *   **IF EXISTS**: **PROCEED** to Section 2 (Analysis).

## 2. Analysis Routine
1.  **Monolith Check**:
    *   Count lines in `.scene.ts`.
    *   **Violation**: If > 200 lines or contains complex nested loops, flag for **Algorithmic Extraction**.
2.  **Preload Integrity**:
    *   Verify `preloadAssets` array exists in `ScenePreset`.
    *   **Violation**: If `preloadAssets` contains Template IDs (e.g. `terrain-highway`) instead of Mesh IDs (e.g. `gen-road-highway`), or Primitive IDs, flag for **Identity Correction**.
    *   **Gap Check**: If scene spawns Assets with `generator` logic (Trees, Rocks) but `preloadAssets` is empty, flag for **Warmup Injection**.
3.  **Performance Audit**:
    *   **Blocking**: Identify loops > 100 iterations without `await yieldToMain()`.
    *   **Allocations**: Search for `new THREE.Vector3` or `new THREE.Euler` inside generation loops.
4.  **Feature Gap**:
    *   Check for `onUpdate` hook. If missing, consider adding dynamic elements (rotation, floating, lighting shifts).

## 3. Refinement Strategies
*   **Algorithmic Extraction**:
    *   **Action**: Move procedural logic to `src/content/algorithms/[name].algorithm.ts`.
    *   **Pattern**: Expose a `static async generate(ctx: SceneContext, engine: EngineService)` method.
    *   **Benefit**: Keeps Scene Definitions declarative and readable.
*   **Yield Injection**:
    *   **Action**: Inject `await yieldToMain()` every ~50-100 spawns in heavy loops.
    *   **Benefit**: Prevents UI freeze during loading; allows progress bar to render.
*   **Identity Correction**:
    *   **Action**: Ensure `preloadAssets` only lists keys found in `ASSET_CONFIG`. Primitives (boxes, spheres) should not be preloaded.
*   **Warmup Injection**:
    *   **Action**: Add high-complexity procedural assets (Recursion, CSG) to `preloadAssets`.
    *   **Candidates**: `tree-01` (Recursion), `rock-01` (CSG), `gen-scifi-*` (Multi-part Merge).
*   **Instancing Enforcement**:
    *   **Action**: If spawning > 10 identical meshes (e.g., trees, rocks), ensure the Template uses tags `['instanced']` or handled by `NatureGenerator`.
*   **Memory Hygiene**:
    *   **Action**: Dispose of temporary geometry variables inside algorithms immediately after use if not cached.

## 4. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: Scenes with > 500 entities require `yieldToMain` updates to `loadingProgress` to keep the user engaged.
*   *Current Heuristic*: The `CityAlgorithm` pattern (Grid Service + Builder Services) is the gold standard for complex environments.
*   *Current Heuristic*: Preloading Template IDs instead of Asset IDs is a common error; AssetService only warms up Geometry generators.
*   *Current Heuristic*: Complex CSG assets (Rocks, Trees) cause noticeable frame drops on first spawn if not preloaded.

## 5. Meta-Update (Self-Optimization)
**INSTRUCTION**: After executing this protocol on a scene, perform the **Mutation Check**:
1.  **Metric**: Did the scene load time improve, or did the frame rate stabilize?
2.  **Adjustment**: If `yieldToMain` caused visual popping, update Refinement Strategies to recommend "Pre-calculation phase" (data only) vs "Spawn phase" (visuals).