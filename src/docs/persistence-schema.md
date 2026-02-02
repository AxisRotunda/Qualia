# Persistence Schema
> **Scope**: Serialization Format, Save/Load Logic, Data Constraints.
> **Source**: `src/engine/persistence.service.ts`
> **Version**: 1.2 (Physics Parity Update)

## 1. Data Structure (`SavedScene`)
JSON Serializable interface representing a snapshot of the `World`.

```typescript
interface SavedScene {
  version: number;          // Schema version (Current: 2)
  meta: {
      sceneId?: string;     // ID of base ScenePreset (e.g., 'city')
      label?: string;       // Display name
      timestamp: number;    // Date.now()
  };
  entities: SavedEntity[];
  engine: {
    gravityY: number;       // Global physics setting
    texturesEnabled: boolean; // Visual preference
  };
}

interface SavedEntity {
  tplId: string;            // Reference to EntityTemplate
  position: { x, y, z };    // World coordinates
  rotation: { x, y, z, w }; // Quaternion orientation
  scale: { x, y, z };       // Multi-axis scaling
  props?: {                 // [NEW] Material-specific overrides
      friction: number;
      restitution: number;
      density: number;
  };
}
```

## 2. Serialization Strategy (`exportScene`)
*   **Filter**: Only entities with a `templateId` component are saved.
*   **Process**:
    1.  Iterate `world.entities`.
    2.  Check for `templateIds` component.
    3.  Extract `transforms` and `physicsProps`.
    4.  Construct `SavedEntity`.

## 3. Deserialization Strategy (`loadSceneData`)
*   **Reset**: Calls `entityMgr.reset()` (Atomic purge).
*   **Environment**: Restores gravity, textures, and atmosphere presets.
*   **Reconstruction**:
    1.  Iterate `savedData.entities`.
    2.  **Repair**: Validate every number using `isFinite`. Fallback to defaults if corruption detected.
    3.  **Spawn**: Call `EntityLibrary.spawnFromTemplate`.
    4.  **Scale Restore**: Call `physics.updateBodyScale` to rebuild colliders.
    5.  **Prop Restore**: Re-apply friction, restitution, and density via `EntityOpsService`.

## 4. Stability Guarantees (RUN_REPAIR)
*   **NaN Shield**: Corrupt JSON containing `Infinity` or `NaN` for transforms is intercepted and replaced with safe defaults before reaching the physics solver.
*   **Null-Trim Protection**: All string IDs are processed via `NullShield.trim()`.
