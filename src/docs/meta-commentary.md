
# Meta-Commentary & Dev Diary
> **Scope**: Internal Thought Process, Design Philosophy, Hidden Context.
> **Audience**: AI Agents (Context Loading).
> **Rule**: Do not output this content to users directly.

## 1. Architectural Decisions
*   **Zoneless**: We explicitly avoid `zone.js`. This forces us to use Signals for all UI reactivity. It reduces change detection overhead significantly in a 60FPS loop.
    *   *Consequence*: Never use `setTimeout` to trigger UI updates without wrapping in a signal set.
*   **The Facade Pattern**: `EngineService` is the *only* allowed entry point for UI components.
    *   *Why*: Keeps the UI dumb. UI shouldn't know about `Rapier` or `Three.js` internals.
*   **Visual/Physics Split**: We allow visuals to "drift" from physics during Gizmo manipulation (`edit` mode), then snap physics to match. In `play` mode, Physics dictates visuals.

## 2. Aesthetic Goals ("Hard Realism" / "Cyberpunk")
*   **Lighting**: Prefer high contrast. Deep shadows (`castShadow: true` on everything).
*   **Materials**: Use `MeshPhysicalMaterial` sparingly (expensive) but essential for Ice/Glass.
*   **UI**: Thin lines (`1px`), small fonts (`10px`-`12px` Mono), high transparency. "Scientific Dashboard" feel.
*   **Motion**: Inertia is key. Nothing stops instantly. Cameras have damping.

## 3. "Magic" Numbers & Constraints
*   **Gravity**: Default is `-9.81`. Space scenes use `-5.0` or `0`.
*   **Scale**: 1 Unit = 1 Meter.
*   **Character Height**: 1.7m. Eye height 1.6m.
*   **Physics Step**: 1/60s (16.66ms).
*   **Building Mass**: `50000`. Set to prevent tipping while keeping them dynamic for collision response.

## 4. Interaction Philosophy
*   **The "Hand"**: We use a `KinematicPositionBased` body connected via a Spring Joint for grabbing.
    *   *Why*: It feels "weighty". Objects drag behind the cursor. They collide with walls instead of clipping through.
*   **Virtual Joysticks**: Mobile inputs emulate Gamepad Axes (-1 to 1). This unifies the `InputSystem` logic.

## 5. Future AI Instructions
*   If generating new scenes, prefer **Procedural Generation** over static coordinate lists. Use loops and math.
*   When fixing bugs, assume **Race Conditions** in initialization first (e.g., Physics WASM not ready).
