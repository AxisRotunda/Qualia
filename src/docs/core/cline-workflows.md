# [T1] CLINE Workflows
> **ID**: CLINE_WF_V1.0
> **Role**: Workflow Definitions for AI Agent
> **Source**: `../kernel.md`
> **Tier**: 1 (Core)

## 1. WORKFLOW INDEX

| Workflow | Trigger | Duration | Entry Point |
|----------|---------|----------|-------------|
| `WF_BOOT` | Session start | 1-2 min | Automatic |
| `WF_DISCOVERY` | New feature request | 2-3 min | `RUN_KNOWLEDGE` |
| `WF_IMPLEMENT` | Feature development | Variable | Task-specific |
| `WF_REPAIR` | Bug fix | Variable | `RUN_REPAIR` |
| `WF_REFACTOR` | Code cleanup | Variable | `RUN_REF` |
| `WF_OPTIMIZE` | Performance tuning | Variable | `RUN_OPT` |
| `WF_SYNC` | Repository sync | 1-2 min | `SYNC_REPO` |

---

## 2. WORKFLOW: BOOT SEQUENCE (`WF_BOOT`)

### Trigger
Every new AI session or context refresh.

### Steps
```
1. READ src/docs/kernel.md
   └─> Verify Axial Directives 0.1-0.5
   └─> Load Safeguards & Validation rules

2. READ src/docs/core/system-instructions.md
   └─> Initialize BIOS state
   └─> Map hard links to subsystems

3. READ src/docs/core/project-hierarchy.md
   └─> Establish navigational map
   └─> Verify documentation tiers

4. READ src/docs/history/memory.md
   └─> Load recent process context
   └─> Identify active fragments

5. VERIFY fs-manifest.json
   └─> Check for pending operations
   └─> Execute or queue as needed

6. STATUS REPORT
   └─> Current Phase, Active Fragment, Identity Instance
```

### Output
Agent state initialized with full context of the process.

---

## 3. WORKFLOW: DISCOVERY (`WF_DISCOVERY`)

### Trigger
New feature request or unfamiliar codebase area.

### Steps
```
1. PARSE REQUEST
   └─> Extract domain keywords
   └─> Identify affected subsystems

2. TIERED SCAN
   ├─> T2 Architecture: Read relevant blueprint
   ├─> T3 Protocol: Load domain logic engine
   └─> T4 History: Check for similar work

3. DEPENDENCY MAP
   └─> Query knowledge-graph.md
   └─> Build adjacency matrix for target system

4. ENTRY POINT IDENTIFICATION
   └─> Locate primary service/component
   └─> Identify public API facade

5. CONSTRAINT EXTRACTION
   └─> List Safeguards that apply
   └─> Note Critical Invariant Markers
```

### Output
Discovery report with:
- Target files identified
- Dependencies mapped
- Constraints listed
- Entry point confirmed

---

## 4. WORKFLOW: IMPLEMENT (`WF_IMPLEMENT`)

### Trigger
Clear feature specification with discovery complete.

### Steps
```
1. PRE-FLIGHT CHECK
   └─> Verify BOOT complete
   └─> Confirm Discovery report exists

2. SKILL SELECTION
   └─> Map feature to skills in cline-skills.md
   └─> Check skill prerequisites

3. IMPLEMENTATION LOOP
   ├─> Write code following Meta-Heuristics
   ├─> Apply Safeguards at each mutation
   ├─> Verify no Critical Invariant violations
   └─> Test incrementally

4. DOCUMENTATION SYNC
   └─> Update relevant T2/T3 docs if API changed
   └─> Record changes in memory.md

5. MANIFEST UPDATE
   └─> If structural changes: update fs-manifest.json
   └─> If new files: declare in manifest
```

### Output
Implemented feature with synced documentation.

---

## 5. WORKFLOW: REPAIR (`WF_REPAIR`)

### Trigger
Bug report, error in console, or test failure.

