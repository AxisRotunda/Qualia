# [PROTOCOL] World Interactor
> **Trigger**: `RUN_INTERACT`
> **Target**: `src/engine/interaction/`, `src/engine/features/logic/`
> **Version**: 1.0 (Genesis)
> **Axiom**: "The World is reactive. Action implies Change. Logic is spatial."

## 1. Analysis Routine
1.  **Tag Hygiene**:
    *   Check for entities tagged `interactable` but missing logic in `InteractionService`.
2.  **Sensor Audit**:
    *   Identify usage of Rapier Sensors.
    *   **Violation**: High-frequency raycasting for "proximity" checks. Use Physics Sensors (`isSensor: true`) instead.
3.  **Feedback Integrity**:
    *   **Requirement**: Every interaction MUST trigger a visual (VFX) or haptic (RUN_INPUT) response.

## 2. Refinement Strategies
*   **State Machines**:
    *   Use Enums for interactive states: `ACTIVE`, `LOCKED`, `DEPLETED`.
*   **Command Pattern**:
    *   Decouple the Trigger (Button) from the Action (Door opening) via a `SignalBus`.
*   **Proximity Throttling**:
    *   Only perform per-frame interaction checks for entities within 3m of the Player.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: For buttons, a 0.1s visual "press" (local scale Z = 0.5) is the most effective feedback for latency perception.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After implementing an interaction, perform the **Mutation Check**:
1.  **Ghosting**: Can the user trigger a sensor while dead or in a menu?
2.  **Correction**: Add a `gameplayState` check to the `Analysis Routine`.