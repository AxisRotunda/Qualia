# Physics Integration
> **Scope**: Simulation Layer, Rapier Configuration, Collision Handling.
> **Source**: `src/services/physics.service.ts`, `src/services/factories/physics-factory.service.ts`

## 1. Engine Configuration
*   **Library**: `@dimforge/rapier3d-compat`.
*   **Initialization**: WASM loaded via `RAPIER.init()`.
*   **World**:
    *   **Gravity**: Dynamic `y` axis (default -9.81). Controlled via `setGravity`.
    *   **Timestep**: Fixed step handled by game loop (variable dt passed to update, but Rapier steps are discrete).

## 2. Body Types & Factories
Managed by `PhysicsFactoryService`.

### 2.1 Box
*   **Collider**: `Cuboid`.
*   **Dimensions**: Width, Height, Depth.
*   **Logic**: `ColliderDesc.cuboid(w/2, h/2, d/2)`. Half-extents used.

### 2.2 Sphere
*   **Collider**: `Ball`.
*   **Dimensions**: Radius.
*   **Logic**: `ColliderDesc.ball(radius)`.

### 2.3 Cylinder
*   **Collider**: `Cylinder`.
*   **Dimensions**: Height, Radius.
*   **Logic**: `ColliderDesc.cylinder(height/2, radius)`.

### 2.4 Character (Kinematic)
Managed by `CharacterPhysicsService`.
*   **Type**: `KinematicPositionBased` RigidBody + `CharacterController`.
*   **Shape**: `Capsule` (Height defined as total height, internal math converts to half-height segment).
*   **Movement**: `controller.computeColliderMovement()` handles slope climbing (45deg), stepping (0.3), and snap-to-ground.

## 3. Material Properties
Physics materials are dynamic and per-entity.
*   **Friction**: Resistance to sliding. Range 0.0 - 2.0+.
*   **Restitution**: Bounciness. Range 0.0 (no bounce) - 1.0+ (energy addition).
*   **Update Path**: `EngineService.updateEntityPhysics` -> `PhysicsService.updateBodyMaterial` -> Iterates all colliders on body -> `collider.setFriction/Restitution`.

## 4. Scaling Logic
Rapier does not support runtime scaling of RigidBodies natively in a simple way (colliders must be recreated).
**Implementation**: `PhysicsService.updateBodyScale`
1.  Read `PhysicsBodyDef` (original shape).
2.  Remove existing Colliders on body.
3.  Calculate new dimensions based on `scale` vector.
4.  Create new `ColliderDesc` with scaled dimensions.
5.  Attach new Collider to existing RigidBody.
6.  Restore Mass/Density properties.