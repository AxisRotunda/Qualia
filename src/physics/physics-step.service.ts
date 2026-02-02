
import { Injectable } from '@angular/core';
import RAPIER from '@dimforge/rapier3d-compat';

@Injectable({
  providedIn: 'root'
})
export class PhysicsStepService {
  // Fixed Timestep Logic (60Hz)
  private accumulator = 0;
  private readonly stepSize = 1 / 60; 
  private readonly maxFrameTime = 0.1; 

  step(world: RAPIER.World, eventQueue: RAPIER.EventQueue, dtMs: number, onStep: () => void) {
    let dtSec = dtMs / 1000;
    
    // RUN_REPAIR: Guard against non-finite delta times which crash Rapier WASM
    if (!Number.isFinite(dtSec) || dtSec <= 0) return;

    if (dtSec > this.maxFrameTime) {
        dtSec = this.maxFrameTime;
    }

    this.accumulator += dtSec;
    
    let steps = 0;
    const MAX_STEPS = 5;

    while (this.accumulator >= this.stepSize) {
      world.step(eventQueue);
      onStep(); // Drain events or other per-step logic
      
      this.accumulator -= this.stepSize;
      steps++;
      
      if (steps >= MAX_STEPS) {
          this.accumulator = 0;
          break;
      }
    }
  }

  reset() {
      this.accumulator = 0;
  }

  getAlpha(): number {
      return this.accumulator / this.stepSize;
  }
}
