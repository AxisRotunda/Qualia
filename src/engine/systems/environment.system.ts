
import { Injectable, inject } from '@angular/core';
import { GameSystem } from '../system';
import { ParticleService } from '../../services/particle.service';
import { EngineStateService } from '../engine-state.service';
import { EnvironmentControlService } from '../features/environment-control.service';
import { CameraManagerService } from '../graphics/camera-manager.service';
import { BuoyancySystem } from './buoyancy.system';
import { GameInputService } from '../../services/game-input.service';

@Injectable({ providedIn: 'root' })
export class EnvironmentSystem implements GameSystem {
  readonly priority = 100;
  private particleService = inject(ParticleService);
  private state = inject(EngineStateService);
  private envControl = inject(EnvironmentControlService);
  private cameraManager = inject(CameraManagerService);
  private buoyancy = inject(BuoyancySystem);
  private input = inject(GameInputService);

  update(dt: number, totalTime: number): void {
    const cam = this.cameraManager.getCamera();
    const camPos = cam.position;
    
    // 1. Particle Physics (Weather)
    this.particleService.update(dt, camPos);

    // 2. Day/Night Cycle
    if (this.state.dayNightActive() && !this.state.isPaused()) {
        const timeScale = this.state.timeScale();
        const speed = this.state.dayNightSpeed(); 
        const dtSec = (dt / 1000) * timeScale;
        
        let newTime = this.state.timeOfDay() + (speed * dtSec);
        if (newTime >= 24) newTime -= 24;
        
        this.envControl.setTimeOfDay(newTime);
    }

    // 3. INDUSTRY: Camera Submersion Detection
    const waterLevel = this.state.waterLevel();
    if (waterLevel !== null) {
        const timeSec = (totalTime / 1000) * this.state.waveTimeScale();
        // Sample Wave Height at Camera position
        const waveH = this.buoyancy.getWaveHeight(camPos.x, camPos.z, timeSec);
        const surfaceY = waterLevel + waveH;
        
        const isSubmerged = camPos.y < surfaceY;
        
        if (isSubmerged !== this.state.isUnderwater()) {
            this.state.setUnderwater(isSubmerged);
            
            // Apply Dynamic Atmosphere Shift
            if (isSubmerged) {
                this.envControl.setAtmosphere('underwater');
                this.input.vibrate(20); // Surface breach feedback
            } else {
                // Revert to original biome atmosphere
                this.envControl.setAtmosphere(this.state.baseAtmosphere());
                this.input.vibrate(10);
            }
        }
    } else if (this.state.isUnderwater()) {
        // Fallback for scene reset
        this.state.setUnderwater(false);
        this.envControl.setAtmosphere(this.state.baseAtmosphere());
    }
  }
}
