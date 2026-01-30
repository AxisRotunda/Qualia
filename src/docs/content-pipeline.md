# Content & Asset Pipeline
> **Scope**: Procedural Generation, Scene Management, Entity Templates.
> **Source**: `src/services/asset.service.ts`, `src/services/generators/`, `src/data/`

## 1. Scene Registry (`SceneRegistryService`)
*   **Definitions**: `src/data/scene-definitions.ts`.
*   **Type**: `ScenePreset`.
*   **Lifecycle**: `load(engine, lib)` -> Clears world, Sets Atmosphere, Spawns Entities.
*   **Update Loop**: Optional `onUpdate(dt)` hook for scene-specific logic (e.g., Elevator movement).

## 2. Entity Library (`EntityLibraryService`)
*   **Templates**: `src/data/entity-templates.ts`.
*   **Structure**: `EntityTemplate` defines Visuals (`meshId`), Physics (`shape`), and Props (`mass`, `friction`).
*   **Spawning**: `spawnFromTemplate(id, pos)` acts as the factory method bridging ECS and Assets.

## 3. Asset Generation (`AssetService`)
Central registry for procedural geometry. Caches `BufferGeometry` by ID.

### 3.1 Generator Architecture
*   **Context**: `GeneratorContext` injects domain-specific generators (`Nature`, `Arch`, `Interior`, `SciFi`).
*   **Config**: `ASSET_CONFIG` maps IDs (e.g., `tree-01`) to Generator Functions.
*   **Materials**: Maps Asset ID to Material IDs (Single or Multi-material arrays).

### 3.2 Domains
*   **Nature**: Trees, Rocks, Ice (Noise-based vertex manipulation).
*   **Architecture**: Buildings (Iterative stacking of primitives).
*   **Interior**: Furniture, Walls (CSG-like merges).
*   **SciFi**: Hulls, Corridors (Extrusions, complex primitives).

## 4. Material System (`MaterialService`)
*   **Registry**: Map of `MaterialDef`.
*   **Textures**: Procedural generation via `TextureGeneratorService` (Canvas 2D API).
*   **Toggle**: `setTexturesEnabled(bool)` switches between simple colors and textured materials for performance.
*   **Special**: `WaterMaterial` (Custom Shader with vertex displacement).