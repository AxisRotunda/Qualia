# Interaction Model
> **Scope**: User Input interpretation, Raycasting, Selection, Context Menus, Physics Interaction.
> **Source**: `src/engine/interaction.service.ts`, `src/engine/interaction/raycaster.service.ts`
> **Version**: 2.0 (Refined Manipulation)

## 1. Raycasting Hierarchy
`RaycasterService` provides the core spatial query logic, consumed by `InteractionService`.
**Priority Order**:
1.  **Gizmo Handles**: If intersected, blocks new selection and triggers direct transform.
2.  **Scene Entities**: Raycast against `world.meshes` (and Instanced Meshes).
3.  **Void**: Returns `null` or infinite ground plane.

## 2. Input Events
`InteractionService` orchestrates events from `PointerListenerService`:
*   **Click**: Triggers selection (if not placing).
*   **Long Press**: Triggers Context Menu + Haptic Pulse (15ms).
*   **Constraint**: If `EngineState.isPlacementActive()` is true, InteractionService ignores clicks to prevent selection jitter.

## 3. Placement Logic (`PlacementService`)
*   **State**: `active`, `valid`, `isPlacementActive`.
*   **Validation**: Performs AABB intersection check against existing entities to prevent overlapping physics.
*   **Snap**: Props and nature assets automatically align to surface normals during placement.

## 4. Physics Interaction ("The Grab")
*   **Mode**: Active during `edit` mode when using the **Translation** tool on mobile/joystick.
*   **Mechanism**: `Kinematic Hand` + `ImpulseJoint` (Spring).
*   **Realism**: Grip strength is proportional to target mass. Hand movement is clamped to a `2.8m` radius to prevent spring energy buildup.
*   **Pause Fallback**: If simulation is paused, the tool automatically switches from Spring Joint to Direct Teleport for visual accuracy.

## 5. Transformation Logic
Differentiated based on Transform Mode and Simulation State:

| Mode | State | Mechanism | Behavior |
|------|-------|-----------|----------|
| **Translate** | Play | Physics Grab | Joint-based. Heavy feel. Collides with world. |
| **Translate** | Pause | Direct Transform | Immediate teleport. No physics collision. |
| **Rotate** | Any | Direct Transform | Euler manipulation. Instant rotation. |
| **Scale** | Any | Direct Transform | Multi-axis scaling. Rebuilds colliders via `PhysicsScaler`. |