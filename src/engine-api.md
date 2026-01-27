
# Engine Core API

This document describes the public interface of `EngineService` for internal UI tools.

## Signals (Read-Only)

- `world`: The ECS World instance (Entities, Transforms, MeshRefs, RigidBodies).
- `selectedEntity`: Signal<Entity | null>. Currently selected object ID.
- `isPaused`: Signal<boolean>. Simulation run state.
- `gravityY`: Signal<number>. Current vertical gravity.
- `fps`, `physicsTime`, `renderTime`, `objectCount`: Performance metrics.

## Actions

### Entity Management
- `spawnBox()`: Spawns a random cube.
- `spawnSphere()`: Spawns a random sphere.
- `duplicateEntity(e: Entity)`: Clones the entity.
- `deleteEntity(e: Entity)`: Destroys physics, mesh, and ECS data.
- `reset()`: Clears the entire scene and resets camera/physics.

### Simulation Control
- `togglePause()`: Freezes/Unfreezes physics stepping.
- `setGravity(val: number)`: Updates physics world gravity Y.

### Interaction
- `raycastFromScreen(x, y)`: Returns Entity ID under mouse or null.

## Integration Rules
1. UI Components must inject `EngineService`.
2. UI Components must NOT access `PhysicsService` or `SceneService` directly unless implementing a new renderer/solver feature.
3. All state mutations (position, gravity) must go through `EngineService` or `PhysicsService` validated methods.
