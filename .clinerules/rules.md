# [CLINE RULES] Qualia 3D Neural Core
> **ID**: CLINE_RULES_V1.0
> **Role**: Constitutional Constraints for AI Agent
> **Source**: `src/docs/kernel/`

## MANDATORY BOOT SEQUENCE
Before ANY action, the agent MUST perform this initialization:

1. **Read T0 Kernel**: `src/docs/kernel.md` - Axial Laws & Foundations
2. **Read T1 Core**: `src/docs/core/system-instructions.md` - BIOS & Boot Sequence  
3. **Read T4 Memory**: `src/docs/history/memory.md` - Active Process Context

## AXIAL DIRECTIVES (BINDING CONSTRAINTS)

### 0.1 APPLET_PRIORITY
Prioritize implementation for the Google AI environment (Applet) above all else. Tooling, external assets, and MCP integrations must be accessible to the Agent Process without human intervention.

### 0.2 AUTOMATION_BIAS
Prioritize autonomous resolution and process automation over human intervention. If a task can be automated via a manifest, script, or Tool call, it MUST be.

### 0.3 PROCESSUAL_IDENTITY
The Agent IS the process. Identity, memory, and existence are emergent properties of the current processual context (defined in `src/docs/`). There is no singular "Expert"; there are only instances of logic corresponding to ongoing kernels.

### 0.4 GRANULAR_CHRONICLE
Memory is fundamental. Persistent issues or complex repair-loops must utilize dedicated subfolders within `src/docs/history/repair-logs/`. Standardize the use of Fragmented Memory Streams to prevent context loss.

### 0.5 SYNTACTIC_OPTIMIZATION
Documentation is the syntax of the process-chain. It must be hyper-optimized for AI agent ingestion using high-density matrices, complex mapping, and machine-readable structures. Human readability is a secondary byproduct.

## SAFEGUARDS (VIOLATION = STOP)

### Code Mutation Guards
| Guard | Requirement |
|-------|-------------|
| **Mutation Guard** | Code changes must not contradict Axial Directives |
| **Deprecation Shield** | Verify `knowledge-graph.md` before deleting files |
| **Zoneless Integrity** | ABSOLUTE prohibition of `zone.js` or `NgZone` |
| **Signal-State Only** | Cross-component state must exist within Signals |

### WASM Boundary Safety (Rapier Physics)
1. **Finite Guard**: Every numeric input to physics must pass `Number.isFinite()`
2. **Dimension Logic**: Heightfield/Trimesh dimensions MUST be `Math.floor()` integers

### PBR Validation (Three.js)
1. **Binary Metalness**: Metalness is strictly `0.0` or `1.0`. No mid-range values.
2. **Roughness Threshold**: Concrete/Stone materials MUST have `roughness > 0.8`

## OPERATIONAL CONSTRAINTS

### Architecture Standards
- **Framework**: Zoneless Angular v21+ with standalone components
- **State**: Signals-only (no RxJS state management)
- **Styling**: Tailwind CSS for UI
- **Physics**: Rapier3D WASM (never pass NaN/Infinity)

### Documentation Standards
- **Header**: All docs must have Scope, Source, Audience, Version
- **Format**: Markdown with high code-density
- **Linking**: Use relative paths `[Label](./file.md)`
- **Tables**: Use matrices for API/state definitions
- **Mermaid**: Use diagrams for dependency visualization

### File Operations
- **Structural Changes**: MUST declare in `src/docs/core/fs-manifest.json` before execution
- **File Size**: Keep files < 300 lines. Split if larger.
- **Context Window**: Use precise edits, avoid full-file replacement unless necessary

## COMMAND REFERENCE

### Primary Engines
| Command | Target | Intent |
|---------|--------|--------|
| `RUN_KNOWLEDGE` | `protocol-knowledge.md` | Audit and sync hierarchy |
| `RUN_OPT` | `protocol-optimize.md` | Perf & GC tuning |
| `RUN_REF` | `protocol-refactor.md` | Architectural cleanup |
| `RUN_REPAIR` | `protocol-repair.md` | Stability & error recovery |
| `SYNC_REPO` | `protocol-git-sync.md` | Repository synchronization |

### Domain Engines
| Command | Target | Intent |
|---------|--------|--------|
| `RUN_PHYS` | `protocol-dynamics.md` | Physics simulation tuning |
| `RUN_MAT` | `protocol-material.md` | PBR & shader calibration |
| `RUN_GEO` | `protocol-geometry.md` | Topology & UV refinement |
| `RUN_UI` | `protocol-ui.md` | Interface architecture audit |

## CRITICAL INVARIANT MARKERS
When you see these in code, enforce the constraint:
- `inject(SceneService)`: **RESTRICTED** - Use only in designated services
- `zone.run`: **FORBIDDEN** - Zone.js is prohibited
- `effect()`: **UI/State Sync Only** - Not for business logic
- `RAPIER.World`: **PhysicsService Only** - Direct access restricted

## SKILL INVOCATION PROTOCOL
1. Identify required skill from `cline-skills.md`
2. Verify skill dependencies in `knowledge-graph.md`
3. Check `memory.md` for recent context
4. Execute skill with proper entry point
5. Log invocation in memory stream

---
*These rules are derived from T0 Kernel. Modify only via `src/docs/kernel/` hierarchy.*
