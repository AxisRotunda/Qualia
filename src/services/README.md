# [T2] Application Services
> **ID**: SERVICES_README_V1.0  
> **Role**: High-level service orchestration layer  
> **Tier**: T2 (Architecture)  
> **Authority**: Domain Services

## Core Services
| Service | Responsibility | Entry Point |
|---------|----------------|-------------|
| `engine.service.ts` | Engine lifecycle management | Bootstrap |
| `scene.service.ts` | THREE.Scene management | RESTRICTED |
| `asset.service.ts` | Asset loading & caching | AssetRegistry |
| `game-loop.service.ts` | Frame update coordination | Time.delta |

## Domain Services
### Character
| Service | Purpose |
|---------|---------|
| `character-controller.service.ts` | Input-to-movement mapping |
| `character-physics.service.ts` | Physics body integration |

### Input
| Service | Purpose |
|---------|---------|
| `game-input.service.ts` | Unified input handling |
| `keyboard.service.ts` | Keyboard state tracking |
| `fly-controls.service.ts` | Camera fly mode |

### Generation
| Path | Purpose |
|------|---------|
| `factories/` | Entity factories (mesh, physics, template) |
| `generators/` | Procedural content generators |
| `generators/actor/` | Actor/character generation |
| `generators/architecture/` | Building generation |
| `generators/interior/` | Interior furnishing |
| `generators/nature/` | Terrain, flora, geology |
| `generators/scifi/` | Sci-fi environment structures |
| `generators/combat/` | Weapon generation |

### UI Services
| Service | Purpose |
|---------|---------|
| `ui/layout.service.ts` | Layout management |
| `ui/menu-manager.service.ts` | Menu state |
| `ui/filesystem.service.ts` | File operations |
| `ui/git-sync.service.ts` | Repository sync |
| `ui/a11y.service.ts` | Accessibility |

---
*Import via barrel: `@services/...` or `@services/ui/...`*
