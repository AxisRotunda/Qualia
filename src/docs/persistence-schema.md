# Persistence Schema
> **Scope**: Serialization Format, Save/Load Logic, Data Constraints.
> **Source**: `src/engine/persistence.service.ts`

## 1. Data Structure (`SavedScene`)
JSON Serializable interface representing a snapshot of the `World`.

```typescript
interface SavedScene {
  version: number;          // Schema version (currently 1)
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
  position: { x, y, z };
  rotation: { x, y, z, w };
  scale: { x, y, z };
}
```

## 2. Serialization Strategy (`exportScene`)
*   **Filter**: Only entities with a `templateId` component are saved.
*   **Excluded**:
    *   Procedural debris generated without templates.
    *   System entities (e.g., Ghost cursors, Gizmos).
    *   Runtime-only components (RigidBody Handles, Mesh IDs).
*   **Process**:
    1.  Iterate `world.entities`.
    2.  Check for `templateIds` component.
    3.  Extract `transforms`.
    4.  Construct `SavedEntity`.

## 3. Deserialization Strategy (`loadSceneData`)
*   **Reset**: Calls `entityMgr.reset()` (Destroys all ECS entities, Physics bodies, and Meshes).
*   **Environment**:
    *   Restores `gravity`.
    *   Restores `texturesEnabled`.
    *   Restores `Atmosphere` based on `meta.sceneId`.
*   **Reconstruction**:
    *   Iterate `savedData.entities`.
    *   Call `EntityLibrary.spawnFromTemplate` using `tplId`, `position`, `rotation`.
    *   **Scale Restore**: Since `spawnFromTemplate` uses default template scale, we must post-process:
        *   Update ECS `Transform.scale`.
        *   Call `physics.updateBodyScale` to rebuild colliders matching the saved scale.

## 4. Limitations
*   **Dynamic Properties**: Does not save velocity, angular velocity, or accumulated forces. Objects load "static" until physics wakes them.
*   **Modified Props**: Does not save runtime modifications to `PhysicsProps` (friction/restitution) unless they match the template defaults. (Current implementation drawback).
*   **Parenting**: Hierarchy is not preserved (Flat list).