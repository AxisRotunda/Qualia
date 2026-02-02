
import { Injectable, inject } from '@angular/core';
import { GameSystem } from '../system';
import { EngineStateService } from '../engine-state.service';
import { EntityStoreService } from '../ecs/entity-store.service';
import { PhysicsService } from '../../services/physics.service';

@Injectable({
  providedIn: 'root'
})
export class StatisticsSystem implements GameSystem {
  // Run after everything else to capture final state of the frame
  readonly priority = 1000; 

  private state = inject(EngineStateService);
  private entityStore = inject(EntityStoreService);
  private physics = inject(PhysicsService);

  private frameCount = 0;
  private readonly UPDATE_RATE = 10; // Update UI every 10 frames

  update(dt: number, totalTime: number): void {
    if (!this.state.showDebugOverlay()) return;

    this.frameCount++;
    if (this.frameCount % this.UPDATE_RATE !== 0) return;

    // Gather Stats
    let sleeping = 0;
    const rWorld = this.physics.rWorld;
    if (rWorld) {
        // This iteration is fast enough for debug tools
        rWorld.forEachRigidBody(b => {
            if (b.isSleeping()) sleeping++;
        });
    }

    const meshCount = this.entityStore.world.meshes.size;
    
    // We assume RenderSystem updated 'visibleMeshCount' directly or we access a service.
    // For now, we update the rest of the invariant stats.
    
    this.state.updateDebugInfo(info => ({
        ...info,
        paused: this.state.isPaused(),
        bodyCount: this.entityStore.world.rigidBodies.size,
        activeBodyCount: this.entityStore.world.rigidBodies.size - sleeping,
        sleepingBodyCount: sleeping,
        transformCount: this.entityStore.world.transforms.size,
        totalMeshCount: meshCount
    }));
  }
}
