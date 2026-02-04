# Skill: Knowledge Audit

Audit documentation hierarchy and sync cross-tier information.

## Trigger
`RUN_KNOWLEDGE` or mention "knowledge audit"

## Execution Steps

1. **Tiered Traversal**: Read T0→T4 documentation hierarchy
   - T0: `src/docs/kernel.md`
   - T1: `src/docs/core/*.md`
   - T2: `src/docs/architecture/*.md`
   - T3: `src/docs/protocols/*.md`
   - T4: `src/docs/history/*.md`

2. **Verify Links**: Check all linked files exist
3. **Orphan Detection**: Identify orphaned protocols
4. **Version Check**: Update version IDs on major shifts
5. **Memory Prune**: Prune memory.md to last 10 entries

## Output

Audit report with drift detection between tiers.
