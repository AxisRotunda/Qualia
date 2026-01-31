
# ECS Architecture
> **Scope**: Data Layer, Entity Lifecycle, Component Schema.
> **Source**: `src/engine/core.ts`, `src/engine/ecs/`

## 1. Core Concepts

### 1.1 The World
The `World` class is a container for all game state. It holds a Set of active Entity IDs and a collection of `ComponentStore<T>` instances.

### 1.2 Entity
Type: `number` (Opaque ID).
Entities are keys used to look up data across Component Stores.

### 1.3 ComponentStore<T> (Sparse Set)
Wrapper around `Map<Entity, T>` optimized for iteration speed and cache locality.
*   **Structure**: 
    *   `dense: Entity[]`: Contiguous array of active entities.
    *   `components: T[]`: Contiguous array of component data (synced with `dense`).
    *   `sparse: Map<Entity, index>`: Lookup table for O(1) random access.
*   **Access**: O(1) `get`, `has`, `add`.
*   **Remove**: O(1) via "Swap-and-Pop".
*   **Iteration**: Linear loop over `dense` array.

## 2. Component Schema

| Store Name | Type | Description | Persistence |
|------------|------|-------------|-------------|
| `transforms` | `Transform` | Canonical Position/Rotation/Scale. | **Saved** |
| `rigidBodies` | `RigidBodyRef` | `{ handle: number }`. Link to Rapier. | Runtime |
| `meshes` | `MeshRef` | `{ mesh: THREE.Mesh }`. Link to Three.js. | Runtime |
| `bodyDefs` | `PhysicsBodyDef` | Config used to spawn the body. | **Saved** |
| `physicsProps` | `PhysicsProps` | `{ friction, restitution }`. | **Saved** |
| `names` | `string` | User-facing label. | **Saved** |
| `templateIds` | `string` | ID of the `EntityTemplate`. | **Saved** |

### 2.1 PhysicsBodyDef Schema
```typescript
interface PhysicsBodyDef {
  handle: number;
  type: 'box' | 'sphere' | 'cylinder' | 'capsule' | 'cone' | 'trimesh' | 'convex-hull' | 'heightfield';
  position: { x, y, z };
  rotation: { x, y, z, w };
  size?: { w, h, d };
  radius?: number;
  height?: number;
  mass?: number;
  lockRotation?: boolean;
  heightData?: Float32Array; // For Heightfields
  fieldSize?: { rows: number, cols: number };
}
```

## 3. Entity Lifecycle (`EntityAssemblerService`)

### 3.1 Creation (`createEntityFromDef`)
1.  **Input**: `PhysicsBodyDef`, Visual Options, Name, TemplateID.
2.  **Mesh Gen**: `VisualsFactory` creates `THREE.Mesh` or `Proxy`.
3.  **Physics Gen**: Managed externally by `PhysicsFactory`.
4.  **ECS Entry**: `world.createEntity()`.
5.  **Registration**: `physics.registerEntity(handle, id)`.

### 3.2 Duplication (`duplicateEntity`)
1.  **Source**: Existing Entity ID.
2.  **Recreate**: `PhysicsFactory.recreateBody` handles cloning logic.
3.  **Scale**: Applies `updateBodyScale`.
4.  **Visuals**: Clones visual properties.

### 3.3 Destruction (`destroyEntity`)
1.  **Cleanup Physics**: `PhysicsService.removeBody`.
2.  **Cleanup Visuals**: `SceneService.removeEntityVisual` (Disposes mesh/Unregisters proxy).
3.  **Cleanup Data**: `world.destroyEntity`.
