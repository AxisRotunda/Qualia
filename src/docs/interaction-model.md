
# Interaction Model
> **Scope**: User Input interpretation, Raycasting, Selection, Context Menus, Physics Interaction.
> **Source**: `src/engine/interaction.service.ts`, `src/services/object-control.service.ts`, `src/physics/world.service.ts`

## 1. Raycasting Hierarchy
`InteractionService` arbitrates clicks/taps.
**Priority Order**:
1.  **Placement Mode**: If `PlacementService.active()`, all input goes to positioning ghost via `raycastSurface`.
2.  **Gizmo Handles**: If `TransformControls` are intersected, input drives transformation (blocks selection).
3.  **Scene Entities**: Raycast against `world.meshes`. Selects entity.
4.  **Void**: Deselects current entity.

## 2. Input Events
*   **PointerDown**: Records timestamp and position. Starts `LongPress` timer (600ms).
*   **PointerMove**: Updates Ghost position (if placing) or Gizmo drag.
*   **PointerUp**:
    *   If `delta_time < 500ms` AND `delta_dist < 20px`: **Click**.
    *   Else: **Drag** (Ignored for selection).
*   **ContextMenu**: Triggered by Right Click or Long Press.

## 3. Physics Interaction ("The Grab")
*   **Mode**: Active during `edit` mode when using the **Translation** tool (Virtual Joystick or Gizmo Translation).
*   **Mechanism**: `Kinematic Hand` + `Spring Joint`.
    *   **Hand**: A `KinematicPositionBased` rigid body managed by `PhysicsWorldService`.
    *   **Joint**: `ImpulseJoint` (Spring type) connecting Hand to Target Entity.
*   **Flow**:
    1.  User input (Joystick) moves virtual cursor.
    2.  `ObjectControlService` calls `physics.grabBody(handle, anchor)` on start.
    3.  `ObjectControlService` updates Hand position via `physics.moveGrabbed(pos)`.
    4.  Physics Engine solves spring constraint, pulling object toward hand while respecting collisions (Walls, Floor).
    5.  `ObjectControlService` calls `physics.releaseGrab()` on input end.

## 4. Transformation Logic
Differentiated based on Transform Mode:

| Mode | Mechanism | Service Chain | Behavior |
|------|-----------|---------------|----------|
| **Translate** | Physics Grab | `Control` -> `Physics` -> `Joint` | Collides with world. "Heavy" feel. |
| **Rotate** | Direct Transform | `Control` -> `EntityTransformSystem` | Teleports rotation. No collision. |
| **Scale** | Direct Transform | `Control` -> `EntityTransformSystem` | Teleports scale. Rebuilds colliders. |

## 5. Context Menu Flow
1.  **Trigger**: `handleContextMenu()` logic in `InteractionService`.
2.  **State**: Updates `contextMenuRequest` signal `{x, y, entity}`.
3.  **UI**: `MainLayout` observes signal -> Renders `ContextMenuComponent` absolute overlay.
4.  **Action**: UI Component calls `EngineService` methods (`duplicate`, `delete`).
5.  **Close**: Any `PointerDown` elsewhere resets signal to `null`.

## 6. Placement Logic (`PlacementService`)
*   **State**: `active` and `valid` signals.
*   **Visual**: Creates "Ghost" mesh (Wireframe/Transparent material) from Template.
*   **Raycasting**: Uses `InteractionService.raycastSurface` to detect real world geometry.
*   **Alignment**:
    *   **Props**: Aligns objects to the surface normal (e.g., sticking to walls).
    *   **Buildings**: Maintains vertical (Gravity) alignment.
*   **Validation**: 
    *   Performs AABB intersection check against existing entities.
    *   **Red**: Invalid placement (Overlap).
    *   **Cyan**: Valid placement.
*   **Confirm**: On Click, calls `EntityLibrary.spawnFromTemplate` at ghost position if `valid`.
