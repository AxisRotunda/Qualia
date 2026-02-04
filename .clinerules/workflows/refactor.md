# Refactor Workflow

Clean architectural debt and improve code structure safely.

## Steps

1. **Scope Definition**: Identify files/targets for refactoring, define success criteria
2. **Deprecation Shield Check**: Query `knowledge-graph.md` for file dependencies
3. **Impact Analysis**: Map all consumers of target code, plan migration path
4. **Refactor Execution**:
   - Create backup/migration path
   - Execute structural changes
   - Update all consumers
   - Verify no regressions
5. **Documentation Update**: Update architecture docs if patterns changed
6. **FS-Manifest Sync**: Log all moves/deletes in `fs-manifest.json`

## Safeguards

- Deprecation Shield: Check `knowledge-graph.md` before deletion
- Zoneless Integrity: ABSOLUTE prohibition of `zone.js` or `NgZone`
- Signal-State Only: Cross-component state must exist within Signals
