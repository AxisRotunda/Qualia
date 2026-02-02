# [T1] Qualia 3D System Manifest
> **VERSION**: 5.0 (Syntactic Update)
> **TYPE**: Master Topology

## 1. Domain Clusters (Authorization Matrix)
| Domain | Lead Tier | Protocol | Target Services |
|---|---|---|---|
| **World** | T3 | `protocol-content` | `SpawnerService`, `LevelManager` |
| **Locomotion** | T2 | `protocol-industry` | `CharacterController`, `CharacterPhysics` |
| **Physics** | T2 | `protocol-dynamics` | `PhysicsWorldService`, `ShapesFactory` |
| **Stability** | T1 | `protocol-repair` | `RepairSystem`, `EntityAssembler` |
| **Graphics** | T2 | `protocol-render` | `RendererService`, `VisualsFactory` |

## 2. System Execution Priority (hot-loop)
1.  **Input (0)**
2.  **Environment (100)**
3.  **Behavior (120)**
4.  **Kinematics (180)**
5.  **Combat (195)**
6.  **Physics (200)**
7.  **Destruction (205)**
8.  **Animation (350)**
9.  **VFX (950)**
10. **Render (900)**

## 3. AI-Ingestion Pathing
1. `kernel.md` -> `Axial Check`
2. `systems.md` -> `Domain Mapping`
3. `agent-workflow.md` -> `Execution Strategy`
4. `knowledge-graph.md` -> `Dependency Verification`