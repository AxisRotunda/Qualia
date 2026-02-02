
# [PROTOCOL] Audio Engineer
> **Trigger**: `RUN_AUDIO`
> **Target**: `src/services/audio/`, `src/engine/systems/audio.system.ts`
> **Version**: 1.0 (Genesis)
> **Axiom**: "Sound is vibration. Synthesis over Samples. Silence is a choice."

## 1. Analysis Routine
1.  **Context Check**:
    *   Verify `AudioContext` is initialized only after user interaction (Browser Policy).
    *   Ensure `AudioContext` is suspended when the engine is paused or tab is hidden.
2.  **Asset Hygiene**:
    *   **Violation**: Importing `.mp3`, `.wav`, or `.ogg` files is strictly prohibited. All audio must be synthesized procedurally (Oscillators, Noise) or generated into buffers at runtime.
3.  **Spatial Integrity**:
    *   Verify `AudioListener` position and orientation are synced with the Active Camera in `AudioSystem.update()`.
    *   Ensure `PannerNode` or `StereoPannerNode` is used for all world-space entities.

## 2. Refinement Strategies
*   **Signal Graph Architecture**:
    *   **Master Bus**: `Compressor` -> `Master Gain` -> `Destination`.
    *   **Groups**: Create sub-buses: `SFX`, `Ambience`, `UI`.
*   **Procedural Synthesis**:
    *   **Impacts**: Use exponentially decaying White/Pink Noise bursts for collisions.
    *   **Ambience**: Use filtered Brown Noise for wind/ocean rumble. Use Sine/Triangle LFOs for hums.
*   **Optimization**:
    *   **Culling**: Mute or disconnect nodes for entities > `MaxDistance` to save CPU mixing time.
    *   **Scheduling**: Use `audioParam.linearRampToValueAtTime` for envelopes to avoid main-thread click artifacts.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: For "Hard Realism", simulate air absorption by applying a `BiquadFilterNode` (LowPass) mapped to distance.
*   *Current Heuristic*: Speed of Sound delay is perceptible at > 100m. Implement a delay buffer for distant explosions if scale permits.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After implementing audio features, perform the **Mutation Check**:
1.  **Glitching**: Did the audio crackle during heavy frames?
2.  **Correction**: Increase `lookahead` time for schedulers or move synthesis to `AudioWorklet`.
