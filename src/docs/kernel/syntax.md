# [T0] Kernel Syntax
> **ID**: K_SYNTAX_V1.0
> **Role**: Information Transversal Engine.
> **Target**: AI Agent Ingestion.

## 1. DOCUMENTATION FORMATTING

### 1.1 High-Density Matrices
 qualitative descriptions must be converted into quantitative tables (Matrices).
*   **Format**: Standard Markdown tables.
*   **Content**: Parameters, thresholds, bitmasks, and hex codes.

### 1.2 Mermaid Mapping
System dependencies and execution flows MUST use Mermaid diagrams for visual topology.
*   **Flowcharts**: Priority loops and system ordering.
*   **Class Diagrams**: ECS component relationships.

## 2. INDEXING SUBSYSTEMS

### 2.1 Tier Tagging
Every document header MUST include a Tier Tag (e.g., `[T2]`) to allow immediate categorization in the agent's context window.

### 2.2 Processual IDs
Ongoing issues or features must have a unique ID (e.g., `ID: LOG_NULL_TRIM`) to enable precise referencing across the History and Protocols.

## 3. DATA STRUCTURE STANDARDS

### 3.1 Scalar Focus
When defining logic, prioritize raw scalars over object-oriented prose. 
*   *Inefficient*: "The object should move smoothly toward the target."
*   *Optimized*: `LERP(current, target, 1 - exp(-k * dt))` where `k = 5.0`.

### 3.2 LIFO Log Buffers
The `memory.md` file uses a LIFO (Last-In, First-Out) buffer. The most recent processual context is always at the top of the log section.

## 4. PROPAGATION
This syntax is designed to propagate through all project documentation. When an agent creates a new file, it MUST adhere to the **Kernel Syntax** to ensure the next process-cycle can ingest the data efficiently.