# Physics Integration
> **Scope**: Simulation Layer, Rapier Configuration, Collision Handling.
> **Source**: `src/physics/`
> **Tier**: Tier 2 (Architecture)

## 1. Engine Configuration
*   **Library**: `@dimforge/rapier3d-compat`.
*   **Time Step**: Fixed 60Hz (`1/60`s).
*   **Accumulator**: Decouples Render FPS from Physics steps.

## 2. Material System (`PhysicsMaterialsService`)
| Material | Density (kg/m³) | Friction | Restitution |
|----------|-----------------|----------|-------------|
| `concrete` | 2400 | 0.8 | 0.05 |
| `ice` | 917 | 0.005 | 0.05 |
| `metal` | 7850 | 0.6 | 0.15 |

## 3. Body Scaler
Handles resizing physics colliders at runtime by rebuilding `ColliderDesc`.
*   **Constraint**: Vertex-based colliders (Hull/Trimesh) must be rebuilt from the original buffer stored in `PhysicsBodyDef`.

## 4. Interaction Physics
*   **Hand Body**: A Kinematic RigidBody moved to cursor position.
*   **Spring Joint**: Connects Hand to target dynamic body.
