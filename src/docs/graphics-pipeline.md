
# Graphics Pipeline
> **Scope**: Rendering, Assets, Materials, Lighting.
> **Source**: `src/services/scene.service.ts`, `src/engine/graphics/`

## 1. Scene Graph
*   **Renderer**: `THREE.WebGLRenderer` with `antialias: true`, `PCFSoftShadowMap`.
*   **Camera**: `PerspectiveCamera` (FOV 60).
*   **Root Objects**:
    *   `GridHelper` (Visual reference).
    *   `PlaneGeometry` (Ground receiver).
    *   `TransformControls` (Gizmo).
    *   `BoxHelper` (Selection highlight).

## 2. Service Architecture
The rendering domain uses a strict Facade pattern.

### 2.1 SceneService (The Façade)
The **only** public service for graphics.
*   **API**: `createEntityVisual`, `removeEntityVisual`, `setAtmosphere`, `setLightSettings`.
*   **Responsibility**: Coordinates the Environment Manager and Visuals Factory. Owns the Scene/Camera/Renderer.

### 2.2 EnvironmentManagerService (Internal)
Managed by `SceneService`. Handles the "world atmosphere".
*   **Lights**: Ambient and Directional (Sun).
*   **Atmosphere**: Fog settings and Background color.

### 2.3 VisualsFactoryService (Internal)
Managed by `SceneService`. Handles the creation and disposal of `THREE.Mesh` instances.
*   **Primitives**: Box, Sphere, Cylinder geometry management.
*   **Assets**: Bridges to `AssetService` for complex procedural geometry.
*   **Lifecycle**: Auto-disposes geometries when entities are removed to prevent memory leaks.

## 3. Material System
Service: `MaterialService`.
Uses a Registry pattern to manage `MeshStandardMaterial` instances.

### 3.1 Procedural Textures
Generated via HTML5 Canvas API in memory (`CanvasTexture`).
*   **State**: Toggled via `setTexturesEnabled(boolean)`.

## 4. Asset Generation
Service: `AssetService`.
Generates procedural geometry for non-primitive objects (Trees, Rocks, Ice).
