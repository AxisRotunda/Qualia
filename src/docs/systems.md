# Qualia 3D System Manifest
> **VERSION**: 3.0.0 (Facade Hardened)
> **TYPE**: Master Topology
> **ROOT**: `src/docs/kernel.md`

## 1. Domain Clusters

### 1.1 [CORE] The Engine
*   **Runtime**: `EngineRuntimeService` (Scheduler).
*   **State**: `EngineStateService` (Reactive Signal Store).
*   **Lifecycle**: `BootstrapService` -> `SceneLoader` -> `LevelManager`.
*   **Events**: `EntityLifecycleService`, `SceneLifecycleService`.

### 1.2 [PHYSICS] The Law
*   **Simulation**: `PhysicsWorldService` (Rapier3D WASM).
*   **Data**: `RigidBodyStore` (SoA), `PhysicsPropsStore` (SoA).
*   **Interaction**: `PhysicsInteractionService` ("The Hand" / Spring Joints).
*   **Logic**: `MassCalculator`, `PhysicsStepService`.

### 1.3 [RENDER] The Eye
*   **Scene**: `SceneGraphService` (Group Hierarchy).
*   **Camera**: `CameraManagerService` (Shake, Dynamic FOV, Interpolation).
*   **Environment**: `EnvironmentControlService` (Biome Logic), `EnvironmentManager` (Lights/Fog).
*   **Pipeline**: `RendererService`, `PostProcessingService`.
*   **Optimization**: `VisibilityManager` (Culling), `InstancedMeshService`.

### 1.4 [COMBAT] The Conflict
*   **Logic**: `WeaponService` (Trigger), `CombatSystem` (Ballistics/Projectiles).
*   **Visuals**: `ViewModelAnimationService` (Viewmodel), `VfxService` (Particles).
*   **Data**: `ProjectileStore`, `IntegrityStore`.

### 1.5 [ECOSYSTEM] The Wild
*   **Fauna**: `BehaviorSystem` (Agents), `AgentStore`.
*   **Dynamics**: `BuoyancySystem` (Fluid Dynamics), `MaterialAnimationSystem`.
*   **Terrain**: `TerrainManagerService` (Grid Streaming).

### 1.6 [LOGIC] The Will
*   **Hardware**: `GameInputService` (Action Mapping).
*   **Controllers**: `CameraControlService`, `CharacterControllerService`, `FlyControlsService`.
*   **Manipulation**: `ObjectManipulationService` (Mobile Grab).

## 2. Critical Path (Execution Priority)
Order within `EngineRuntimeService.tick(dt)`:

1.  **Input (0)**: `InputSystem`.
2.  **Environment (100)**: `EnvironmentSystem`.
3.  **Behavior (120)**: `BehaviorSystem`.
4.  **Logic (150)**: `SceneLogicSystem`.
5.  **Kinematics (180)**: `KinematicSystem`.
6.  **Buoyancy (190)**: `BuoyancySystem`.
7.  **Combat (195)**: `CombatSystem`.
8.  **Physics (200)**: `PhysicsSystem` (Step -> Sync).
9.  **Post-Physics (205-210)**: `DestructionSystem`, `RepairSystem`.
10. **Animation (350)**: `AnimationSystem`.
11. **Visuals (800-850)**: `MaterialAnimationSystem`, `WeaponSystem`.
12. **Culling (890)**: `TerrainManagerService`.
13. **Render (900)**: `RenderSystem` (Interpolate -> Draw).
14. **Post-Frame (1100)**: `TelemetrySystem`, `StatisticsSystem`.

## 3. Data Flow Axioms
*   **Simulation vs Frame**: Physics runs at fixed 60Hz. Render system interpolates visuals between `T` and `T-1`.
*   **Entity Sovereignty**: UI never writes to ECS; it calls `EntityOpsService` or `TransformLogicService`.
*   **Visual Bridge**: `SelectionHighlightService` connects `EngineState.selectedEntity` to 3D gizmos.