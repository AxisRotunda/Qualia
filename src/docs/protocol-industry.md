
# [PROTOCOL] Industry Standard Analysis
> **Trigger**: `RUN_INDUSTRY`
> **Target**: `src/engine/`, `src/docs/`
> **Version**: 2.0 (Locomotion & Stance Update)
> **Axiom**: "Don't reinvent the wheel; reinforce the axle. Stand on the shoulders of giants."

## 1. Analysis Routine
1.  **Pattern Matching**:
    *   Select a feature (e.g., "Bullet Physics", "Mobile Controls", "Inventory UI").
    *   Identify the implementation in standard engines (Unity/Unreal/Havok/AAA Titles).
    *   **Unity/Unreal**: Reference the standard implementation (e.g., `CharacterController` vs `Rigidbody`).
    *   **Qualia**: Determine the closest architectural equivalent.
2.  **Gap Analysis**:
    *   Compare current Qualia implementation to the Standard.
3.  **Integration Feasibility**:
    *   **Performance**: Can it run in 16ms (60fps)?
    *   **Architecture**: Does it require breaking the `Facade` pattern?

## 2. Refinement Strategies
*   **Game Loop Architecture (Core)**:
    *   **Standard**: "Fix your Timestep". Decouple Simulation Rate (e.g., 60Hz) from Render Rate. Render frame `N` is an interpolation between Physics State `T` and `T-1`.
    *   **Qualia**: Implemented `State Interpolation` in `EntityTransformSystem`.
*   **Locomotion & Navigation (NEW)**:
    *   **Standard**: Dynamic Stances (Stand/Crouch/Prone). Auto-Step for climbing curbs/stairs.
    *   **Qualia**: Implemented `isCrouching` state. Standardized `autostep` at `0.5m` height with `0.2m` depth in `CharacterPhysicsService`.
    *   **Hitbox Refinement**: Capsules MUST be resized during stance changes to allow passing under low geometry (e.g. vents, tables).
    *   **Camera Smoothness**: Eye-level changes MUST be interpolated using a spring function (K=250, D=22) rather than raw lerp to avoid linear "robotic" movement.
*   **Input Abstraction (Input)**:
    *   **Standard**: Input Action Maps. Logic binds to `Action.Jump`, user binds `Space` -> `Action.Jump`.
    *   **Qualia**: Migrated to semantic `InputAction` enum and centralized map.
*   **Tactical Reticle (UI)**:
    *   Implement segmented brackets in `GameHud` using `Velocity` signals. Use Raycasting for Target ID scans at 10Hz.
*   **Focus / ADS (Control)**:
    *   Map RMB/Secondary touch to `isAiming` signal. Update `CharacterController` to apply `0.6x` look sensitivity and `-15deg` FOV offset.
*   **Ballistics Model (Physics)**: Apply explicit Drag Force per frame based on velocity squared.
*   **Kinematic Character Controller (KCC)**:
    *   **Constraint**: `Skin` (offset) must be small enough to allow step climbing but large enough to prevent tunneling. Target: `0.02m`.
*   **Cinematic Lens (Shaders)**: RGB-split (Chromatic Aberration) based on radial distance.

## 3. Cross-Protocol Mapping (The Bridge)
| Industry Domain | Target Protocol | Integration Point |
|---|---|---|
| **Stance Engine** | `RUN_ACTOR` | `CharacterController`, `CharacterPhysics` |
| **Navigation** | `RUN_PHYS` | `CharacterPhysicsService.autostep` |
| **Input/Haptics** | `RUN_INPUT` | `GameInputService`, `Controllers` |
| **Tactical HUD** | `RUN_UI` | `GameHudComponent`, `RaycasterService` |
| **Stability/Failover** | `RUN_REPAIR` | `LevelManager`, `SceneLoader` |
| **Terrain** | `RUN_GEO` | `terrain.shader.ts`, `custom-material.registry.ts` |

## 4. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: Crouch height should be roughly 60% of standing height for visual realism.
*   *Current Heuristic*: Transitioning stance while moving should preserve momentum but apply increased friction.
*   *Current Heuristic*: Auto-step height > 0.6m often causes visual "teleporting" if not paired with a vault animation. Cap at 0.5m for standard KCC.

## 5. Meta-Update (Self-Optimization)
**INSTRUCTION**: After porting a standard, perform the **Mutation Check**.
