
import { Injectable, inject } from '@angular/core';
import { EngineStateService } from '../engine-state.service';
import { PhysicsService } from '../../services/physics.service';

@Injectable({
  providedIn: 'root'
})
export class SimulationService {
  private state = inject(EngineStateService);
  private physics = inject(PhysicsService);

  togglePause() {
    this.state.isPaused.update(v => !v);
  }

  setPaused(v: boolean) {
    this.state.isPaused.set(v);
  }

  setTimeScale(val: number) {
    this.state.timeScale.set(val);
  }

  setGravity(y: number) {
    this.state.gravityY.set(y);
    this.physics.setGravity(y);
  }
}
