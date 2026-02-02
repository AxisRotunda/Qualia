
import { Injectable, inject } from '@angular/core';
import { GameSystem } from '../system';
import { EngineStateService } from '../engine-state.service';
import { EntityStoreService } from '../ecs/entity-store.service';
import { EntityTransformSystem } from './entity-transform.system';
import { PhysicsService } from '../../services/physics.service';
import { InstancedMeshService } from '../graphics/instanced-mesh.service';
import { VisibilityManagerService } from '../graphics/visibility-manager.service';
import { SelectionManagerService } from '../graphics/selection-manager.service';
import { CameraManagerService } from '../graphics/camera-manager.service';
import { PostProcessingService } from '../graphics/post-processing.service';
import { RendererService } from '../graphics/renderer.service';
import { SceneGraphService } from '../graphics/scene-graph.service';

@Injectable({ providedIn: 'root' })
export class RenderSystem implements GameSystem {
  readonly priority = 900;
  
  private state = inject(EngineStateService);
  private graph = inject(SceneGraphService);
  private entityStore = inject(EntityStoreService);
  private physics = inject(PhysicsService);
  private transformSystem = inject(EntityTransformSystem);
  private instancedService = inject(InstancedMeshService);
  private visibilityManager = inject(VisibilityManagerService);
  private selectionManager = inject(SelectionManagerService);
  private cameraManager = inject(CameraManagerService);
  private rendererService = inject(RendererService);
  private postProcessing = inject(PostProcessingService);

  update(dt: number, totalTime: number): void {
    // 1. Industry Standard: Temporal Interpolation
    // Synchronize visual poses based on physics remainder (alpha)
    const alpha = (this.physics.world as any).stepper?.getAlpha() ?? 1.0;
    this.transformSystem.interpolateVisuals(alpha);

    // 2. View Culling Pass
    const visibleCount = this.visibilityManager.updateVisibility();

    // 3. Camera Transitions & Effects
    this.cameraManager.update(dt);

    // 4. Update Instanced Meshes
    this.instancedService.update();

    if (this.state.showDebugOverlay()) {
        this.state.updateDebugInfo(info => ({
            ...info,
            visibleMeshCount: visibleCount
        }));
    }

    // 5. Selection Helper Update
    if (this.entityStore.selectedEntity() !== null) {
      this.selectionManager.updateHelper();
    }

    // 6. Final Composition
    const rStart = performance.now();
    const scene = this.graph.scene;
    const camera = this.cameraManager.getCamera();
    const usePost = this.state.postProcessingEnabled();

    if (usePost) {
        this.postProcessing.update(totalTime, scene, camera);
        this.postProcessing.render();
    } else {
        this.rendererService.render(scene, camera);
    }
    
    this.state.setRenderTime(Math.round((performance.now() - rStart) * 100) / 100);
  }
}
