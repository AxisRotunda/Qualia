# Skill: Repair Stability

Resolve errors and stability issues.

## Trigger
`RUN_REPAIR` or mention "repair" or "fix error"

## Error Domain Mapping

| Error Pattern | Domain | Entry Point |
|--------------|--------|-------------|
| `unreachable` | WASM | `src/physics/world.service.ts` |
| `NaN` propagation | Physics | Input validation |
| `zone.run` | Architecture | Search & eliminate |

## Execution Steps

1. **Error Capture**: Log message and stack trace
2. **Chronicle Check**: Search repair-logs for similar issues
3. **Root Cause Analysis**: Trace to source file
4. **Safeguard Verification**: Check invariant compliance
5. **Fix Implementation**: Apply minimal fix
6. **Logging**: Document in repair-logs/

## Safeguards

- WASM Finite Guard: All numeric inputs must pass `Number.isFinite()`
- Zoneless Integrity: No Zone.js
- Signal-State Only: Maintain signal-based state
