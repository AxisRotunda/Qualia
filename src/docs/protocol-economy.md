
# [PROTOCOL] Economy (Resource Flow)
> **Trigger**: `RUN_ECONOMY`
> **Target**: `src/engine/features/economy/`, `src/engine/ecs/inventory-store.ts`
> **Version**: 1.0 (Genesis)
> **Axiom**: "Scarcity creates Value. Flow must balance. Inputs = Outputs."

## 1. Analysis Routine
1.  **Faucet/Sink Audit**:
    *   Map all sources (Spawners) and sinks (Crafting/Destruction) of resources.
    *   **Constraint**: In a closed system, `Total Resources` should remain constant or grow linearly, never exponentially.
2.  **Inventory Schema Check**:
    *   **Grep**: `items: any[]`.
    *   **Violation**: Inventories must use a strictly typed `Slot` interface `{ id: string, count: number, meta?: object }`.
    *   **Storage**: Use ECS `InventoryStore` (SoA) for efficiency if many entities carry items.
3.  **Interaction Binding**:
    *   Verify `RUN_INTERACT` hooks exist for `Pickup` and `Drop` actions.

## 2. Refinement Strategies
*   **Resource Physicality**:
    *   Dropped items must have physical representation (`prop-crate` or specific mesh).
    *   Use `Magnetic Pickup` logic: Items fly toward player when within range `r`.
*   **Crafting Graph**:
    *   Define recipes as DAGs (Directed Acyclic Graphs).
    *   Validate recipes for loops (A -> B -> A) which break economy.
*   **Loot Tables**:
    *   Use `Weighted Random` lists for drops.
    *   Implement "Pity Timer": Increase weight of rare items on failed rolls.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: Visual feedback for resource gain (+1 Metal) should stack vertically in World Space to prevent UI clutter.
*   *Current Heuristic*: Inventory limits (Slots vs Weight) drastically change gameplay pace. For "Sandbox", prefer Slots. For "Survival", prefer Weight.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After implementing economy features, perform the **Mutation Check**:
1.  **Hoarding**: Did the player accumulate > 1000 items?
2.  **Correction**: Implement `StackLimit` or `ItemDegradation` to force consumption.
