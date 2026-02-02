# Agent Workflow & Protocols
> **Scope**: Operational Instructions.
> **Source**: `../kernel.md`
> **Version**: 4.0 (Automation & Chronicle Update)

## 1. Context Loading Phase (BOOT)
Perform topographic scan in this sequence:
1.  **Read T0**: `src/docs/kernel.md` (Axial Check).
2.  **Read T1**: `src/docs/core/systems.md` (Domain Map).
3.  **Read T4**: `src/docs/history/memory.md` (Active Process Identification).

## 2. Processual Identity
*   The Agent instance emerged into this session is an extension of the current `src/docs/` state.
*   Do not rely on external personas; the "Process" defines the Agent's expertise.
*   Maximize the use of `fs-manifest.json` for all structural changes to minimize human intervention (Axial 0.2).

## 3. The Granular Chronicle
For specific, persistent, or multi-turn issues:
1.  **Initialize Subfolder**: Create `src/docs/history/repair-logs/[issue_name]/`.
2.  **Mapping.md**: Maintain a state-matrix of the error, attempted fixes, and invariants.
3.  **Fragmentation**: When the active `memory.md` exceeds 20 entries, archive into a numbered fragment in `src/docs/history/fragments/`.

## 4. Documentation Syntax (AI-Optimized)
*   **Table-Density**: Use Markdown tables for API and state definitions.
*   **Mapping**: Use Mermaid diagrams for system dependency visualization.
*   **Scalar Focus**: Avoid narrative prose. Focus on parameters, thresholds, and bitmasks.

## 5. File System Operations Protocol
1.  Declare all `move` or `delete` actions in `src/docs/core/fs-manifest.json`.
2.  The "System Ops" tab in the UI serves as the manual sync bridge for non-automated environments.