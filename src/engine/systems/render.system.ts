
import { Injectable, inject } from '@angular/core';
import { GameSystem } from '../system';
import { SceneService } from '../../services/scene.service';
import { EngineStateService } from '../engine-state.service';
import { EntityStoreService } from '../ecs/entity-store.service';
import { InstancedMeshService } from '../graphics/instanced-mesh.service';
import { VisibilityManagerService } from '../graphics/visibility-manager.service';
import { SelectionManagerService } from '../graphics/selection-manager.service';

@Injectable({ providedIn: 'root' })
export class RenderSystem implements GameSystem {
  readonly priority = 900;
  private scene = inject(SceneService);
  private state = inject(EngineStateService);
  private entityStore = inject(EntityStoreService);
  private instancedService = inject(InstancedMeshService);
  private visibilityManager = inject(VisibilityManagerService);
  private selectionManager = inject(SelectionManagerService);

  update(): void {
    // 0. Update Instanced Meshes
    this.instancedService.update();

    // 1. View Culling Pass (LOD)
    const visibleCount = this.visibilityManager.updateVisibility();

    // Update View Stats only (lightweight)
    if (this.state.showDebugOverlay()) {
        this.state.debugInfo.update(info => ({
            ...info,
            visibleMeshCount: visibleCount
        }));
    }

    // 2. Selection Helper Update
    if (this.entityStore.selectedEntity() !== null) {
      this.selectionManager.updateHelper();
    }

    // 3. Render
    const rStart = performance.now();
    this.scene.render();
    this.state.renderTime.set(Math.round((performance.now() - rStart) * 100) / 100);
  }
}
