# [T2] Engine Systems
> **ID**: ENGINE_README_V1.0  
> **Role**: Neural Core Runtime - System Entry Points  
> **Tier**: T2 (Architecture)  
> **Authority**: Runtime Architecture

## Entry Points
| Service | Purpose | Safeguard |
|---------|---------|-----------|
| `bootstrap.service.ts` | Engine initialization sequence | WF_BOOT mandatory |
| `game-loop.service.ts` | Frame lifecycle management | Signal-State only |
| `engine-state.service.ts` | Global state container | No Zone.js |
| `entity-manager.service.ts` | Entity lifecycle | ECS pattern |

## Subsystems
| Directory | Role | Protocol |
|-----------|------|----------|
| `ecs/` | Entity Component System stores | [ECS Architecture](../ecs-architecture.md) |
| `controllers/` | Input/Interaction controllers | protocol-input.md |
| `graphics/` | Rendering pipeline | protocol-render.md |
| `physics/` | Physics integration (via ../physics/) | protocol-dynamics.md |
| `events/` | Event bus system | protocol-event.md |
| `workers/` | Web Workers for heavy compute | protocol-thread.md |

## Mutation Constraints
- **RESTRICTED**: `inject(SceneService)` - Use only in designated services
- **FORBIDDEN**: `zone.run` - Zone.js prohibited per Axial Directive 0.4
- **REQUIRED**: `effect()` for UI sync only, not business logic

## Critical Invariant Markers
```typescript
// When you see these, enforce the constraint:
inject(SceneService)  // RESTRICTED scope only
zone.run              // FORBIDDEN - report violation
effect()              // UI/State sync only
```

---
*See [system-instructions.md](../core/system-instructions.md) for BIOS boot sequence.*
