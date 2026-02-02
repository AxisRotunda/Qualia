
import { Injectable, inject, effect, Injector, runInInjectionContext } from '@angular/core';
import { GameLoopService } from '../../services/game-loop.service';
import { EngineStateService } from '../engine-state.service';
import { EngineService } from '../../services/engine.service';
import { GameSystem } from '../system';
import { InputSystem } from '../systems/input.system';
import { EnvironmentSystem } from '../systems/environment.system';
import { SceneLogicSystem } from '../systems/scene-logic.system';
import { PhysicsSystem } from '../systems/physics.system';
import { RepairSystem } from '../systems/repair.system';
import { DestructionSystem } from '../systems/destruction.system';
import { RenderSystem } from '../systems/render.system';
import { StatisticsSystem } from '../systems/statistics.system';
import { BuoyancySystem } from '../systems/buoyancy.system';
import { KinematicSystem } from '../systems/kinematic.system';
import { MaterialAnimationSystem } from '../systems/material-animation.system';
import { CityTrafficSystem } from '../systems/city-traffic.system';
import { AnimationSystem } from '../systems/animation.system';
import { CombatSystem } from '../systems/combat.system';
import { VfxSystem } from '../systems/vfx.system';
import { WeaponSystem } from '../systems/weapon.system';
import { BehaviorSystem } from '../systems/behavior.system';
import { TelemetrySystem } from '../systems/telemetry.system';
import { TerrainManagerService } from '../features/terrain-manager.service';

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
  private readonly MAX_DT = 100; 

  constructor() {
    // Initialize Systems Order
    this.systems = [
      inject(InputSystem),
      inject(EnvironmentSystem),
      inject(SceneLogicSystem),
      inject(BehaviorSystem), 
      inject(KinematicSystem),
      inject(BuoyancySystem),
      inject(CombatSystem), 
      inject(PhysicsSystem),
      inject(DestructionSystem), 
      inject(RepairSystem), 
      inject(CityTrafficSystem), 
      inject(AnimationSystem), 
      inject(MaterialAnimationSystem),
      inject(WeaponSystem), 
      inject(VfxSystem), 
      inject(TerrainManagerService), // Priority 890: Cull before render
      inject(RenderSystem),
      inject(TelemetrySystem), // Gather data after render
      inject(StatisticsSystem)
    ].sort((a, b) => a.priority - b.priority);
  }

  init() {
    runInInjectionContext(this.injector, () => {
      inject(EngineService);
      effect(() => {
        const fps = this.loop.fps();
        this.state.setFps(fps);
      });
    });

    this.loop.start((dt) => this.tick(dt));
  }

  private tick(rawDt: number) {
    const dt = Math.min(rawDt, this.MAX_DT);
    this.totalTime += dt;

    for (const system of this.systems) {
      system.update(dt, this.totalTime);
    }
  }
}
