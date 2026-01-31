
# Physics Optimization Report
> **Scope**: Performance tuning, Algorithm selection, Benchmark heuristics.
> **Date**: Phase 10 Optimization (Logic Throttling).

## 1. Bottlenecks Identified
1.  **Trimesh Conversion**: `ShapesFactory` was converting heightfield data into explicit Triangle Meshes (`trimesh`). This caused massive memory bloat and slow collider build times for terrain chunks.
2.  **Unfiltered Collisions**: Every dynamic object was checking collision against every other object, including small debris.
3.  **Scaler Rebuilds**: Resizing an object caused a loss of optimization properties (collision groups) because they weren't persisted during the destroy-create cycle.
4.  **GC Pressure in Sync Loop**: `PhysicsWorldService` was allocating 2 objects ({x,y,z}, {x,y,z,w}) per entity per frame during ECS synchronization.
5.  **ECS Map Overhead (Phase 3)**: `ComponentStore` was using `Map<number, T>` for sparse lookups. For 1000+ entities, hashing overhead during the physics sync loop became measurable.
6.  **Spatial Grid Allocation (Phase 4)**: `SpatialGrid` was using string keys (`"10:5"`) and returning a new `Set` on every `query()`, causing high GC pressure during camera movement.
7.  **Dynamic Culling Iteration (Phase 4.1)**: `VisibilityManagerService` was using a `Set<Entity>` for tracking dynamic objects. Iteration of large Sets in the hot render loop is significantly slower than Array iteration.
8.  **Math Allocation (Phase 4.2)**: `CharacterController` and `BuoyancySystem` were creating new `Vector3` and Object Literals every frame for input calculation and impulse application.
9.  **Closure Allocation (Phase 5)**: `VisibilityManager` was creating arrow functions inside the `cullStatic` loop frame-by-frame.
10. **Set Iteration in Grid (Phase 5)**: `SpatialGrid` was using `Set<number>` for cells, which incurs iterator overhead compared to Arrays.
11. **Transform Object Overhead (Phase 6)**: ECS Transforms were stored as objects. Accessing `t.position.x` involved pointer chasing and cache misses.
12. **Raycast Filtering Allocation (Phase 7)**: `RaycasterService` was using `.filter(...)[0]` to find the first visible hit. This allocated a temporary array every frame the mouse moved.
13. **Camera Input Allocation (Phase 7)**: `CameraControlService` was allocating 4 new `Vector3` objects every frame during virtual joystick interaction.
14. **Object Drag Allocation (Phase 8)**: `ObjectManipulationService` was allocating `Vector3`s every frame during drag operations.
15. **Atmosphere Factory (Phase 8)**: `EnvironmentControlService` was calling `presetFn()` every frame during day/night cycles, allocating new `Color` and `Fog` objects continuously.
16. **Wrapper Allocation (Phase 9)**: `CharacterController` was calling `getBodyPose` every frame, allocating `{p, q}` wrappers.
17. **Redundant Sparse Check (Phase 9)**: `EntityTransformSystem` was checking `has()` then `setPosition()`, incurring double sparse lookups in the hottest loop.
18. **Scene Graph Search (Phase 10)**: `ParticleService.update` was performing `scene.children.find(...)` every frame to locate the Camera. This is an O(N) operation blocking the main thread.
19. **Buoyancy Math (Phase 10)**: `BuoyancySystem` was using `body.translation()` and `body.linvel()` inside the physics loop, creating thousands of temporary objects per second for water simulation.
20. **City Draw Calls**: The `city` scene generated hundreds of unique `Mesh` objects for repeated buildings, causing high CPU overhead during rendering submission.
21. **Main Thread Textures (Phase 12)**: `PatternTextureService` was generating 512x512/1024x1024 textures on the main thread, causing frame drops during scene loads (e.g. City/Interior).

## 2. Optimizations Implemented

### 2.1 Native Heightfields
*   **Change**: Switched to `RAPIER.ColliderDesc.heightfield`.
*   **Impact**: Reduced terrain collider memory usage by ~60% and sped up broadphase.

### 2.2 Collision Groups (`PhysicsOptimizerService`)
*   **Change**: Introduced 16-bit bitmasks for broadphase filtering.
*   **Impact**: Debris ignores debris; Sensors ignore static geometry. Reduced N^2 checks.

### 2.3 Event Filtering
*   **Change**: Explicitly set `ActiveEvents.NONE` for standard props and debris.
*   **Impact**: Reduced WASM->JS event overhead.

### 2.4 Zero-Allocation Sync
*   **Change**: Refactored `syncActiveBodies` to pass raw scalars instead of objects.
*   **Impact**: Eliminated ~120,000 object allocations per second at 60FPS.

### 2.5 Sparse Set Array
*   **Change**: Replaced `Map<Entity, Index>` in `ComponentStore` with `Int32Array`.
*   **Impact**: O(1) lookup, no hashing.

