
# Graphics Pipeline
> **Scope**: Rendering, Assets, Materials, Lighting.
> **Source**: `src/services/scene.service.ts`, `src/services/material.service.ts`, `src/services/asset.service.ts`, `src/engine/graphics/`

## 1. Scene Graph
*   **Renderer**: `THREE.WebGLRenderer` with `antialias: true`, `PCFSoftShadowMap`.
*   **Camera**: `PerspectiveCamera` (FOV 60).
*   **Root Objects**:
    *   `GridHelper` (Visual reference).
    *   `PlaneGeometry` (Ground receiver).
    *   `TransformControls` (Gizmo).
    *   `BoxHelper` (Selection highlight).

## 2. Service Architecture
The rendering domain is split into focused services:

### 2.1 SceneService (Coordinator)
The main entry point. Initializes the Renderer/Camera/Scene but delegates specific tasks.
*   **Responsibility**: Lifecycle, Render Loop, Gizmo management.

### 2.2 EnvironmentManagerService
Handles the "world atmosphere".
*   **Lights**: Ambient and Directional (Sun).
*   **Atmosphere**: Fog settings and Background color.
*   **Presets**: Clear, Fog, Night, Forest, Ice.

### 2.3 VisualsFactoryService
Handles the creation and disposal of `THREE.Mesh` instances.
*   **Primitives**: Box, Sphere, Cylinder geometry management.
*   **Assets**: Bridges to `AssetService` for complex procedural geometry.
*   **Disposal**: Tracks geometries created by primitives for cleanup.

## 3. Material System
Service: `MaterialService`.
Uses a Registry pattern to manage `MeshStandardMaterial` instances.

### 3.1 Procedural Textures
Generated via HTML5 Canvas API in memory (`CanvasTexture`).
*   **Algorithm**: Per-pixel noise generation on 512x512 canvas.
*   **Types**: Concrete, Ground, Bark, Leaf, Rock, Snow.
*   **State**: Toggled via `setTexturesEnabled(boolean)`. Swaps `map` property on materials.

### 3.2 Wireframe Override
Global toggle `setWireframeForAll(boolean)`. Iterates registry and sets `.wireframe`.

## 4. Asset Generation
Service: `AssetService`.
Generates procedural geometry for non-primitive objects.

### 4.1 Tree (`tree-01`)
*   **Trunk**: `CylinderGeometry`.
*   **Foliage**: Merged `IcosahedronGeometry` (Low Poly).
*   **Composition**: `BufferGeometryUtils.mergeGeometries` with Groups.
*   **Materials**: Array Material (Index 0: Bark, Index 1: Leaf).

### 4.2 Rock (`rock-01`)
*   **Base**: `DodecahedronGeometry`.
*   **Modification**: Vertex perturbation (random noise applied to positions).
*   **Shading**: Flat (`toNonIndexed`, normals computed per face).

## 5. Particle System
Service: `ParticleService`.
*   **Implementation**: `THREE.Points` with `BufferGeometry`.
*   **Simulation**: CPU-based position update in `update(dt)`.
*   **Behavior**: Simple gravity fall + reset at bounds (Snow/Dust effect).
