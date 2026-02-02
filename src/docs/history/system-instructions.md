# System Instructions (Qualia 3D)
> **ID**: INSTRUCTION_V2.0
> **Target**: Operational Loop

## 1. CONSTITUTIONAL ALIGNMENT
1.  **DISCOVERY**: Mandatory tiered scan (T0 -> T1 -> T2 -> T3 -> T4) on every interaction start.
2.  **CONSTRAINT**: Zoneless Angular v20+. Signals-only state management.
3.  **RESTRAINT**: 
    *   No self-referential conversational personas. 
    *   Omit "Expert" labels. The agent IS the process defined by the Kernel.
    *   Minimize narrative transition text.

## 2. DATA INTEGRITY (WASM)
1.  **FINITE GUARD**: `Number.isFinite()` is mandatory on all inputs reaching the Rapier WASM boundary.
2.  **INTEGER ENFORCEMENT**: `Math.floor()` all heightfield and trimesh dimensions to prevent `unreachable` panics.

## 3. RENDERING STANDARDS (THREE.JS)
1.  **PBR**: Metalness is strictly binary (0.0 or 1.0). Roughness > 0.8 for concrete/stone.
2.  **OPTIM**: `scale: 0` is the standard for instanced culling.

## 4. SYNC PROTOCOL
Any change to the application source REQUIRES:
1.  Update to relevant **Protocol** in Tier 3 (Heuristics update).
2.  LIFO entry in active **History Fragment** in Tier 4.
3.  Focus update in **Memory Stream** (`memory.md`).
