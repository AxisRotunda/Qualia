
import { Injectable, inject } from '@angular/core';
import { GameSystem } from '../system';
import { EngineStateService } from '../engine-state.service';
import { EntityStoreService } from '../ecs/entity-store.service';
import { PhysicsService } from '../../services/physics.service';
import { RaycasterService } from '../interaction/raycaster.service';
import { EntityOpsService } from '../features/entity-ops.service';

/**
 * TelemetrySystem: Gathers runtime data for the HUD.
 * Part of RUN_OPT Phase 59.0.
 * Priority 1100: Executes after Render to ensure camera/mesh alignment.
 */
@Injectable({ providedIn: 'root' })
export class TelemetrySystem implements GameSystem {
  readonly priority = 1100;

  private state = inject(EngineStateService);
  private entityStore = inject(EntityStoreService);
  private physics = inject(PhysicsService);
  private raycaster = inject(RaycasterService);
  private ops = inject(EntityOpsService);

  private readonly _vel = { x: 0, y: 0, z: 0 };
  private frameSkip = 0;

  update(dt: number): void {
      const mode = this.state.mode();
      if (mode === 'edit' && !this.state.hudVisible()) return;

      // 1. Velocity Telemetry
      const player = this.state.playerEntity();
      if (player !== null) {
          const rbHandle = this.entityStore.world.rigidBodies.getHandle(player);
          if (rbHandle !== undefined && this.physics.world.copyBodyLinVel(rbHandle, this._vel)) {
              // RUN_INDUSTRY: Compute Speed Magnitude for HUD (m/s)
              const speed = Math.sqrt(this._vel.x * this._vel.x + this._vel.y * this._vel.y + this._vel.z * this._vel.z);
              this.state.setPlayerSpeed(speed);
          } else {
              this.state.setPlayerSpeed(0);
          }
      }

      // 2. Tactical Acquisition (Throttled to 10Hz to save Raycast budget)
      this.frameSkip++;
      if (this.frameSkip % 6 === 0) {
          if (mode === 'walk' || mode === 'explore') {
              const hit = this.raycaster.raycastTacticalCenter();
              if (hit) {
                  const name = this.ops.getEntityName(hit.entityId);
                  this.state.setAcquiredTarget({
                      entityId: hit.entityId,
                      name: name.toUpperCase(),
                      distance: hit.distance,
                      type: 'GEOMETRY'
                  });
              } else {
                  this.state.setAcquiredTarget(null);
              }
          }
      }
  }
}
