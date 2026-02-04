# Boot Sequence Workflow

Initialize agent state by ingesting documentation in the proper sequence.

## Steps

1. **Read T0 Kernel**: Read `src/docs/kernel.md` to load Axial Laws & Foundations
2. **Read T1 System Instructions**: Read `src/docs/core/system-instructions.md` for BIOS state
3. **Read T1 Project Hierarchy**: Read `src/docs/core/project-hierarchy.md` for navigational map
4. **Read T4 Memory**: Read `src/docs/history/memory.md` for active process context
5. **Verify fs-manifest.json**: Check for pending file operations
6. **Status Report**: Report current phase, active fragment, and identity instance

## Expected Output

Agent state initialized with full context of the process chain.
