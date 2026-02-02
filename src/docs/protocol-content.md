# [PROTOCOL] Content Generator (Master Architect)
> **Trigger**: `NEW_SCENE` | `NEW_ASSET`
> **ID**: PROTO_CONTENT_V2.0
> **Target**: `src/content/`, `src/config/assets/`, `src/data/templates/`
> **Axiom**: "The Scene is an Ecosystem. Balance is Performance. Scope is a choice."

## 1. Scene Taxonomy (The Nature of the Space)
Before initializing a `NEW_SCENE`, categorize the intent to trigger secondary protocols:

| Category | Primary Protocol | Ground Topology | typical Atmosphere |
|---|---|---|---|
| **EXTERIOR (Wild)** | `RUN_TERRAIN` | Heightfield (HF) | `clear`, `forest`, `ice` |
| **URBAN (Civil)** | `RUN_ARCH` | HF + Primitives | `city`, `fog` |
| **INTERIOR (Structured)** | `RUN_ARCH` | Trimesh / Slabs | `night`, `factory` |
| **HYBRID (Complex)** | `RUN_GRAMMAR` | HF + Trimesh | `volcanic`, `desert` |
| **VOID (Minimal)** | `RUN_PHYS` | Single Slab | `space`, `clear` |

## 2. Blueprinting Phase (Pre-Implementation)
A new scene must define these values before any spawning logic is written:
1.  **Atmosphere**: Select ID from `src/config/atmosphere.config.ts`.
2.  **Primary Verb**: Is this a `walk` (Navigation), `explore` (Flight), or `edit` (Manipulation) focused map?
3.  **Terrain Signature**: Standard, Dunes, Islands, or Volcano?
4.  **Asset manifest**: List required `preloadAssets` to avoid runtime compilation hitching.

## 3. Scene Implementation Routine (`NEW_SCENE`)
1.  **SCAFFOLD**: Create `src/content/scenes/[id].scene.ts`.
2.  **ENV**: Apply `ctx.atmosphere().weather().time().gravity()`.
3.  **GROUND**: 
    *   *Natural*: Use `await ctx.terrain(...)`.
    *   *Artificial*: Use `ctx.spawn('terrain-platform', ...)` for local zones only.
4.  **BIOME (The Tiered Pass)**:
    *   *Tier 1 (Hero)*: Spawn landmark structures (Stations, Monoliths).
    *   *Tier 2 (Fill)*: Use `ctx.scatter()` or `ctx.grid()` for Trees, Rocks, Props.
    *   *Tier 3 (Detail)*: Scatter non-colliding debris (Cinderblocks, Shards).
5.  **LIFE**: Integrate appropriate `RUN_FAUNA` (Penguins for Ice, Drones for Tech).
6.  **REGISTRATION**: Append to `src/data/scene-definitions.ts`.

## 4. Asset Implementation Routine (`NEW_ASSET`)
1.  **DOMAIN**: Assign to `Nature`, `Architecture`, `Interior`, or `SciFi` services.
2.  **GEN**: Build geometry using `Geo` builder patterns in the appropriate `generator.service`.
3.  **MAT**: Map IDs to `src/config/material.config.ts`.
4.  **TPL**: Define `EntityTemplate` with material-appropriate `friction` and `restitution` (see `RUN_DYNAMICS`).

## 5. Sub-Protocol Sync (Integration Checklist)
*   **Lighting** (`RUN_LIGHT`): Ensure `HemisphereLight` colors are motivated by terrain albedo.
*   **Materials** (`RUN_MAT`): Verify PBR metalness is binary.
*   **Geometry** (`RUN_GEO`): Verify `mapCylinder` on all pillars/trunks and UV scaling on all boxes.
*   **Dynamics** (`RUN_PHYS`): Ensure masses are calculated via `MassCalculator`, not guessed.
*   **Volumetrics** (`RUN_VOLUMETRICS`): Adjust `fogHeight` to match world topology (Settled in valleys).

## 6. Scope Control (The MVP Directive)
To prevent "Bloated World" syndrome, every new scene must initially adhere to:
*   **Entity Count**: < 200 total entities per chunk.
*   **Geometry**: < 10 complex Trimesh colliders. Use Boxes/Hulls where possible.
*   **Lights**: Max 1 Shadow-casting Sun. Max 2 Point/Spot lights for local motivation.
*   **Radius**: Focus interaction within a 150m radius from origin.
*   **Procedural Depth**: Limit L-System iterations to `3` or `4` for background trees.

## 7. Meta-Update (Self-Optimization)
**INSTRUCTION**: After generating a scene, evaluate "Friction Points":
1.  **Loading**: If load time > 5s, identify which asset needs more aggressive `preloadAssets` warmup.
2.  **Navigation**: If the player gets stuck, update `RUN_ARCH` with new minimum clearance rules.
3.  **Visuals**: If the horizon looks flat, update `RUN_VOLUMETRICS` with better fog falloff tuning.