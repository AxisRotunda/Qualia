# Scene Logic & Hooks
> **Scope**: Scene-specific behaviors, update loops, and shader syncing.
> **Source**: `src/content/scenes/*.scene.ts`

## 1. Scene Preset Interface
Defined in `src/data/scene-types.ts`.
```typescript
interface ScenePreset {
  load: (engine, lib) => void;         // Setup
  onUpdate?: (dt, time, engine) => void; // Frame Loop Hook
}
```

## 2. Active Scene Logics

### 2.1 Elevator Scene (`elevator.scene.ts`)
**Concept**: "Relativity Trick". To simulate infinite descent, the cabin stays at `(0,0,0)`, and the shaft moves UP.
*   **State**: `currentDepth`, `targetDepth`, `velocity`.
*   **Update Loop**:
    1.  Calculates velocity (Accel/Decel).
    2.  Updates `currentDepth`.
    3.  Moves `shaftEntity` (Visual Only) to `y = -10 + currentDepth`.
    4.  Updates Status Light color/intensity.

### 2.2 Water Scene (`water.scene.ts`)
**Concept**: Shader-based waves synced with CPU buoyancy physics.
*   **Load**: Spawns water plane with `mat-water`.
*   **Update Loop**:
    1.  Syncs `uTime` uniform on `mat-water` with `totalTime` (converted to seconds).
    2.  Calls `engine.applyBuoyancy()` to float physics objects.
*   **BuoyancySystem**: Replicates GLSL wave math (`sin` sums) on CPU to apply accurate Impulse/Drag to rigid bodies.

### 2.3 Spaceship Scene (`spaceship.scene.ts`)
**Concept**: Zero-G exploration.
*   **Load**: Sets Gravity to `-5.0` (Low G).
*   **Logic**: No custom update loop, relies on `PhysicsService` global gravity settings.

### 2.4 Ice Scene (`ice.scene.ts`)
**Concept**: Complex Static Trimesh terrain.
*   **Load**: Manually creates Physics Body from Asset Geometry (`createTrimeshFromGeometry`).
*   **Reason**: Standard `spawnFromTemplate` defaults to Box/Hull. Complex terrain needs exact Trimesh for walking.

### 2.5 Grand Hotel Lobby (`interior.scene.ts`)
**Concept**: "Hard Realism" Architecture.
*   **Layout**: Zone-based generation (Reception, Lounge, Mezzanine).
*   **Features**:
    *   **Structural Integrity**: Pillars placed to visually support the mezzanine floor.
    *   **Decor**: Procedural carpets (scaled floors) and clustered furniture.
    *   **Lighting**: Warm, layered lighting (Chandelier + Ambient).

### 2.6 Bureau 42 (`agency.scene.ts`)
**Concept**: Dense High-Tech Facility.
*   **Layout**: Datacenter aisles + Command Platform.
*   **Features**:
    *   **Density**: Tightly packed server racks simulating hot/cold aisles.
    *   **Hierarchy**: Raised central platform for command table.
    *   **Zones**: Secure glass meeting areas.