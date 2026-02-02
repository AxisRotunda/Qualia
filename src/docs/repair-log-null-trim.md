
# [REPAIR_LOG] Null-Trim Error Mitigation
> **ID**: LOG_NULL_TRIM_STABILITY
> **Status**: Active Monitoring
> **Axiom**: "Input is untrusted. Boundaries must be absolute."

## 1. Problem Definition
The application periodically encounters `TypeError: Cannot read properties of null (reading 'trim')` or `reading 'toLowerCase'`. This typically occurs in high-frequency loops (Systems) or Reactive Signals (UI) when an optional string property from the ECS or a DOM Event is processed without sufficient guarding.

## 2. Diagnostic History

| Entry | Date | Target | Resolution |
|---|---|---|---|
| 001 | Phase 37.2 | `KeyboardService.normalizeShortcut` | Implemented `NullShield.trim` to handle `+` split artifacts. |
| 002 | Phase 37.2 | `EntityOpsService.setEntityName` | Enforced strict string coercion at the service boundary. |
| 003 | Phase 37.2 | `SceneTreeComponent.searchQuery` | Shielded `HTMLInputElement` value reads from potential null targets. |
| 004 | Phase 37.2 | `RepairSystem` | Added "Identity Sanitization" to purge corrupted strings in SoA buffers. |
| 005 | Phase 37.3 | `EngineStateService` / `PersistenceService` | Hardened Solar/Atmosphere setters and JSON loader against malformed storage. |
| 006 | Phase 38.0 | **Global Audit** | Applied `NullShield` to all remaining string-processing boundaries. Implemented "Entity Guards" in Persistence loading loops to skip malformed data structures. |
| 007 | Phase 38.1 | `PersistenceService.loadSceneData` | Standardized `tplId` extraction using `NullShield.trim` for entity reconstruction. |
| 008 | Phase 38.2 | `EnvironmentControlService` | **CRITICAL FIX**: Found `settings.dirColor` null-bypass. Implemented `NullShield` check before `.toLowerCase()` call. Upgraded `NullShield` to V2.0 (Fast-Path). |
| 009 | Phase 38.3 | `NullShield` / `EnvironmentControlService` | **HARDENING**: Upgraded NullShield to V2.1 with `safeLowerCase` to prevent raw string method calls. Added explicit null check for `settings` object in `setLightSettings`. Hardened `KeyboardService` against non-string input types. |
| 010 | Phase 38.3 | `AnimationControlService` | **CRITICAL FIX**: The `play()` method accepted raw strings and called `.toLowerCase()` immediately. Applied `NullShield.safeLowerCase()` to prevent crashes from uninitialized inputs. |

## 3. Heuristics for Prevention
1.  **Setters over direct assignment**: Always use Service methods to update string signals.
2.  **The Coercion Rule**: Use `String(v ?? '')` before calling any string methods.
3.  **Default Fallbacks**: Use `NullShield.DEFAULT_NAME(entity)` to ensure entities always have a valid searchable label.
4.  **Template Protection**: Avoid calling `.trim()` or `.toLowerCase()` directly in HTML bindings. Perform all formatting in `computed()` signals.

## 4. Persistent Artifacts
*   `src/engine/utils/string.utils.ts`: Centralized utility for string safety.
