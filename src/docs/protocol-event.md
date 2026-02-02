
# [PROTOCOL] Event Bus & Messaging
> **Trigger**: `RUN_EVENT`
> **Target**: `src/engine/events/`, `src/engine/ecs/entity-lifecycle.service.ts`
> **Version**: 1.0 (Genesis)
> **Axiom**: "Decouple the sender from the receiver. Noise is data; Signal is structure."

## 1. Analysis Routine
1.  **Coupling Scan**:
    *   Identify Services injecting other Services solely to call a notification method (e.g., `PhysicsService` calling `AudioService.playImpact()`).
    *   **Violation**: High coupling prevents modular testing and refactoring.
2.  **Payload Integrity**:
    *   Check for `Subject<any>` or `emit('string', data)`.
    *   **Violation**: Untyped events are forbidden. All events must implement a typed Interface.
3.  **Lifecycle Check**:
    *   Verify `Subscription.unsubscribe()` is called in `ngOnDestroy` or via `takeUntilDestroyed`.
    *   **Leak Risk**: Global event buses are prime candidates for memory leaks.

## 2. Refinement Strategies
*   **Domain Buses**:
    *   Prefer specific buses (`EntityLifecycle`, `PhysicsEvents`, `InputEvents`) over a single global `EventBus`.
*   **Typed Contracts**:
    *   Define Event Interfaces in `src/engine/events/contracts/`.
    *   Example: `interface CollisionEvent { entityA: Entity; entityB: Entity; impulse: number; }`.
*   **Signal Integration**:
    *   For state changes that stick (e.g., "Game Paused"), use `Signals` in a State Service.
    *   For transient occurrences (e.g., "Explosion"), use `RxJS Subjects`.

## 3. Self-Learning Heuristics (Dynamic)
*   *Current Heuristic*: Avoid multicasting (shareReplay) unless late subscribers absolutely need the last event. It increases memory overhead.
*   *Current Heuristic*: In the Game Loop, process the Event Queue *before* the Logic Step to ensure frame-accurate reactions.

## 4. Meta-Update (Self-Optimization)
**INSTRUCTION**: After refactoring events, perform the **Mutation Check**:
1.  **Spam**: Did an event fire 60 times a second (e.g., `onMove`)?
2.  **Correction**: If yes, mandate `throttleTime` or `sampleTime` operators in the subscription or move logic to a polling loop.
