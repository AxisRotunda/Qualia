# [PROTOCOL] Content Generator
> **Trigger**: `NEW_SCENE` | `NEW_ASSET`
> **Target**: `src/content/`, `src/config/assets/`, `src/data/templates/`
> **Version**: 1.1 (Self-Learning)

## 1. Scene Generation Routine (`NEW_SCENE`)
1.  **DEFINE**: Theme, Atmosphere (from `atmosphere.config.ts`), and Logic Hook.
2.  **CREATE**: `src/content/scenes/[name].scene.ts`.
3.  **REGISTER**: Add to `src/data/scene-definitions.ts`.
4.  **INJECT**: Ensure `SceneLoaderService` can resolve it.

## 2. Asset Generation Routine (`NEW_ASSET`)
1.  **TYPE**: Is it `Nature`, `Arch`, `Interior`, or `SciFi`?
2.  **DEFINE**: Add generator logic to `src/services/generators/[domain]/`.
3.  **REGISTER**: Add config to `src/config/assets/[domain].assets.ts`.
4.  **TEMPLATE**: Create `EntityTemplate` in `src/data/templates/[category].ts`.

## 3. Aesthetic Constraints ("Hard Realism")
> **Dynamic Rule**: Update this section if new visual standards are established.
*   **Physics**: Mass must be calculated via density (`MassCalculator`). Do not guess mass.
*   **Visuals**: Prefer procedural noise/geometry over imported models. Use `BufferGeometryUtils.mergeGeometries`.
*   **Lighting**: Ensure `castShadow: true`. Use `EnvMap` for PBR.
*   **Materials**: Use `MaterialService` registry. Do not instantiate materials inline.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After generating content, perform the **Mutation Check**:
1.  **Technique**: Did you use a new procedural generation technique (e.g., "Voronoi", "L-System")?
2.  **Codify**: If yes, add the technique name to the `Asset Generation Routine` notes or create a new helper reference in `src/docs/systems.md`.
3.  **Registration**: Verify `SubsystemsService` and `SceneRegistry` are synced. If a manual step was required that wasn't listed, ADD IT to Section 1 or 2 of this Protocol.