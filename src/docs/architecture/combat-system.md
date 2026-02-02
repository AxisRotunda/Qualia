# Combat System Architecture
> **Scope**: Weapons, Damage, Projectiles, Visual Feedback.
> **Source**: `src/engine/features/combat/`, `src/engine/systems/combat.system.ts`
> **Version**: 1.2 (Ballistics Calibration)

## 1. Core Components

### 1.1 WeaponService (The Brain)
*   **Role**: Handles user input trigger, state management (equipped weapon), and visual presentation (Viewmodel).
*   **State**: `equipped` (Signal).
*   **Key Methods**:
    *   `trigger()`: Fires current weapon (raycast or projectile spawn).
    *   `cycle()`: Switches active weapon.
    *   `update(dt)`: Animates the Viewmodel (Sway, Bob, Recoil).

### 1.2 CombatSystem (The Heart)
*   **Role**: Manages lifecycle of active projectiles and resolves collision impacts.
*   **Priority**: 195 (Runs before Physics Step to setup state, and handles events after).
*   **Ballistics Model (RUN_INDUSTRY)**:
    *   **Quadratic Drag**: Implements $F_{drag} = -k \cdot v^2$ to ensure high-velocity projectiles retain their trajectory over distance while physically losing energy.
    *   **Impulse Transfer**: Projects projectile momentum into target bodies upon collision.
    *   **Cleanup**: Garbage collects projectiles after `5000ms`.

### 1.3 Viewmodel (Visuals)
*   **Implementation**: A `THREE.Group` attached directly to the active Camera.
*   **Procedural Animation**:
    *   **Sway**: Lag based on `GameInput.virtualLook` delta.
    *   **Bob**: Sine wave based on `GameInput.virtualMove` and `totalTime`.
    *   **Recoil**: Spring simulation (`targetRecoil` -> `currentRecoil`) with exponential decay.

## 2. Data Structures

### 2.1 Weapon Config (`combat.config.ts`)
```typescript
interface WeaponDef {
    id: string;
    cooldown: number; // ms
    impulse: number;  // Physics force
    damage: number;   // Integrity reduction
    projectileSpeed: number; // m/s
    range?: number;   // Only for hitscan/melee
    viewOffset: { x, y, z }; // Viewmodel position relative to camera
}
```

### 2.2 Damage Model
*   **Health**: Stored in `IntegrityStore` (SoA buffer).
*   **Impact**:
    *   **Melee**: Immediate raycast. Force applied via `applyImpulseAtPoint`.
    *   **Ranged**: Physical projectile (`RigidBody` with **CCD Enabled**).
*   **Destruction**: `DestructionSystem` (Priority 205) monitors `IntegrityStore`. If `health <= 0`, triggers fracture.

## 3. VFX Integration
*   **Muzzle Flash**: `VfxService.emitMuzzleFlash` (Billboard quad).
*   **Impact**: `VfxService.emitSparks` (GPU Instanced Mesh).
*   **Lighting**: Transient `PointLight` spawned at muzzle and impact point for 100ms.

## 4. Extension Protocols
*   **New Weapon**:
    1.  Add config to `COMBAT_CONFIG`.
    2.  Add asset generator to `scifi.assets.ts`.
    3.  Register template in `props.ts` (if droppable).
    4.  Update `WeaponService.cycle()` logic.