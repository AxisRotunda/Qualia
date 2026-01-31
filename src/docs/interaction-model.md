
# Interaction Model
> **Scope**: User Input interpretation, Raycasting, Selection, Context Menus, Physics Interaction.
> **Source**: `src/engine/interaction.service.ts`, `src/engine/interaction/raycaster.service.ts`

## 1. Raycasting Hierarchy
`RaycasterService` provides the core spatial query logic, consumed by `InteractionService`.
**Priority Order**:
1.  **Gizmo Handles**: If intersected, blocks new selection.
2.  **Scene Entities**: Raycast against `world.meshes` (and Instanced Meshes).
3.  **Void**: Returns `null`.

## 2. Input Events
`InteractionService` orchestrates events from `PointerListenerService`:
*   **Click**: Triggers selection (if not placing).
*   **Long Press**: Triggers Context Menu.
*   **Constraint**: If `EngineState.isPlacementActive()` is true, InteractionService ignores clicks.

## 3. Placement Logic (`PlacementService`)
*   **State**: `active`, `valid`, `isPlacementActive` (Global State).
*   **Input Handling**: Autonomous. Registers own `pointermove` and `pointerup` listeners on activation.
*   **Visual**: Creates "Ghost" mesh.
*   **Validation**: Performs AABB intersection check against existing entities.

## 4. Physics Interaction ("The Grab")
*   **Mode**: Active during `edit` mode when using the **Translation** tool on mobile/joystick.
*   **Mechanism**: `Kinematic Hand` + `Spring Joint`.
*   **Service**: `ObjectManipulationService` drives `PhysicsInteractionService`.

## 5. Transformation Logic
Differentiated based on Transform Mode:

| Mode | Mechanism | Service Chain | Behavior |
|------|-----------|---------------|----------|
| **Translate** | Physics Grab | `Control` -> `Physics` -> `Joint` | Collides with world. "Heavy" feel. |
| **Rotate** | Direct Transform | `Control` -> `EntityTransformSystem` | Teleports rotation. No collision. |
| **Scale** | Direct Transform | `Control` -> `EntityTransformSystem` | Teleports scale. Rebuilds colliders via `PhysicsScaler`. |
