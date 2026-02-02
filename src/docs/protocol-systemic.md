# [PROTOCOL] Systemic Simulation
> **Trigger**: `RUN_SYSTEMIC`
> **Target**: `src/engine/ecs/`, `src/engine/systems/systemic.system.ts`
> **Version**: 1.0 (Genesis)
> **Axiom**: "Entities are connected. Properties flow. The whole is greater than the parts."

## 1. Analysis Routine
1.  **Connectivity Check**:
    *   Scan for entities with a `SystemicNode` component.
    *   **Violation**: Disconnected nodes that should be part of a network (e.g., adjacent power cables).
2.  **Propagation Audit**:
    *   Verify per-frame diffusion of values (Heat, Power, Signal).
    *   **Requirement**: Propagation must be `dt` scaled to prevent frame-rate dependency.

## 2. Refinement Strategies
*   **The Diffusion Pattern**:
    *   `Value[t+1] = Value[t] + (NeighborAvg - Value[t]) * diffusionRate * dt`.
*   **Attribute Components**:
    *   Add `temperature`, `voltage`, or `stability` to `World` schema.
*   **Visual Feedback**:
    *   Map systemic values to material properties. (e.g., `emissiveIntensity = voltage * 2.0`).

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: Using the `SpatialGrid` is 5x faster for systemic propagation than raycasting between nodes.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After implementing a system (e.g. Electricity), perform the **Mutation Check**:
1.  **Oscillation**: Did values bounce wildly?
2.  **Correction**: Implement a damping factor in the diffusion formula.