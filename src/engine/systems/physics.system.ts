
import { Injectable, inject } from '@angular/core';
import { GameSystem } from '../system';
import { PhysicsService } from '../../services/physics.service';
import { EntityTransformSystem } from './entity-transform.system';
import { EngineStateService } from '../engine-state.service';
import { SceneService } from '../../services/scene.service';
import { EntityStoreService } from '../ecs/entity-store.service';
import { DebugRendererService } from '../graphics/debug-renderer.service';

@Injectable({ providedIn: 'root' })
export class PhysicsSystem implements GameSystem {
  readonly priority = 200;
  private physics = inject(PhysicsService);
  private transformSystem = inject(EntityTransformSystem);
  private state = inject(EngineStateService);
  private scene = inject(SceneService);
  private entityStore = inject(EntityStoreService);
  private debugRenderer = inject(DebugRendererService);

  update(dt: number): void {
    const paused = this.state.isPaused() || this.state.mainMenuVisible() || this.state.loading();
    
    // 1. Simulation Step
    if (!paused) {
      const scale = this.state.timeScale();
      const scaledDt = dt * scale;

      const pStart = performance.now();
      
      // Pass scaled delta time to Rapier step logic
      this.physics.world.step(scaledDt);
      
      this.state.physicsTime.set(Math.round((performance.now() - pStart) * 100) / 100);
      
      // 2. Sync Physics -> ECS -> Visuals
      const syncMode = this.state.mode() === 'edit' ? 'edit' : 'play';
      const isDragging = this.scene.isDraggingGizmo();
      this.transformSystem.syncPhysicsTransforms(syncMode, isDragging);
    }

    // 3. Force Sync Visuals (Gizmo) -> Physics (Override)
    if (this.state.mode() === 'edit' && this.scene.isDraggingGizmo()) {
      const e = this.entityStore.selectedEntity();
      if (e !== null) {
        this.transformSystem.updateSingleEntityFromVisual(e);
      }
    }

    // 4. Debug Visualization
    if (this.state.showPhysicsDebug() && !this.state.loading()) {
      const buffers = this.physics.world.getDebugBuffers();
      this.debugRenderer.update(buffers);
    } else {
      this.debugRenderer.update(null);
    }
  }
}
