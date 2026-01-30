
import { Injectable, inject, Injector } from '@angular/core';
import { GameSystem } from '../system';
import { EngineStateService } from '../engine-state.service';
import { SceneRegistryService } from '../../services/scene-registry.service';
import { EngineService } from '../../services/engine.service';

@Injectable({ providedIn: 'root' })
export class SceneLogicSystem implements GameSystem {
  readonly priority = 150;
  private state = inject(EngineStateService);
  private registry = inject(SceneRegistryService);
  private injector = inject(Injector);

  update(dt: number, totalTime: number): void {
    const currentSceneId = this.state.currentSceneId();
    if (currentSceneId) {
      const preset = this.registry.getPreset(currentSceneId);
      if (preset && preset.onUpdate) {
        // Resolve EngineService lazily to avoid circular dependency:
        // EngineService -> EngineRuntimeService -> SceneLogicSystem -> EngineService
        const engine = this.injector.get(EngineService);
        preset.onUpdate(dt, totalTime, engine);
      }
    }
  }
}
