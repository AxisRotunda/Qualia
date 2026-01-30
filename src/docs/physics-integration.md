
# Physics Integration
> **Scope**: Simulation Layer, Rapier Configuration, Collision Handling, Body Configuration.
> **Source**: `src/services/physics.service.ts`, `src/physics/`, `src/services/character-physics.service.ts`

## 1. Engine Configuration
*   **Library**: `@dimforge/rapier3d-compat`.
*   **Initialization**: WASM loaded via `RAPIER.init()`.
*   **Service**: `PhysicsWorldService`.
*   **Time Step**: Fixed 60Hz (`1/60`) with accumulator logic in `step(dtMs)`.
*   **Max Frame Time**: Cap at `0.1`s to prevent spiral of death.

## 2. Event System
*   **Stream**: `collision$: Subject<CollisionEvent>` in `PhysicsWorldService`.
*   **Mapping**: `handleToEntity: Map<number, number>` links Rapier Handle -> ECS Entity ID.
*   **Registration**: `EntityManager` registers handle on creation.
*   **Process**:
    1. `world.step()`
    2. `eventQueue.drainCollisionEvents()`
    3. Map handles to Entity IDs.
    4. Emit `collision$`.

## 3. Body Types & Factories
Managed by `PhysicsFactoryService` & `ShapesFactory`.

### 3.1 Primitive Shapes
| Type | Collider | Construction |
|------|----------|--------------|
| `box` | `cuboid` | `(w/2, h/2, d/2)` |
| `sphere` | `ball` | `(radius)` |
| `cylinder` | `cylinder` | `(height/2, radius)` |
| `cone` | `cone` | `(height/2, radius)` |

### 3.2 Complex Shapes
*   **Trimesh**: `ColliderDesc.trimesh(vertices, indices)`. **Static Only**.
    *   **Usage**: Architectural elements (Stairs, Hollow Buildings, Corridors).
*   **Convex Hull**: `ColliderDesc.convexHull(vertices)`. **Dynamic Capable**.
    *   **Usage**: Complex Props (`hero-rock`, `sofa`, `monitor`).

### 3.3 Special Configurations
*   **Locked Rotation**: `RigidBodyDesc.lockRotations()`.
    *   **Usage**: Large buildings/structures that must be Dynamic (have gravity/collision) but must not tip over.
    *   **Mass**: Buildings typically assigned `50000kg` mass.

## 4. Interaction Physics ("The Hand")
**Service**: `PhysicsInteractionService`.
*   **Body**: `RigidBodyDesc.kinematicPositionBased`.
*   **State**: Exists in world, teleported to `(0, -1000, 0)` when inactive.
*   **Joint**: `ImpulseJoint` (Spring) connects Hand to Grabbed Object.
    *   **Stiffness**: 500.0 (Strong pull).
    *   **Damping**: 20.0 (Minimal oscillation).
*   **Behavior**: Allows "soft" manipulation where grabbed objects stop against walls instead of clipping through.

## 5. Kinematic Character
Managed by `CharacterPhysicsService`.
*   **Type**: `RigidBodyDesc.kinematicPositionBased`.
*   **Collider**: `Capsule`.
*   **Controller**: `Rapier.KinematicCharacterController`.
    *   **AutoStep**: Max Height `0.5m`.
    *   **Max Slope**: `50 degrees`.
*   **Interaction**: `applyInteractionImpulses`.
    *   Transfers momentum to Dynamic bodies on contact based on a Virtual Mass (120kg).

## 6. Material Properties (`PhysicsMaterialsService`)
Dynamic updates via `updateBodyMaterial`.
*   **Friction**: 0.0 - 2.0+.
*   **Restitution**: 0.0 - 1.0+.
*   **Logic**: Iterates **all** colliders on a rigid body and updates properties.

## 7. Scaling Logic
Runtime scaling requires collider reconstruction.
**Method**: `updateBodyScale(handle, def, scale)`
1.  Read original `PhysicsBodyDef`.
2.  Remove existing Colliders.
3.  Calculate new dimensions: `def.dim * scale.axis`.
4.  Create new `ColliderDesc`.
5.  Re-attach to Body.
