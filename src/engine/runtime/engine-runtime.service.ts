
import { Injectable, inject } from '@angular/core';
import { GameLoopService } from '../../services/game-loop.service';
import { PhysicsWorldService } from '../../physics/world.service';
import { SceneVisualsService } from '../../scene/scene-visuals.service';
import { EntityManager } from '../entity-manager.service';
import { EngineStateService } from '../engine-state.service';
import { ParticleService } from '../../services/particle.service';

@Injectable({
  providedIn: 'root'
})
export class EngineRuntimeService {
  private loop = inject(GameLoopService);
  private physics = inject(PhysicsWorldService);
  private scene = inject(SceneVisualsService);
  private entityManager = inject(EntityManager);
  private state = inject(EngineStateService);
  private particleService = inject(ParticleService);

  // Callbacks for mode-specific updates (injected by EngineService)
  public onUpdate: ((dt: number) => void) | null = null;

  init() {
    this.loop.fps.set = (v) => this.state.fps.set(v);
    this.loop.start((dt) => this.tick(dt));
  }

  private tick(dt: number) {
     // 1. External Mode Updates (Controls, Inputs)
     if (this.onUpdate) {
         this.onUpdate(dt);
     }
     
     this.particleService.update(dt);

     // 2. Physics & Sync
     const physicsPaused = this.state.isPaused() || this.state.mainMenuVisible();
     
     if (!physicsPaused) {
       const pStart = performance.now();
       this.physics.step();
       this.state.physicsTime.set(Math.round((performance.now() - pStart) * 100) / 100);
       
       const syncMode = this.state.mode() === 'edit' ? 'edit' : 'play';
       this.entityManager.syncPhysicsTransforms(syncMode, this.scene.isDraggingGizmo());
     } else {
        if (this.state.mode() === 'edit' && this.scene.isDraggingGizmo()) {
            const e = this.entityManager.selectedEntity();
            if (e !== null) {
                this.entityManager.updateSingleEntityFromVisual(e);
            }
        }
     }

     // 3. Stats & Debug
     this.state.debugInfo.set({
         paused: physicsPaused,
         bodyCount: this.entityManager.world.rigidBodies.size,
         singleUpdate: null
     });
     
     if (this.entityManager.selectedEntity() !== null) {
         this.scene.updateSelectionHelper();
     }

     // 4. Render
     const rStart = performance.now();
     this.scene.render();
     this.state.renderTime.set(Math.round((performance.now() - rStart) * 100) / 100);
  }
}
