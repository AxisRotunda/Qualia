
# [PROTOCOL] Volumetric Architect
> **Trigger**: `RUN_VOLUMETRICS`
> **Target**: `src/engine/graphics/environment-manager.service.ts`, `src/engine/graphics/shaders/`
> **Version**: 1.1 (Scattering Update)
> **Axiom**: "Depth is an illusion of density. Air has weight. Light must interact with the medium."

## 1. Analysis Routine
1.  **Horizon Hygiene**:
    *   Requirement: Atmosphere and Fog MUST blend to a single color at `far` distance to hide geometry popping.
2.  **Layer Consistency**:
    *   Violation: Volumetric fog that doesn't fade with altitude.
    *   Requirement: Use `uFogHeight` as the inflection point for exponential decay.
3.  **Scattering Audit**:
    *   Check `uFogScattering` values. High values (>0.5) during day cycles can cause unrealistic white-out.

## 2. Refinement Strategies
*   **Exponential Height-Fog**:
    *   Formula: `density = clamp(exp(-(y - height) * falloff), 0, 1)`.
    *   Impact: Mist settles in valleys; mountain summits remain clear.
*   **Distance-Altitude Coupling**:
    *   Fog factor is the product of `distance_fog * altitude_fog`.
*   **Light Bleeding**:
    *   Brighten the fog color as distance increases to simulate forward scattering of sunlight.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: For Sci-Fi interiors, set `uFogFalloff` to `0.2` to simulate high-density industrial particulate that clears within 5m of the ceiling.
*   *Current Heuristic*: In "Blizzard" biomes, set `uFogHeight` significantly higher than the ground to ensure the player feels 'inside' the storm regardless of altitude.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After tuning volumetrics, perform the **Mutation Check**:
1.  **Overdraw**: Did FPS drop > 15% when looking through layers?
2.  **Correction**: Reduce `fogFalloff` (make fog thinner) or reduce standard `fogDensity`.
