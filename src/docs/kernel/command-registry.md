# [T0] Command Registry
> **ID**: COMMAND_REG_V1.0
> **Role**: Operational Verbs.

## 1. PRIMARY SYSTEM VERBS

| Command | Protocol | Intent |
|---|---|---|
| `RUN_KNOWLEDGE` | `protocol-knowledge` | Sync documentation hierarchy. |
| `RUN_OPT` | `protocol-optimize` | Performance and GC tuning. |
| `RUN_REF` | `protocol-refactor` | Architectural cleanup. |
| `RUN_REPAIR` | `protocol-repair` | Error recovery and stability. |
| `RUN_UI` | `protocol-ui` | View layer audit. |

## 2. DOMAIN SPECIFIC VERBS

| Command | Protocol | Intent |
|---|---|---|
| `RUN_PHYS` | `protocol-dynamics` | Physics tuning. |
| `RUN_MAT` | `protocol-material` | Shader and PBR calibration. |
| `RUN_SCENE_OPT` | `protocol-scene-optimizer` | Level-logic delegation. |
| `RUN_INDUSTRY` | `protocol-industry` | Standardizing locomotion/mechanics. |