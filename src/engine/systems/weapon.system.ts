
import { Injectable, inject } from '@angular/core';
import { GameSystem } from '../system';
import { WeaponService } from '../features/combat/weapon.service';
import { EngineStateService } from '../engine-state.service';

@Injectable({ providedIn: 'root' })
export class WeaponSystem implements GameSystem {
    // Post-Animation, Pre-Render.
    // Ensures viewmodel is synced with latest camera/player position.
    readonly priority = 850;

    private weaponService = inject(WeaponService);
    private state = inject(EngineStateService);

    update(dt: number, totalTime: number): void {
        if (!this.state.isPaused()) {
            // RUN_CHRONOS: Combat logic runs on scaled time to respect Bullet Time
            const scale = this.state.timeScale();
            const scaledDt = dt * scale;
            this.weaponService.update(scaledDt);
        }
    }
}
