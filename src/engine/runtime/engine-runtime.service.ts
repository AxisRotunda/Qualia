
import { Injectable, inject, effect, Injector, runInInjectionContext } from '@angular/core';
import { GameLoopService } from '../../services/game-loop.service';
import { EngineStateService } from '../engine-state.service';
import { EngineService } from '../../services/engine.service';
import { GameSystem } from '../system';
import { InputSystem } from '../systems/input.system';
import { EnvironmentSystem } from '../systems/environment.system';
import { SceneLogicSystem } from '../systems/scene-logic.system';
import { PhysicsSystem } from '../systems/physics.system';
import { RenderSystem } from '../systems/render.system';
import { StatisticsSystem } from '../systems/statistics.system';

@Injectable({
  providedIn: 'root'
})
export class EngineRuntimeService {
  private loop = inject(GameLoopService);
  private state = inject(EngineStateService);
  private injector = inject(Injector);

  // Systems
  private systems: GameSystem[] = [];

  private totalTime = 0;
  private readonly MAX_DT = 100; // Cap frame time to 100ms (10fps) to prevent explosion

  constructor() {
    // Initialize Systems Order
    this.systems = [
      inject(InputSystem),
      inject(EnvironmentSystem),
      inject(SceneLogicSystem),
      inject(PhysicsSystem),
      inject(RenderSystem),
      inject(StatisticsSystem)
    ].sort((a, b) => a.priority - b.priority);
  }

  init() {
    // Lazy load EngineService for internal state effects to avoid circular dependency
    runInInjectionContext(this.injector, () => {
      inject(EngineService); // Ensure engine initialized
      effect(() => {
        const fps = this.loop.fps();
        this.state.fps.set(fps);
      });
    });

    this.loop.start((dt) => this.tick(dt));
  }

  private tick(rawDt: number) {
    // Clamp Delta Time for stability
    const dt = Math.min(rawDt, this.MAX_DT);
    
    this.totalTime += dt;

    // Iterate all systems
    for (const system of this.systems) {
      system.update(dt, this.totalTime);
    }
  }
}
