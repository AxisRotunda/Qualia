
import { Injectable, inject } from '@angular/core';
import { GameSystem } from '../system';
import { PhysicsWorldService } from '../../physics/world.service';
import { EntityTransformSystem } from './entity-transform.system';
import { EngineStateService } from '../engine-state.service';
import { SceneService } from '../../services/scene.service';
import { EntityManager } from '../entity-manager.service';
import { DebugRendererService } from '../graphics/debug-renderer.service';

@Injectable({ providedIn: 'root' })
export class PhysicsSystem implements GameSystem {
  readonly priority = 200;
  private physics = inject(PhysicsWorldService);
  private transformSystem = inject(EntityTransformSystem);
  private state = inject(EngineStateService);
  private scene = inject(SceneService);
  private entityMgr = inject(EntityManager);
  private debugRenderer = inject(DebugRendererService);

  update(dt: number): void {
    const paused = this.state.isPaused() || this.state.mainMenuVisible();
    
    // 1. Simulation Step
    if (!paused) {
      const pStart = performance.now();
      this.physics.step(dt);
      this.state.physicsTime.set(Math.round((performance.now() - pStart) * 100) / 100);
      
      // 2. Sync Physics -> ECS -> Visuals
      const syncMode = this.state.mode() === 'edit' ? 'edit' : 'play';
      const isDragging = this.scene.isDraggingGizmo();
      this.transformSystem.syncPhysicsTransforms(syncMode, isDragging);
    }

    // 3. Force Sync Visuals (Gizmo) -> Physics (Override)
    if (this.state.mode() === 'edit' && this.scene.isDraggingGizmo()) {
      const e = this.entityMgr.selectedEntity();
      if (e !== null) {
        this.transformSystem.updateSingleEntityFromVisual(e);
      }
    }

    // 4. Debug Visualization
    if (this.state.showPhysicsDebug()) {
      const buffers = this.physics.getDebugBuffers();
      this.debugRenderer.update(buffers);
    } else {
      this.debugRenderer.update(null);
    }

    // 5. Update Stats
    this.state.debugInfo.set({
      paused,
      bodyCount: this.entityMgr.world.rigidBodies.size,
      singleUpdate: null
    });
  }
}
