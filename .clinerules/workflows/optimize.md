# Optimize Workflow

Identify and resolve performance bottlenecks with measured improvements.

## Steps

1. **Baseline Capture**: Measure current performance metrics, identify hot paths
2. **Optimization Targeting**: Load `protocol-optimize.md`, map bottlenecks to categories
3. **Strategy Selection**:
   - GC tuning
   - Memory layout optimization
   - Render pipeline optimization
   - Physics step optimization
4. **Implementation**: Apply optimization incrementally, measure after each change
5. **Verification**: Confirm metrics improved, verify no functional regressions
6. **Documentation**: Update `optimization-report.md` and record in `memory.md`

## Entry Points

- `src/engine/game-loop.service.ts` - Frame timing
- `src/physics/world.service.ts` - Physics step
- `src/services/scene.service.ts` - Render pipeline

## Parameters

| Param | Type | Description |
|-------|------|-------------|
| `target` | string | Subsystem to optimize (physics/render/state) |
| `metric` | string | Target metric (fps/memory/gc) |
| `threshold` | number | Improvement target percentage |
