# Engine API Reference

> **Scope**: Public Facade methods of `EngineService`.
> **Audience**: UI Component Developers / AI Agents generating UI code.
> **Version**: 1.0.0 (Hardened)

## 1. Feature Modules (Service Access)
The `EngineService` exposes specific feature services as public properties.

| Property | Service | Responsibility |
|----------|---------|----------------|
| `engine.sim` | `SimulationService` | Time scale, Pausing, Gravity. |
| `engine.viewport` | `ViewportService` | Wireframe, Textures, HUD visibility, Debug overlays, View modes (FP/TP). |
| `engine.env` | `EnvironmentControlService` | Time of day, Atmosphere presets, Weather, Lighting. |
| `engine.level` | `LevelManagerService` | Scene loading, Hard Reset, Quick Save/Load. |
| `engine.input` | `InputManagerService` | Control modes (Edit/Walk/Fly), Camera presets, Selection focus. |
| `engine.ops` | `EntityOpsService` | Delete, Duplicate, Rename, Physics Props, Locking/Visibility. |
| `engine.interaction` | `InteractionService` | Raycasting results, Selection events, Context menu triggers. |
| `engine.transform` | `TransformLogicService` | Core Entity Positioning, Rotation, Scaling (Immediate & Interpolated). |
| `engine.spawner` | `SpawnerService` | Spawning Logic, Placement Ghosting Mode. |
| `engine.library` | `EntityLibraryService` | Access to Entity Templates and Category metadata. |
| `engine.anim` | `AnimationControlService` | Cross-fading entity animation clips, time-scaling mixers. |
| `engine.terrain` | `TerrainManagerService` | Procedural grid generation, Heightfield physics registration. |
| `engine.combat` | `WeaponService` | Weapon state, Energy management, Firing triggers, ViewModel sway. |
| `engine.fracture` | `FractureService` | Manual destruction and kinetic shard triggering. |

## 2. State Accessors (Read-Only Signals)
Shortcuts on `engine` for reactive UI state.

| Signal | Type | Description |
|--------|------|-------------|
| `mode` | `'edit' \| 'walk' \| 'explore'` | Current input controller state. |
| `loading` | `boolean` | Engine initialization or scene transition status. |
| `isPaused` | `boolean` | Physics simulation active state. |
| `fps` | `number` | Real-time frames per second. |
| `physicsTime` | `number` | Last physics step execution time (ms). |
| `renderTime` | `number` | Last frame render time (ms). |
| `objectCount` | `number` | Total entities in the World. |
| `selectedEntity` | `Entity \| null` | Currently inspected entity ID. |
| `gravityY` | `number` | Vertical gravity force (default -9.81). |
| `timeScale` | `number` | Temporal dilation factor (Bullet time). |
| `wireframe` | `boolean` | Global material wireframe override status. |
| `texturesEnabled` | `boolean` | Global PBR texture map state. |
| `transformMode` | `'translate' \| 'rotate' \| 'scale'` | Current mobile/gizmo operation mode. |
| `currentSceneId` | `string \| null` | ID of the currently loaded scene preset. |
| `mainMenuVisible` | `boolean` | Main menu overlay visibility. |
| `hudVisible` | `boolean` | HUD chrome visibility. |
| `showDebugOverlay` | `boolean` | Runtime telemetry monitor visibility. |
| `showPhysicsDebug` | `boolean` | Visual collider wireframe visibility. |
| `canUndo` / `canRedo` | `boolean` | Command history availability. |
| `weather` | `WeatherType` | Current active particle system (rain, snow, ash). |
| `timeOfDay` | `number` | 24-hour orbital cycle position. |
| `atmosphere` | `string` | Current biome atmosphere preset ID. |
| `playerSpeed` | `number` | Locomotion magnitude for the HUD. |
| `isAiming` | `boolean` | Focus/ADS state. |
| `hitMarkerActive` | `boolean` | Recent impact confirmation flag. |

## 3. Core Common Actions

### Simulation & Viewport
*   `engine.sim.togglePause()`
*   `engine.sim.setGravity(-9.81)`
*   `engine.viewport.toggleHud()`
*   `engine.viewport.toggleViewMode()` // Toggle FP vs TP

### Interaction & Spawning
*   `engine.spawner.startPlacement('template_id')`
*   `engine.input.focusSelectedEntity()` // Snap camera to selection
*   `engine.ops.deleteEntity(id)`
*   `engine.ops.toggleLock(id)`

### Combat & Action
*   `engine.combat.cycle()` // Switch weapons
*   `engine.combat.trigger()` // Fire active weapon
*   `engine.anim.play(id, 'action_name')`