# Qualia 3D System Manifest
> **VERSION**: 4.0 (Tiered Re-alignment)
> **TYPE**: Master Topology
> **ROOT**: `../kernel.md`

## 1. Domain Clusters

### 1.1 [CORE] The Engine
*   **Runtime**: `EngineRuntimeService` (Scheduler).
*   **State**: `EngineStateService` (Reactive Signal Store).
*   **Interface**: `../architecture/engine-api.md`.
*   **Systems**: `../architecture/runtime-architecture.md`.

### 1.2 [PHYSICS] The Law
*   **Simulation**: `PhysicsWorldService` (Rapier3D WASM).
*   **Blueprints**: `../architecture/physics-integration.md`.
*   **Execution**: `../protocols/protocol-dynamics.md`.

### 1.3 [RENDER] The Eye
*   **Scene**: `SceneGraphService`.
*   **Pipeline**: `../architecture/graphics-pipeline.md`.
*   **Composition**: `../protocols/protocol-render.md`.

### 1.4 [COMBAT] The Conflict
*   **Logic**: `../architecture/combat-system.md`.
*   **Execution**: `../protocols/protocol-combat.md`.

### 1.5 [LOGIC] The Will
*   **Hardware**: `../architecture/input-system.md`.
*   **Controllers**: `CharacterControllerService`, `CameraControlService`.
*   **Protocols**: `../protocols/protocol-input.md`.

## 2. System Execution Priority
Order within `EngineRuntimeService.tick(dt)`:

1.  **Input (0)**: `InputSystem`.
2.  **Environment (100)**: `EnvironmentSystem`.
3.  **Behavior (120)**: `BehaviorSystem`.
4.  **Kinematics (180)**: `KinematicSystem`.
5.  **Combat (195)**: `CombatSystem`.
6.  **Physics (200)**: `PhysicsSystem`.
7.  **Destruction (205)**: `DestructionSystem`.
8.  **Animation (350)**: `AnimationSystem`.
9.  **VFX (950)**: `VfxSystem`.
10. **Render (900)**: `RenderSystem`.

## 3. Tiered Documentation Mapping
*   **Tier 1**: `project-hierarchy.md`, `knowledge-graph.md`.
*   **Tier 2**: `ecs-architecture.md`, `state-topology.md`.
*   **Tier 3**: `protocol-optimize.md`, `protocol-refactor.md`.
*   **Tier 4**: `memory.md`, `optimization-report.md`.