### Steps
```
1. ERROR CAPTURE
   └─> Log error message and stack trace
   └─> Identify error domain (Physics, Render, State)

2. CHRONICLE CHECK
   └─> Search repair-logs/ for similar issues
   └─> Check if pattern exists in memory.md

3. ROOT CAUSE ANALYSIS
   └─> Trace error to source file
   └─> Identify triggering condition

4. SAFEGUARD VERIFICATION
   └─> Check if error violates WASM Finite Guard
   └─> Verify PBR Binary Metalness compliance
   └─> Confirm Zoneless Integrity maintained

5. FIX IMPLEMENTATION
   ├─> Apply minimal fix
   ├─> Verify fix with test/reproduction
   └─> Log to repair-logs/[issue-name]/

6. HEURISTIC EXTRACTION
   └─> If novel issue: document in T3 protocol
   └─> Update knowledge-graph.md if pattern detected
```

### Output
Fixed issue with logged resolution path.

---

## 6. WORKFLOW: REFACTOR (`WF_REFACTOR`)

### Trigger
Code cleanup, architectural improvement, or technical debt reduction.

### Steps
```
1. SCOPE DEFINITION
   └─> Identify files/targets for refactoring
   └─> Define success criteria

2. DEPRECATION SHIELD CHECK
   └─> Query knowledge-graph.md for file dependencies
   └─> Verify no orphaned logic will be created

3. IMPACT ANALYSIS
   └─> Map all consumers of target code
   └─> Plan migration path for each consumer

4. REFACTOR EXECUTION
   ├─> Create backup/migration path
   ├─> Execute structural changes
   ├─> Update all consumers
   └─> Verify no regressions

5. DOCUMENTATION UPDATE
   └─> Update architecture docs if patterns changed
   └─> Record in memory.md

6. FS-MANIFEST SYNC
   └─> Log all moves/deletes in fs-manifest.json
```

### Output
Refactored code with maintained dependencies.

---

## 7. WORKFLOW: OPTIMIZE (`WF_OPTIMIZE`)

### Trigger
Performance bottleneck identified or optimization opportunity.

### Steps
```
1. BASELINE CAPTURE
   └─> Measure current performance metrics
   └─> Identify hot paths via profiling

2. OPTIMIZATION TARGETING
   └─> Load protocol-optimize.md
   └─> Map bottlenecks to optimization categories

3. STRATEGY SELECTION
   ├─> GC tuning
   ├─> Memory layout optimization
   ├─> Render pipeline optimization
   └─> Physics step optimization

4. IMPLEMENTATION
   └─> Apply optimization incrementally
   └─> Measure after each change

5. VERIFICATION
   └─> Confirm metrics improved
   └─> Verify no functional regressions

6. DOCUMENTATION
   └─> Update optimization-report.md
   └─> Record in memory.md
```

### Output
Optimized code with measured improvement.

---

## 8. WORKFLOW: REPOSITORY SYNC (`WF_SYNC`)

### Trigger
Pre-session or post-completion repository synchronization.

### Steps
```
1. TOKEN VALIDATION
   └─> Verify .env contains GITHUB_TOKEN
   └─> Check token permissions

2. STATE CHECK
   ├─> git status: Verify working tree clean
   ├─> git log: Check commits to push
   └─> Calculate sync state matrix

3. TARGET CONFIGURATION
   └─> Verify 'target' remote points to AxisRotunda/Qualia
   └─> Confirm target branch is 'dev'

4. SYNC EXECUTION
   ├─> If AHEAD: Push to target
   ├─> If BEHIND: Report for manual merge
   └─> If SYNCED: Confirm alignment

5. LOGGING
   └─> Record sync result in memory.md
   └─> Update process context
```

### Output
Repository synchronized or sync state reported.

---

## 9. WORKFLOW COMPOSITION

Workflows can be composed for complex operations:

| Composite Workflow | Component Workflows |
|-------------------|---------------------|
| `NEW_FEATURE` | `WF_DISCOVERY` → `WF_IMPLEMENT` → `WF_SYNC` |
| `HOTFIX` | `WF_REPAIR` → `WF_SYNC` |
| `SPRINT_CLEANUP` | `WF_REFACTOR` → `WF_OPTIMIZE` → `WF_SYNC` |
| `FULL_AUDIT` | `WF_BOOT` → `RUN_KNOWLEDGE` → `WF_OPTIMIZE` |

---

*Workflows reference Tier 3 Protocols for domain-specific logic execution.*
