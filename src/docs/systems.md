# Qualia 3D System Manifest
> **VERSION**: 2.7.0 (Biological Extension)
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
*   **Data**: `RigidBodyStore` (Handle Map), `PhysicsPropsStore` (SoA).
*   **Interaction**: `PhysicsInteractionService` ("The Hand" / Spring Joints).
*   **Pipeline**: `PhysicsFactory` -> `ShapesFactory` -> `MassCalculator`.

### 1.3 [RENDER] The Eye
*   **Scene**: `SceneGraphService` (Tree).
*   **Camera**: `CameraManagerService` (Composition, Shake, Dynamic FOV).
*   **Environment**: `EnvironmentControlService` (Atmosphere), `EnvironmentManager` (Lights/Fog).
*   **Optimization**: `VisibilityManager` (Culling), `InstancedMeshService`.
*   **Post-Process**: `PostProcessingService` (Bloom/Grain/Vignette).

### 1.4 [COMBAT] The Conflict
*   **Logic**: `WeaponService` (State/Trigger), `CombatSystem` (Impacts).
*   **Data**: `ProjectileStore` (SoA), `IntegrityStore` (Health).
*   **Visuals**: `ViewModelAnimationService` (Sway/Recoil), `VfxService` (Particles).

### 1.5 [ECOSYSTEM] The Wild
*   **Flora**: `NatureFloraService` (L-Systems), `NatureGenerator`.
*   **Fauna**: `AgentService` (Autonomous Logic), `FaunaGenerator`.
*   **Dynamics**: `WindSystem` (Vertex Displacement), `BuoyancySystem`.
*   **Registry**: `SceneRegistry`, `EntityLibrary`.

### 1.6 [LOGIC] The Will
*   **Hardware**: `GameInputService` (Normalization).
*   **Controllers**: `CameraControl`, `CharacterController`, `FlyControls`.
*   **AI**: `SteeringService`, `BehaviorTreeEngine`.
*   **Manipulation**: `ObjectManipulationService` (Visuals <-> Physics Bridge).

## 2. Critical Path (Frame Loop)
Execution order within `EngineRuntimeService.tick(dt)`:

1.  **Input**: `InputSystem` (Reads hardware, updates controllers).
2.  **Logic**: `EnvironmentSystem` -> `BehaviorSystem` (Fauna) -> `KinematicSystem`.
3.  **Pre-Physics**: `BuoyancySystem` -> `CombatSystem` (Apply forces).
4.  **Physics**: `PhysicsSystem` (Step World -> Sync ECS Transforms).
5.  **Post-Physics**: `DestructionSystem` -> `RepairSystem` (Constraint enforcement).
6.  **Animation**: `AnimationSystem` -> `WeaponSystem`.
7.  **Visuals**: `VfxSystem` -> `MaterialAnimationSystem` (Wind/Foliage).
8.  **Render**: `RenderSystem` (Cull -> Update Instances -> Camera -> Draw).
9.  **Meta**: `StatisticsSystem`.

## 3. Data Flow Axioms
*   **Physics -> Visuals**: The Physics simulation is the source of truth for position/rotation.
*   **ECS -> Components**: UI components read from ECS/State Signals.
*   **Generators -> ECS**: Generators produce `PhysicsBodyDef` and `Mesh`, which `EntityAssembler` binds to an ID.