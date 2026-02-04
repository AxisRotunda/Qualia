# Repair Workflow

Resolve errors and stability issues with proper logging.

## Steps

1. **Error Capture**: Log error message and stack trace, identify error domain
2. **Chronicle Check**: Search `repair-logs/` for similar issues, check `memory.md`
3. **Root Cause Analysis**: Trace error to source file, identify triggering condition
4. **Safeguard Verification**:
   - Check if error violates WASM Finite Guard
   - Verify PBR Binary Metalness compliance
   - Confirm Zoneless Integrity maintained
5. **Fix Implementation**: Apply minimal fix, verify with test/reproduction
6. **Heuristic Extraction**: If novel issue, document in T3 protocol and update `knowledge-graph.md`

## Logging

Create `src/docs/history/repair-logs/[issue-name]/` with fix documentation.

## Error Domain Mapping

| Error Pattern | Domain | Entry Point |
|--------------|--------|-------------|
| `unreachable` | WASM | `src/physics/world.service.ts` |
| `NaN` propagation | Physics | Input validation layer |
| `zone.run` | Architecture | Search & eliminate |
