
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
        this.state.togglePaused();
    }

    setPaused(v: boolean) {
        this.state.setPaused(v);
    }

    setTimeScale(val: number) {
        this.state.setTimeScale(val);
    }

    setGravity(y: number) {
        this.state.setGravity(y);
        this.physics.setGravity(y);
    }
}
