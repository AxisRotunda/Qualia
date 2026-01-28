# Graphics Pipeline
> **Scope**: Rendering, Assets, Materials, Lighting.
> **Source**: `src/services/scene.service.ts`, `src/services/material.service.ts`, `src/services/asset.service.ts`

## 1. Scene Graph
*   **Renderer**: `THREE.WebGLRenderer` with `antialias: true`, `PCFSoftShadowMap`.
*   **Camera**: `PerspectiveCamera` (FOV 60).
*   **Root Objects**:
    *   `GridHelper` (Visual reference).
    *   `PlaneGeometry` (Ground receiver).
    *   `TransformControls` (Gizmo).
    *   `BoxHelper` (Selection highlight).

## 2. Material System
Service: `MaterialService`.
Uses a Registry pattern to manage `MeshStandardMaterial` instances.

### 2.1 Procedural Textures
Generated via HTML5 Canvas API in memory (`CanvasTexture`).
*   **Algorithm**: Per-pixel noise generation on 512x512 canvas.
*   **Types**: Concrete, Ground, Bark, Leaf, Rock, Snow.
*   **State**: Toggled via `setTexturesEnabled(boolean)`. Swaps `map` property on materials.

### 2.2 Wireframe Override
Global toggle `setWireframeForAll(boolean)`. Iterates registry and sets `.wireframe`.

## 3. Asset Generation
Service: `AssetService`.
Generates procedural geometry for non-primitive objects.

### 3.1 Tree (`tree-01`)
*   **Trunk**: `CylinderGeometry`.
*   **Foliage**: Merged `IcosahedronGeometry` (Low Poly).
*   **Composition**: `BufferGeometryUtils.mergeGeometries` with Groups.
*   **Materials**: Array Material (Index 0: Bark, Index 1: Leaf).

### 3.2 Rock (`rock-01`)
*   **Base**: `DodecahedronGeometry`.
*   **Modification**: Vertex perturbation (random noise applied to positions).
*   **Shading**: Flat (`toNonIndexed`, normals computed per face).

## 4. Environment & Atmosphere
Service: `EnvironmentService`.
Presets control Lighting and Fog.

| Preset | Fog Type | Background | Light Color |
|--------|----------|------------|-------------|
| `clear` | Linear | Dark Blue | White |
| `fog` | Exp2 | Dark Purple | White |
| `night` | Exp2 | Black | Blue-ish |
| `forest` | Exp2 | Dark Green | Warm White |
| `ice` | Linear | Light Blue | Cool White |

## 5. Particle System
Service: `ParticleService`.
*   **Implementation**: `THREE.Points` with `BufferGeometry`.
*   **Simulation**: CPU-based position update in `update(dt)`.
*   **Behavior**: Simple gravity fall + reset at bounds (Snow/Dust effect).