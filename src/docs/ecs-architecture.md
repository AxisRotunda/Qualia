# ECS Architecture
> **Scope**: Data Layer, Entity Lifecycle, Component Schema.
> **Source**: `src/engine/core.ts`, `src/engine/entity-manager.service.ts`

## 1. Core Concepts

### 1.1 The World
The `World` class is a container for all game state. It holds a Set of active Entity IDs and a collection of `ComponentStore<T>` instances.

### 1.2 Entity
Type: `number` (Opaque ID).
Entities are simply keys used to look up data across Component Stores.

### 1.3 ComponentStore<T>
A wrapper around `Map<Entity, T>`.
*   **Access**: O(1) `get`, `has`, `add`, `remove`.
*   **Iteration**: `forEach((val, entity) => void)`.
*   **Memory**: Dynamic allocation (JavaScript Map). Not a fixed-size array buffer (for simplicity/flexibility over raw perf).

## 2. Component Schema

| Store Name | Type | Description | Persistence |
|------------|------|-------------|-------------|
| `transforms` | `Transform` | Canonical Position/Rotation/Scale. | **Saved** |
| `rigidBodies` | `RigidBodyRef` | `{ handle: number }`. Link to Rapier. | Runtime |
| `meshes` | `MeshRef` | `{ mesh: THREE.Mesh }`. Link to Three.js. | Runtime |
| `bodyDefs` | `PhysicsBodyDef` | Config used to spawn the body. Used for reconstruction. | **Saved** |
| `physicsProps` | `PhysicsProps` | `{ friction, restitution }`. Material logic. | **Saved** |
| `names` | `string` | User-facing label in Scene Tree. | **Saved** |
| `templateIds` | `string` | ID of the `EntityTemplate` used to spawn. | **Saved** |

## 3. Entity Lifecycle

### 3.1 Creation (`createEntityFromDef`)
1.  **Input**: `PhysicsBodyDef`, Visual Options, Name, TemplateID.
2.  **Mesh Gen**: `MeshFactory` creates `THREE.Mesh` -> Added to Scene.
3.  **ECS Entry**: `world.createEntity()` mints ID.
4.  **Registration**: Components added to `transforms`, `rigidBodies`, `meshes`, `bodyDefs`, etc.
5.  **Signal Update**: `objectCount` incremented.

### 3.2 Duplication (`duplicateEntity`)
1.  **Source**: Existing Entity ID.
2.  **Read**: Fetches `bodyDef`, `transform`, `physicsProps` of source.
3.  **Offset**: New position calculated (x + 1).
4.  **Physics Gen**: `PhysicsFactory` creates new Rapier Body based on source Def.
5.  **Scale**: Physics colliders scaled to match source transform scale.
6.  **Lifecycle**: Calls `createEntityFromDef` with new body.

### 3.3 Destruction (`destroyEntity`)
1.  **Cleanup Physics**: `PhysicsService.removeBody(handle)`.
2.  **Cleanup Visuals**: `SceneService.removeMesh(mesh)`.
3.  **Cleanup Data**: `world.destroyEntity(id)` removes all component entries.
4.  **Signal Update**: `objectCount` decremented, `selectedEntity` cleared if match.

## 4. Synchronization Pipeline
The `EngineService` runs a loop that keeps ECS, Physics, and Visuals in sync.

**Flow**:
1.  **Physics Step**: Rapier world simulates one step.
2.  **Sync (EntityManager.syncPhysicsTransforms)**:
    *   Iterate `world.rigidBodies`.
    *   **Get Pose**: `PhysicsService.getBodyPose(handle)`.
    *   **Update ECS**: `world.transforms.set(pos, rot)`.
    *   **Update Mesh**: `mesh.position.copy(pos)`, `mesh.quaternion.copy(rot)`.
3.  **Edit Mode Exception**: If Gizmo is dragging, Visual Transform overrides Physics Transform.