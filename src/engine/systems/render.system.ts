
import { Injectable, inject } from '@angular/core';
import { GameSystem } from '../system';
import { SceneService } from '../../services/scene.service';
import { EngineStateService } from '../engine-state.service';
import { EntityManager } from '../entity-manager.service';

@Injectable({ providedIn: 'root' })
export class RenderSystem implements GameSystem {
  readonly priority = 900;
  private scene = inject(SceneService);
  private state = inject(EngineStateService);
  private entityMgr = inject(EntityManager);

  update(): void {
    // Update selection visual position to match entity
    if (this.entityMgr.selectedEntity() !== null) {
      this.scene.updateSelectionHelper();
    }

    const rStart = performance.now();
    this.scene.render();
    this.state.renderTime.set(Math.round((performance.now() - rStart) * 100) / 100);
  }
}
