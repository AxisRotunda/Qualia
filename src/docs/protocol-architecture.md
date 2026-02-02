# [PROTOCOL] Structural Architect
> **Trigger**: `RUN_ARCH`
> **Target**: `src/services/generators/architecture/`, `src/engine/features/city/`
> **Version**: 1.4 (Hadopelagic Context Update)
> **Axiom**: "Structure follows Gravity. Geometry must be habitable. Pressure dictates form."

## 1. Analysis Routine
1.  **Gravity Check**:
    *   Scan for objects spawned at hardcoded `y` values.
    *   **Violation**: Terrestrial buildings must use `snapToSurface: true`.
2.  **Intersection Scan**:
    *   Verify `CityGridService` usage. Assets placed without reserving grid cells are illegal.
3.  **Scale Integrity**:
    *   Doorways: `2m - 3m`. Steps: `~0.18m`.
4.  **Environmental Context (NEW)**:
    *   **Violation**: Generic "Office" or "Civil" structures in Extreme Biomes (Deep Sea, Orbit, Volcanic).
    *   **Rule**: In Hadopelagic zones, use `Obsidian` or `Basalt` materials. Prefer monolithic, pressure-resistant silhouettes. Use `hero-ice-spire` or `structure-monolith` as base geometry rather than "Blocky" civil assets.

## 2. Refinement Strategies
*   **Foundation Rule**: All terrestrial structures must generate a foundation extending `2m` below origin to prevent floating.
*   **Grid Quantization**: City placement snaps to `CITY_CONFIG.GRID_UNIT`.
*   **Luminescence Strategy**: In dark biomes (Underwater, Night), architecture MUST define `Thermal Vents` or `Bioluminescent Slots` to provide spatial orientation without heavy ambient light.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: High-rise structures (>4 floors) must use flared columns or a wider podium to visually support the mass.
*   *Current Heuristic*: Deep-sea conduits feel more physical when paired with `structure-piling` anchors at cable termination points.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After generating or refactoring architecture, perform the **Mutation Check**.