
# Physics Integration
> **Scope**: Simulation Layer, Rapier Configuration, Collision Handling, Body Configuration.
> **Source**: `src/services/physics.service.ts`, `src/physics/`
> **Reference**: See `[Math & Algorithms](./math-algorithms.md)` for mass/damping formulas.

## 1. Engine Configuration
*   **Library**: `@dimforge/rapier3d-compat`.
*   **Initialization**: WASM loaded via `RAPIER.init()`.
*   **Service**: `PhysicsWorldService`.
*   **Time Step**: Fixed 60Hz (`1/60`s).

## 2. Registry Architecture
To decouple simulation from game logic, we separate the physics loop from the entity mapping.
*   **Service**: `PhysicsRegistryService`.
*   **Role**: Maintains `Map<Handle, EntityID>`.

## 3. Material System (`PhysicsMaterialsService`)
Defines physical properties for realistic interactions. "Hard Realism" tuning.

| Material | Density (kg/m³) | Friction | Restitution |
|----------|-----------------|----------|-------------|
| `concrete` | 2400 | 0.9 | 0.05 |
| `ice` | 917 | 0.02 | 0.05 |
| `metal` | 7850 | 0.6 | 0.15 |
| `wood` | 700 | 0.7 | 0.1 |
| `rubber` | 1100 | 0.9 | 0.7 |

## 4. Body Factories & Logic

### 4.1 ShapesFactory (Orchestrator)
Central entry point for creating RigidBodies and Colliders. Delegates complex math to `MassCalculator`.

### 4.2 PhysicsScaler
Handles the complexity of resizing physics bodies at runtime.
*   **Constraint**: Rapier colliders generally cannot be scaled in-place. They are rebuilt when the ECS scale component changes.
*   **Complex Meshes**: `convex-hull` and `trimesh` colliders are rebuilt by transforming the persisted vertex buffer stored in `PhysicsBodyDef`.
*   **Process**:
    1.  Remove existing Collider.
    2.  If Primitive: Calculate new dimensions: $D_{new} = D_{def} \cdot S_{transform}$.
    3.  If Mesh: Scale raw vertex buffer by $S_{transform}$.
    4.  Create NEW `ColliderDesc`.
    5.  Update Mass (Scale proportional to Volume change $\Delta V = S_x S_y S_z$).
    6.  Attach to existing RigidBody.

## 5. Body Types & Colliders
| Type | Collider | Construction | Dynamic? |
|------|----------|--------------|----------|
| `box` | `cuboid` | `(w/2, h/2, d/2)` | Yes |
| `sphere` | `ball` | `(radius)` | Yes |
| `cylinder` | `cylinder` | `(height/2, radius)` | Yes |
| `cone` | `cone` | `(height/2, radius)` | Yes |
| `trimesh` | `trimesh` | Vertices + Indices | **No** (Static only) |
| `convex-hull` | `convexHull` | Vertices | Yes |
| `heightfield` | `heightfield` | Heights + Scale | **No** (Static) |

## 6. Interaction Physics
*   **Service**: `PhysicsInteractionService`.
*   **Mechanism**: "The Hand". A Kinematic RigidBody moved to the cursor position.
*   **Connection**: `ImpulseJoint` (Spring) connects "Hand" to Target Body.
