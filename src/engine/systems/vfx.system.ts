
import { Injectable, inject } from '@angular/core';
import { GameSystem } from '../system';
import { VfxService } from '../features/vfx/vfx.service';
import { EngineStateService } from '../engine-state.service';

@Injectable({ providedIn: 'root' })
export class VfxSystem implements GameSystem {
    readonly priority = 950; // Pre-render, Post-logic

    private vfx = inject(VfxService);
    private state = inject(EngineStateService);

    update(dt: number): void {
        if (!this.state.isPaused()) {
            this.vfx.update(dt / 1000);
        }
    }
}
