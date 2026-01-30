# Graphics Pipeline
> **Scope**: Rendering, Assets, Materials, Lighting, Procedural Textures.
> **Source**: `src/services/scene.service.ts`, `src/engine/graphics/`

## 1. Scene Graph
*   **Renderer**: `THREE.WebGLRenderer` with `antialias: true`, `PCFSoftShadowMap`, `ACESFilmicToneMapping`, `SRGBColorSpace`.
*   **Camera**: `PerspectiveCamera` (FOV 75).
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
*   **Lights**: Ambient, Hemisphere, Directional (Sun).
*   **Shadows**: High-res PCFSoft shadows (4096 map) on Directional light.
*   **Atmosphere**: Fog settings and Background color presets (`clear`, `night`, `blizzard`, etc).
*   **IBL**: `generateDefaultEnvironment` creates procedural `PMREMGenerator` env map for PBR.

### 2.3 VisualsFactoryService (Internal)
Managed by `SceneService`. Handles the creation and disposal of `THREE.Mesh` instances.
*   **Primitives**: Uses `primitiveCache` (`Map<string, BufferGeometry>`) to reuse geometries for Boxes, Spheres, etc., reducing memory overhead.
*   **Assets**: Bridges to `AssetService` for complex procedural geometry.
*   **Lifecycle**: Manages mesh instantiation from `PhysicsBodyDef`.

### 2.4 GizmoManagerService
Handles `TransformControls` (Translate/Rotate/Scale).
*   **State**: `isDraggingGizmo` signal (consumed by `InteractionService` to block raycasts).
*   **Snap**: Configurable grid snapping via `setConfig`.

### 2.5 SelectionVisualsFactory
Generates the Cyberpunk-style selection bracket.
*   **Components**: Corner brackets (LineSegments), Volume fill (Transparent Mesh), Edge outline.
*   **Lifecycle**: Disposed/Recreated on selection change.

## 3. Material System (`MaterialService`)
Uses a Registry pattern (`Map<string, Material>`).
*   **Texture Context**: `TextureContextService` provides shared Canvas 2D contexts for generation.
*   **Procedural Gen**: `TextureGeneratorService` creates maps (Normal, Diffuse, Emissive) on the fly.
    *   **Noise**: Per-pixel operations.
    *   **Patterns**: Grid, Brick, Marble (Canvas paths).
    *   **Tech**: Text rendering for screens.
*   **Optimization**: Textures are lazy-loaded only when `texturesEnabled` is true.

## 4. Asset Generation (`AssetService`)
*   **CSG**: Heavy use of `BufferGeometryUtils.mergeGeometries`.
*   **Generators**: `Nature`, `Architecture`, `Interior`, `SciFi` sub-services.
*   **Optimization**: Caches generated `BufferGeometry` by ID.