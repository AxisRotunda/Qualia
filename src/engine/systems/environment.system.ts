
import { Injectable, inject } from '@angular/core';
import { GameSystem } from '../system';
import { ParticleService } from '../../services/particle.service';
import { EngineStateService } from '../engine-state.service';
import { EnvironmentControlService } from '../features/environment-control.service';
import { CameraManagerService } from '../graphics/camera-manager.service';

@Injectable({ providedIn: 'root' })
export class EnvironmentSystem implements GameSystem {
  readonly priority = 100;
  private particleService = inject(ParticleService);
  private state = inject(EngineStateService);
  private envControl = inject(EnvironmentControlService);
  private cameraManager = inject(CameraManagerService);

  update(dt: number): void {
    // 1. Particle Physics (Weather)
    // Pass camera position directly to avoid scene graph traversal
    const cam = this.cameraManager.getCamera();
    this.particleService.update(dt, cam.position);

    // 2. Day/Night Cycle
    if (this.state.dayNightActive() && !this.state.isPaused()) {
        const speed = this.state.dayNightSpeed(); // Hours per second
        const dtSec = dt / 1000;
        
        let newTime = this.state.timeOfDay() + (speed * dtSec);
        if (newTime >= 24) newTime -= 24;
        
        // Update Signal (triggers UI) & Visuals via Feature Service
        // Use envControl (Logic) not envManager (Renderer)
        this.envControl.setTimeOfDay(newTime);
    }
  }
}