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
*   **Structure**: `EntityTemplate` defines Visuals (`meshId`), Physics (`shape`), and Props (`mass`, `friction`, `physicsMaterial`).
*   **Spawning**: `spawnFromTemplate(id, pos)` calls `TemplateFactoryService`.

## 3. Generator Domains
Asset Generation is split into domain-specific services injected via `GeneratorContext`.

### 3.1 Nature (`NatureGeneratorService`)
*   **Flora**: Procedural Trees (`NatureFloraService`) using recursive branching and noise displacement for bark.
*   **Geology**: Rocks (`NatureGeologyService`) using Icosahedrons + Plane clipping (Chiseling).
*   **Terrain**: `NatureTerrainService`. 
    *   **Tech**: Inline Web Worker (`terrain-worker.const.ts`).
    *   **Algorithm**: **Domain Warping**. `noise(p + noise(p))`. Simulates hydraulic erosion and geological folds.
    *   **LOD**: Supports Level of Detail striding for distant chunks.

### 3.2 Architecture (`ArchitectureGeneratorService`)
*   **Buildings**: `ArchBuildingService`. Stacked generation (Lobby -> Tiers -> Roof). Uses UV scaling for tiling textures.
*   **Roads**: `ArchRoadService`. Extruded shapes with curbs and sidewalks.

### 3.3 Interior (`InteriorGeneratorService`)
*   **Structure**: Walls, Staircases (step-by-step merge), Railings.
*   **Furnishings**: Sofas, Desks, Server Racks. Uses primitive composition (CSG-style merging).

### 3.4 Sci-Fi (`SciFiGeneratorService`)
*   **Environment**: Elevator Shafts (Ring generation), Corridors (Ribbed frames).
*   **Stations**: Hubs, Research outposts.

## 4. Material System (`MaterialService`)
*   **Registry**: Map of `MaterialDef`.
*   **Textures**: Procedural generation via `TextureGeneratorService` (Canvas 2D API).
*   **Toggle**: `setTexturesEnabled(bool)` switches between simple colors and textured materials for performance.
*   **Special**: `WaterMaterial` (Custom Shader with vertex displacement) & `Triplanar` mapping for terrain.