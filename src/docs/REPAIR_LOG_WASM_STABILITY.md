
# [REPAIR_LOG] WASM Stability (Unreachable)
> **ID**: LOG_WASM_STABILITY
> **Status**: Active Hardening
> **Axiom**: "WASM is a black box. The boundary must be an airlock."

## 1. Problem Definition
The application encountered `unreachable` errors during scene construction, specifically in the `water-platform`, `desert`, and `eden-complex` scenes. This error is a hard panic within the Rapier3D WASM binary, caused by invalid data types, out-of-bounds memory access, or degenerate geometry descriptors.

## 2. Diagnostic History

| Entry | Target | Root Cause | Resolution |
|---|---|---|---|
| 001 | `BuoyancySystem` | NaN Impulse generation from zero-mass objects. | Implemented `Number.isFinite` guards on all impulse applications. |
| 002 | `TerrainManager` | Dimension mismatch in heightfield creation. | Synchronized `nrows`/`ncols` with actual worker-returned array dimensions. |
| 003 | `ShapesFactory` | Zero/Negative scaling in colliders. | Enforced `MIN_DIM` (0.001) on all collider descriptors. |
| 004 | `FractureService` | NaN propagation in momentum transfer. | Hardened kinetic synthesis with finite-check filters. |
| 005 | `TerrainManager` | **[CRITICAL]** Dimension panic (unreachable). | Added `gridW/D >= 2` pre-flight check and finite scale enforcement. |
| 006 | `ShapesFactory` | **[CRITICAL]** Floating Point Dimensions. | Forced `Math.floor` on `nrows`/`ncols` and hardened `setTranslation` scalars. |

## 3. Heuristics for Prevention
1. **The Finite Rule**: Never pass a variable to `RAPIER` without wrapping it in `Number.isFinite()` if it was derived from an asynchronous or physics-based calculation.
2. **Dimension Parity**: For `heightfield` and `trimesh`, the vertex/height buffer size MUST be validated against the row/col or index counts immediately before the WASM call.
3. **Mass Integrity**: Dynamic bodies must have a mass > 0.001. Fixed bodies must be explicitly typed as `fixed` to bypass buoyancy calculations.
4. **Scale Guard**: Collider dimensions (cuboid, ball, cylinder) must be `>= 0.001`. Zero or negative dimensions trigger an immediate WASM panic.
5. **Integer Strictness**: Dimension arguments for heightfields and trimeshes MUST be floored. Floating point values in these slots trigger `unreachable`.