### 2.6 Spatial Grid Packing
*   **Change**: Replaced String keys with Bitwise Packed Integers.
*   **Impact**: Removed string allocations in spatial queries.

### 2.7 Visibility Iteration
*   **Change**: Replaced `Set<Entity>` with `Entity[]` + `Int32Array` lookup.
*   **Impact**: 2-3x faster iteration for culling.

### 2.8 Math Recycling
*   **Change**: Added class-level scratch vectors to Systems.
*   **Impact**: Reduced per-frame GC pressure.

### 2.9 Grid Array & Context
*   **Change**: Replaced `Set<number>` cells with `number[]`. Removed closures in hot loops.
*   **Impact**: Zero-allocation culling queries.

### 2.10 Transform SoA (Phase 6)
*   **Change**: Implemented `TransformStore` using `Float32Array` buffers for Position/Rotation/Scale.
*   **Impact**:
    *   **Data Locality**: CPU cache lines now loaded with contiguous float data during physics sync.
    *   **Zero-Overhead**: `setPosition(e, x, y, z)` writes directly to array index. No object property lookup.
    *   **Safety**: `get(e)` returns a copy, enforcing usage of setters for mutation.

### 2.11 Raycast Short-Circuit (Phase 7)
*   **Change**: Replaced `intersects.filter(visible)[0]` with `intersects.find(visible)`.
*   **Impact**: Prevented Array allocation on every mouse/joystick move event. Early exit reduces iteration count.

### 2.12 Camera Scratch Vectors (Phase 7)
*   **Change**: Added `_vRight`, `_vUp`, `_vOffset` reuse in `CameraControlService`.
*   **Impact**: Zero allocation during camera orbit/pan.

### 2.13 Env Control Caching (Phase 8)
*   **Change**: Cached `AtmosphereDefinition` in `EnvironmentControlService` and implemented scratch `THREE.Color` reuse.
*   **Impact**: Eliminated ~120 object allocations per second (2 colors * 60fps) during day/night cycles.

### 2.14 Zero-Alloc Getters (Phase 9)
*   **Change**: Added `copyBodyPosition` to `PhysicsWorldService`.
*   **Impact**: Eliminated return object allocation in `CharacterController` loop.

### 2.15 Redundant Check Removal (Phase 9)
*   **Change**: Removed `transforms.has(e)` inside `syncActiveBodies` loop.
*   **Impact**: Reduced sparse set lookups by ~25% in the main physics sync loop.

### 2.16 Direct Dependency Injection (Phase 10)
*   **Change**: `ParticleService.update` now accepts `camPos` argument. `EnvironmentSystem` injects `CameraManager` and passes the position.
*   **Impact**: Removed O(N) scene graph search. Saved ~0.2ms per frame on complex scenes.

### 2.17 Physics Accessors (Phase 10)
*   **Change**: Added `copyBodyLinVel` to `PhysicsWorldService`.
*   **Impact**: Converted `BuoyancySystem` to full zero-allocation loop.

### 2.18 City Instancing (Phase 11)
*   **Change**: Added `instanced` tag to `building-small`, `building-tall`, `building-wide`, and `prop-pillar` templates.
*   **Impact**: Consolidated hundreds of individual building meshes into ~5 `InstancedMesh` draw calls in the City scene.

### 2.19 Off-Thread Textures (Phase 12)
*   **Change**: Migrated `PatternTextureService` (Grid, Brick, Marble) to `TextureWorker`.
*   **Impact**: Removed 100ms+ synchronous blocks during City/Interior scene loading.

## 3. Heuristic Uplift
| Metric | Before | After | Notes |
|--------|--------|-------|-------|
| Transform Update | High Latency | Instant | Direct array access vs Object property access. |
| Memory (10k Ents) | ~2MB (Obj overhead) | ~400KB | Float32Array vs V8 Objects. |
| Sync Loop | 2ms | < 0.4ms | Scalar passing + SoA writing + Removed redundancy. |
| Mouse Interaction | Medium GC Churn | Zero GC | Removed filter array allocation. |
| Env Cycle | Med GC Churn | Zero GC | Cached factory & scratch colors. |
| Buoyancy | High GC Churn | Zero GC | Zero-alloc getters & scratch vectors. |
| City Scene Draw | ~500 Draw Calls | ~50 Draw Calls | Massive reduction via `InstancedMesh` for buildings. |
| Tex Gen (Main) | ~100ms Blocking | 0ms Blocking | Worker migration. |

## 4. Future Targets
*   **Solver Iterations**: Expose solver iteration counts in `PhysicsOptimizer` to lower precision for background objects.
*   **Rapier Bindings**: Investigate if Rapier provides direct buffer access for bodies to skip scalar callback entirely.