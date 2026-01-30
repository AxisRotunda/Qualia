
import { Injectable, inject } from '@angular/core';
import { GameSystem } from '../system';
import { ParticleService } from '../../services/particle.service';

@Injectable({ providedIn: 'root' })
export class EnvironmentSystem implements GameSystem {
  readonly priority = 100;
  private particleService = inject(ParticleService);

  update(dt: number): void {
    this.particleService.update(dt);
  }
}
