# [PROTOCOL] Content Generator
> **Trigger**: `NEW_SCENE` | `NEW_ASSET`
> **Target**: `src/content/`, `src/config/assets/`, `src/data/templates/`

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
*   **Physics**: Mass must be calculated via density (`MassCalculator`).
*   **Visuals**: Prefer procedural noise/geometry over imported models.
*   **Lighting**: Ensure `castShadow: true`. Use `EnvMap` for PBR.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: If a new Procedural Generator service is created, register it in `SubsystemsService` and update `src/docs/systems.md`.
