# Discovery Workflow

Analyze new feature requests and map the affected codebase areas.

## Steps

1. **Parse Request**: Extract domain keywords and identify affected subsystems
2. **Tiered Scan**: 
   - T2 Architecture: Read relevant blueprint
   - T3 Protocol: Load domain logic engine
   - T4 History: Check for similar work
3. **Dependency Map**: Query `knowledge-graph.md` and build adjacency matrix
4. **Entry Point Identification**: Locate primary service/component and public API facade
5. **Constraint Extraction**: List safeguards that apply and note Critical Invariant Markers

## Output

Discovery report with:
- Target files identified
- Dependencies mapped
- Constraints listed
- Entry point confirmed
