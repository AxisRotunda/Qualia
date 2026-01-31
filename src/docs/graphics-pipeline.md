
# Graphics Pipeline
> **Scope**: Rendering, Assets, Materials, Lighting, Procedural Textures.
> **Source**: `src/services/scene.service.ts`, `src/engine/graphics/`

## 1. Scene Graph
*   **Renderer**: `THREE.WebGLRenderer` (Antialias: False on Mobile, True on Desktop).
*   **Color Space**: `SRGBColorSpace`.
*   **Tone Mapping**: `ACESFilmic`. Exposure: 1.0.
*   **Shadows**: `PCFSoftShadowMap`. High bias tuning for procedural terrain (-0.00002).

## 2. Service Architecture

### 2.1 SceneService (The Façade)
The **only** public service for graphics.
*   **API**: `addObject`, `removeObject`, `createEntityVisual`.
*   **Responsibility**: Coordinates the Environment Manager and Visuals Factory. Owns the Scene/Camera/Renderer.

### 2.2 Optimization: InstancedMeshService
Handles high-performance rendering for repeated geometry (e.g., Trees, Rocks).
*   **Class**: `InstancedGroup`.
*   **Mechanism**: Uses `THREE.InstancedMesh`.
*   **Proxy System**: 
    *   Maintains `ActiveInstance[]` array.
    *   Syncs `Matrix4` from Proxy Object to Instance Buffer.
    *   **Hidden State**: Sets matrix to Zero Matrix (Scale 0) to hide instances without buffer reallocation.
    *   **Max Instances**: 1024 per group.

### 2.3 VisualsFactoryService
Handles the creation and disposal of visual objects.
*   **Decision**: Checks `VisualContext` tags. If `instanced` or `nature`, delegates to `InstancedMeshService`.
*   **Standard**: Creates `new THREE.Mesh` for unique objects.

## 3. Texture Pipeline
Designed to prevent main-thread jank during procedural generation.

### 3.1 TextureWorkerService
*   **Tech**: Inline `Worker` via Blob URL (`texture-worker.const.ts`).
*   **Role**: Generates `ImageBitmap` off-thread.
*   **Generators**: `noise`, `bark`, `rock-detail`, `concrete-base`.
*   **PBR Generation**:
    *   **Normal Map**: Sobel Filter applied to generated height map within worker.
    *   See `math-algorithms.md` for Sobel kernel details.

### 3.2 MaterialService
*   **Registry**: `Map<string, Material>`.
*   **Custom Shaders**:
    *   `registerCustomMaterials` injects shader code via `onBeforeCompile`.
    *   **Water**: Vertex displacement shader driven by `uTime`. See `math-algorithms.md`.

## 4. Asset Generation (`AssetService`)
*   **Role**: Pure Data Registry. Returns `BufferGeometry` and `MaterialConfigs`.
*   **CSG**: Heavy use of `BufferGeometryUtils.mergeGeometries`.
*   **Generators**: `Nature`, `Architecture`, `Interior`, `SciFi`.
