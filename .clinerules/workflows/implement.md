# Implementation Workflow

Execute feature development with proper safeguards and documentation sync.

## Steps

1. **Pre-flight Check**: Verify BOOT complete and Discovery report exists
2. **Skill Selection**: Map feature to skills in `cline-skills.md` and check prerequisites
3. **Implementation Loop**:
   - Write code following Meta-Heuristics
   - Apply Safeguards at each mutation
   - Verify no Critical Invariant violations
   - Test incrementally
4. **Documentation Sync**: Update relevant T2/T3 docs if API changed, record in `memory.md`
5. **Manifest Update**: If structural changes, update `fs-manifest.json`

## Safeguards

- Mutation Guard: Changes must not contradict Axial Directives
- Deprecation Shield: Verify `knowledge-graph.md` before deleting files
- Zoneless Integrity: No Zone.js introduced
- Signal-State Only: Maintain signal-based state
