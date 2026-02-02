
# Engine API Reference

> **Scope**: Public Facade methods of `EngineService`.
> **Audience**: UI Component Developers / AI Agents generating UI code.
> **Version**: 0.8.0 (Facade Hardened)

## 1. Feature Modules (Service Access)
The `EngineService` exposes specific feature services as public properties.

| Property | Service | Responsibility |
|----------|---------|----------------|
| `engine.sim` | `SimulationService` | Time scale, Pausing, Gravity. |
| `engine.viewport` | `ViewportService` | Wireframe, Textures, HUD visibility, Debug overlays. |
| `engine.env` | `EnvironmentControlService` | Time of day, Atmosphere, Weather, Lighting. |
| `engine.level` | `LevelManagerService` | Scene loading, Reset, Save/Load. |
| `engine.input` | `InputManagerService` | Control modes, Camera presets, Focus. |
| `engine.ops` | `EntityOpsService` | Delete, Duplicate, Rename, Physics Props. |
| `engine.interaction` | `InteractionService` | Raycasting events (advanced usage only). |
| `engine.transform` | `TransformLogicService` | Entity Positioning, Rotation, Scaling. |
| `engine.spawner` | `SpawnerService` | Spawning Logic, Placement Mode. |
| `engine.library` | `EntityLibraryService` | Access to Entity Templates. |
| `engine.combat` | `WeaponService` | **[NEW]** Weapon state, energy, cycling. |
| `engine.fracture` | `FractureService` | **[NEW]** Manual destruction triggering. |

## 2. State Accessors (Read-Only Signals)
Shortcuts on `engine` for common reactive state. These are direct Signal references.

| Signal | Type | Description |
|--------|------|-------------|
| `mode` | `'edit' \| 'walk' \| 'explore'` | Current input controller state. |
| `isPaused` | `boolean` | Physics simulation active state. |
| `loading` | `boolean` | Engine initialization status. |
| `objectCount` | `number` | Total entities in `World`. |
| `selectedEntity` | `Entity \| null` | Currently selected/inspected entity ID. |
| `gravityY` | `number` | Vertical gravity force (default -9.81). |
| `wireframe` | `boolean` | Global material wireframe override. |
| `texturesEnabled` | `boolean` | Global texture map state. |
| `transformMode` | `'translate' \| 'rotate' \| 'scale'` | Current gizmo operation mode. |
| `mainMenuVisible` | `boolean` | Main menu overlay visibility. |
| `showDebugOverlay` | `boolean` | Runtime invariant monitor visibility. |
| `debugInfo` | `DebugState` | Low-level physics loop stats. |
| `currentSceneId` | `string \| null` | ID of currently loaded scene preset. |
| `canUndo` / `canRedo` | `boolean` | History stack availability. |

## 3. Common Actions Cheatsheet

### Simulation
*   `engine.sim.togglePause()`
*   `engine.sim.setGravity(-9.81)`
*   `engine.sim.setTimeScale(0.5)`

### Viewport & Visuals
*   `engine.viewport.toggleWireframe()`
*   `engine.viewport.toggleTextures()`
*   `engine.viewport.toggleHud()`
*   `engine.viewport.setTransformMode('rotate')`

### Combat
*   `engine.combat.cycle()`
*   `engine.combat.trigger()`

### Entity Management
*   `engine.ops.deleteEntity(id)`
*   `engine.ops.duplicateEntity(id)`
*   `engine.ops.setEntityName(id, 'New Name')`
*   `engine.transform.setEntityTransform(id, pos, rot, scale)`
*   `engine.spawner.startPlacement('box')`
