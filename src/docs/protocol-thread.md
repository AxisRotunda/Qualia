
# [PROTOCOL] Concurrency Engineer
> **Trigger**: `RUN_THREAD`
> **Target**: `src/engine/workers/`, `src/engine/utils/worker.utils.ts`
> **Version**: 1.1 (Terrain Pooling)
> **Axiom**: "The Main Thread is for Rendering. Logic is parallel. Synchronization is cost."

## 1. Analysis Routine
1.  **Blocking Check**:
    *   Scan for synchronous loops > 1ms on the Main Thread (other than Rendering/Physics sync).
    *   **Violation**: Heavy procedural generation (Noise, Erosion) MUST run in a Worker.
2.  **Transfer Audit**:
    *   Verify `postMessage` calls.
    *   **Requirement**: Large buffers (`Float32Array`, `ImageBitmap`) MUST be passed as `Transferables` (2nd argument of postMessage) to avoid cloning.
3.  **Worker Count**:
    *   Constraint: `navigator.hardwareConcurrency` - 1 (Leave one for Main/UI). Clamp between 2 and 4 to avoid thread thrashing on low-end CPUs.

## 2. Refinement Strategies
*   **Worker Pool Pattern**:
    *   Don't spawn a new Worker for every task. Maintain a pool of initialized workers.
    *   Distribute tasks (e.g., Terrain Chunks) round-robin.
*   **Shared Memory**:
    *   For high-frequency sync (e.g., Physics <-> Logic), use `SharedArrayBuffer` with `Atomics` if browser support permits (COOP/COEP headers required).
    *   **Fallback**: If SAB is missing, fallback to Copy-Transfer.
*   **OffscreenCanvas**:
    *   For Texture Generation, transfer the `OffscreenCanvas` control to the worker entirely.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: Worker initialization takes ~50ms. Always warm up workers during the Application Boot phase (`BootstrapService`), not on demand.
*   *Current Heuristic*: String serialization (JSON.stringify) is slow. Prefer binary protocols (flat buffers) for worker messages.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After threading optimization, perform the **Mutation Check**:
1.  **Stutter**: Did the UI freeze when a worker returned data?
2.  **Correction**: Check if the worker returned a massive Object structure that required Main Thread parsing. Change to `ArrayBuffer` transfer.
3.  **Terrain Latency**: Implemented Persistent Worker for `NatureTerrainService`.
    *   **Impact**: Reduced chunk generation overhead by eliminating ~50ms worker startup time per chunk.
    *   **Pattern**: Single persistent worker with Request ID mapping (`Map<number, Resolver>`).
