
import { Injectable, inject } from '@angular/core';
import { GameSystem } from '../system';
import { ParticleService } from '../../services/particle.service';
import { EngineStateService } from '../engine-state.service';
import { EnvironmentManagerService } from '../graphics/environment-manager.service';

@Injectable({ providedIn: 'root' })
export class EnvironmentSystem implements GameSystem {
  readonly priority = 100;
  private particleService = inject(ParticleService);
  private state = inject(EngineStateService);
  private envManager = inject(EnvironmentManagerService);

  update(dt: number): void {
    // 1. Particle Physics (Weather)
    this.particleService.update(dt);

    // 2. Day/Night Cycle
    if (this.state.dayNightActive() && !this.state.isPaused()) {
        const speed = this.state.dayNightSpeed(); // Hours per second
        const dtSec = dt / 1000;
        
        let newTime = this.state.timeOfDay() + (speed * dtSec);
        if (newTime >= 24) newTime -= 24;
        
        // Update Signal (triggers UI)
        this.state.timeOfDay.set(newTime);
        
        // Update Visuals
        this.envManager.setTimeOfDay(newTime);
    }
  }
}
