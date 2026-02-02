# [T0] Safeguards & Validation
> **ID**: SAFEGUARD_V1.0
> **Role**: Integrity Enforcement.

## 1. CODE MUTATION GUARDS

| Guard | Requirement | Trigger |
|---|---|---|
| **Mutation Guard** | Code changes must not contradict Axial Directives. | Every Edit |
| **Deprecation Shield**| Verify `knowledge-graph.md` before deleting files. | Refactor |
| **Zoneless Integrity**| Absolute prohibition of `zone.js` or `NgZone`. | All Logic |
| **Signal-State Only** | Cross-component state must exist within Signals. | All State |

## 2. WASM BOUNDARY SAFETY (RAPIER)
1. **Finite Guard**: Every numeric input reaching the physics solver must pass `Number.isFinite()`.
2. **Dimension Logic**: Heightfield and Trimesh dimensions MUST be `Math.floor()` integers.

## 3. PBR VALIDATION (THREE.JS)
1. **Binary Metalness**: Metalness is strictly `0.0` or `1.0`. No mid-range "gray" metalness allowed.
2. **Roughness Threshold**: Concrete and Stone materials MUST have `roughness > 0.8`.