
# ECS Architecture
> **Scope**: Data Layer, Entity Lifecycle, Component Schema.
> **Source**: `src/engine/core.ts`, `src/engine/entity-manager.service.ts`

## 1. Core Concepts

### 1.1 The World
The `World` class is a container for all game state. It holds a Set of active Entity IDs and a collection of `ComponentStore<T>` instances.

### 1.2 Entity
Type: `number` (Opaque ID).
Entities are keys used to look up data across Component Stores.

### 1.3 ComponentStore<T>
Wrapper around `Map<Entity, T>`.
*   **Access**: O(1) `get`, `has`, `add`, `remove`.
*   **Memory**: Dynamic allocation.

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
  type: 'box' | 'sphere' | 'cylinder' | 'capsule' | 'cone' | 'trimesh' | 'convex-hull';
  position: { x, y, z };
  rotation: { x, y, z, w };
  size?: { w, h, d };
  radius?: number;
  height?: number;
  mass?: number;
  lockRotation?: boolean; // New in v0.8.0
}
```

## 3. Entity Lifecycle

### 3.1 Creation (`createEntityFromDef`)
1.  **Input**: `PhysicsBodyDef`, Visual Options, Name, TemplateID.
2.  **Mesh Gen**: `VisualsFactory` creates `THREE.Mesh` -> Scene.
3.  **Physics Gen**: `PhysicsFactory` (if called via Lib) or Manual creation.
4.  **ECS Entry**: `world.createEntity()`.
5.  **Registration**: `physics.registerEntity(handle, id)` for Event mapping.

### 3.2 Duplication (`duplicateEntity`)
1.  **Source**: Existing Entity ID.
2.  **Read**: `bodyDef`, `transform`, `physicsProps`, `templateId`.
3.  **Recreate**: `PhysicsFactory.recreateBody` handles cloning logic (including convex hull fallback if geom missing).
4.  **Scale**: Applies `updateBodyScale` to match source transform.
5.  **Visuals**: Clones material properties (Color/Texture).

### 3.3 Destruction (`destroyEntity`)
1.  **Cleanup Physics**: `PhysicsService.removeBody`.
2.  **Cleanup Visuals**: `SceneService.removeEntityVisual` (Disposes mesh).
3.  **Cleanup Data**: `world.destroyEntity`.

## 4. Synchronization Pipeline
**System**: `EntityTransformSystem`.
See [Runtime Architecture](./runtime-architecture.md) for sync logic details.
