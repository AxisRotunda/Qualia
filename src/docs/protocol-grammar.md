
# [PROTOCOL] Structural Grammar
> **Trigger**: `RUN_GRAMMAR`
> **Target**: `src/engine/algorithms/grammar/`, `src/services/generators/`
> **Version**: 1.1 (Shape Subdivision Update)
> **Axiom**: "Rules define Form. Recursion creates Complexity. Constraints create Style."

## 1. Analysis Routine
1.  **Pattern Repetition Scan**:
    *   Identify "Grid" loops in `src/content/scenes/` that perform random placement.
    *   **Opportunity**: If placement depends on neighbors (e.g., "Road must connect to Road"), flag for **Wave Function Collapse (WFC)**.
2.  **Recursion Depth**:
    *   Scan `NatureFloraService` for hardcoded branching logic.
    *   **Refinement**: Extract branching rules into an **L-System** string (`A -> AB`, `B -> [A]`).
3.  **Connectivity Audit**:
    *   Check for "dangling" assets (e.g., Pipes ending in mid-air).
    *   **Requirement**: Grammar-based assets must define `Connector` nodes and verify closure.
4.  **Symmetry Audit**:
    *   **New Rule**: Identify structural complexes (Ruins, Cities). Verify if a "Seed" is used to preserve local symmetry while allowing global variation.

## 2. Refinement Strategies
*   **Wave Function Collapse (WFC)**:
    *   **Tile Definitions**: Define assets with socket IDs (e.g., `PipeStraight: { N: 1, S: 1, E: 0, W: 0 }`).
    *   **Solver**: Implement an entropy-based solver to resolve grid states deterministically.
*   **Recursive Box Subdivision (Shape Grammar)**:
    *   **Pattern**: Start with `BoundingBox`. Apply rules to split into `ChildCells`. Assign terminal types (Pillar, Core, Wall) based on cell coordinates (e.g., `isCorner`, `isCenter`).
    *   **Benefit**: Produces stable, non-overlapping structural foundations.
*   **L-Systems (Lindenmayer)**:
    *   Use for Organic branching (Veins, Lightning, Coral).
*   **Weathering Rule**:
    *   **Action**: Apply a `seed < threshold` check at the terminal node of any structural grammar to randomly omit assets, simulating historical erosion.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: For WFC on mobile, limit grid size to 16x16. Larger grids require hierarchical solving.
*   *Current Heuristic*: Symmetrical subdivision (e.g., 3x3) combined with random weathering creates a more "ancient" feel than pure random scatter.
*   *Current Heuristic*: Use a "Bedrock Slab" under grammar-based foundations to prevent character tunneling during physics simulation.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After implementing a grammar, perform the **Mutation Check**:
1.  **Dead Ends**: Did the WFC solver fail > 1% of the time?
2.  **Correction**: Add "Wildcard" tiles that can connect to anything to guarantee convergence.
