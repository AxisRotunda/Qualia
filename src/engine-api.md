# Engine API Reference

> **Scope**: Public Facade methods of `EngineService`.
> **Audience**: UI Component Developers / AI Agents generating UI code.
> **Version**: 0.2.1

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
- `spawnBox() / spawnSphere()`: Shortcuts for basic props.
- `duplicateEntity(e: Entity)`: Clones physics body, mesh, and transforms of target.
- `deleteEntity(e: Entity)`: Destroys ECS entity, cleans up Physics/Three.js resources.
- `getEntityName(e: Entity): string`: Retreives UI label.
- `setEntityName(e: Entity, name: string)`: Updates UI label.
- `focusSelectedEntity()`: Moves camera to target entity position.

### 2.2 Simulation Control
- `init(canvas)`: Bootstraps engine (called by Layout).
- `reset()`: Destroys all entities, resets physics world and camera.
- `togglePause()` / `setPaused(v: boolean)`: Controls physics stepping.
- `setGravity(y: number)`: Updates world gravity.
- `setMode(mode)`: Switches Input Controller (Orbit vs Fly vs Character).

### 2.3 Visuals & Environment
- `toggleWireframe()`: Toggles mesh wireframe mode.
- `toggleTextures()`: Toggles procedural textures.
- `setTransformMode(mode)`: Updates Gizmo behavior.
- `setDebugOverlayVisible(v)`: Toggles debug UI.
- `setCameraPreset(preset)`: Moves camera to 'top', 'front', or 'side'.
- `setLightSettings(settings)`: Updates Ambient/Directional light intensity and color.
- `updateEntityPhysics(e, props)`: Updates Friction/Restitution on runtime body.

### 2.4 Persistence
- `loadScene(id: string)`: Loads a full scene definition from `SceneRegistry`.
- `quickSave()`: Serializes World state to LocalStorage.
- `quickLoad()`: Deserializes World state from LocalStorage.
- `hasSavedState()`: Boolean check for save existence.
- `getQuickSaveLabel()`: Metadata string for save file.

## 3. ECS Direct Access (Advanced)
Direct access to `engine.world` (Class: `World`) is permitted for complex logic but discouraged for UI.

```typescript
// Read
const pos = engine.world.transforms.get(entityId)?.position;

// Write (Prefer EngineService methods for syncing)
// Direct writes to transform components will be overwritten by Physics
// unless handled inside the sync loop or if object is kinematic/fixed.
```