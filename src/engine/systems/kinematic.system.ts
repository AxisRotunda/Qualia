import { Injectable, inject } from '@angular/core';
import { GameSystem } from '../system';
import { EntityStoreService } from '../ecs/entity-store.service';
import { PhysicsService } from '../../services/physics.service';

@Injectable({
  providedIn: 'root'
})
export class KinematicSystem implements GameSystem {
  readonly priority = 180;

  private entityStore = inject(EntityStoreService);
  private physics = inject(PhysicsService);

  // Scratch objects for Rapier sync
  private readonly _pos = { x: 0, y: 0, z: 0 };
  private readonly _rot = { x: 0, y: 0, z: 0, w: 1 };

  update(): void {
    const world = this.entityStore.world;
    const controllers = world.kinematicControllers;
    const rigidBodies = world.rigidBodies;

    // RUN_OPT: Using specialized forEach with raw scalars to avoid object allocations
    controllers.forEach((tx, ty, tz, rx, ry, rz, rw, entity) => {
        // Optimization: Use getHandle to get the primitive ID directly
        const rbHandle = rigidBodies.getHandle(entity);
        if (rbHandle === undefined) return;

        this._pos.x = tx; this._pos.y = ty; this._pos.z = tz;
        this._rot.x = rx; this._rot.y = ry; this._rot.z = rz; this._rot.w = rw;

        this.physics.world.setNextKinematicTranslation(
            rbHandle, 
            this._pos, 
            this._rot
        );
    });
  }
}