
# Engine API Reference

> **Scope**: Public Facade methods of `EngineService`.
> **Audience**: UI Component Developers / AI Agents generating UI code.
> **Version**: 0.5.0

## 1. State Accessors (Read-Only Signals)
Access via `engine.[signalName]()`.

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
| `canUndo` / `canRedo` | `boolean` | History stack availability (Stubbed). |

## 2. Actions

### 2.1 Entity Management
- `spawnFromTemplate(id: string)`: Raycasts to ground/scene and spawns entity from `EntityLibrary`.
- `startPlacement(id: string)`: Enters visual placement mode (ghosting).
- `spawnBox() / spawnSphere()`: Shortcuts for basic props.
- `duplicateEntity(e: Entity)`: Clones physics body, mesh, and transforms.
- `deleteEntity(e: Entity)`: Destroys ECS entity, cleans up Physics/Three.js resources.
- `getEntityName(e: Entity): string`: Retreives UI label.
- `setEntityName(e: Entity, name: string)`: Updates UI label.
- `focusSelectedEntity()`: Moves camera to target entity position.
- `transformSelectedEntity(dPos, dRot, dScale)`: Manual transform application (for Joysticks).

### 2.2 Simulation Control
- `init(canvas)`: Bootstraps engine.
- `reset()`: Destroys all entities, resets physics world and camera.
- `togglePause()` / `setPaused(v: boolean)`: Controls physics stepping.
- `setGravity(y: number)`: Updates world gravity.
- `setMode(mode)`: Switches Input Controller.
- `applyBuoyancy(level, time)`: Runs buoyancy system update.

### 2.3 Visuals & Environment
- `toggleWireframe()`: Toggles mesh wireframe.
- `toggleTextures()`: Toggles procedural textures/performance mode.
- `setPerformanceMode(bool)`: Macro for texture toggling.
- `setTransformMode(mode)`: Updates Gizmo behavior.
- `setCameraPreset(preset)`: Moves camera to 'top', 'front', or 'side'.
- `setLightSettings(settings)`: Updates Ambient/Directional light intensity and color.
- `setAtmosphere(preset)`: Sets Fog/Skybox/Lighting theme.
- `setWeather(type)`: Sets Particle System (Snow/Rain).
- `setTimeOfDay(hour)`: Rotates Sun light.

### 2.4 Persistence
- `loadScene(id: string)`: Loads a full scene definition from `SceneRegistry`.
- `quickSave()`: Serializes World state to LocalStorage.
- `quickLoad()`: Deserializes World state from LocalStorage.
- `hasSavedState()`: Boolean check for save existence.
- `getQuickSaveLabel()`: Metadata string for save file.
