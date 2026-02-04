# Skill: Optimize Performance

Identify and resolve performance bottlenecks.

## Trigger
`RUN_OPT` or mention "optimize performance"

## Parameters

| Param | Type | Description |
|-------|------|-------------|
| `target` | string | Subsystem (physics/render/state) |
| `metric` | string | Target metric (fps/memory/gc) |
| `threshold` | number | Improvement target % |

## Execution Steps

1. **Baseline Capture**: Measure current metrics
2. **Hot Path Analysis**: Identify bottlenecks
3. **Strategy Selection**: Choose optimization approach
4. **Implementation**: Apply changes incrementally
5. **Verification**: Confirm improvement
6. **Documentation**: Update optimization-report.md

## Entry Points

- `src/engine/game-loop.service.ts` - Frame timing
- `src/physics/world.service.ts` - Physics step
- `src/services/scene.service.ts` - Render pipeline
