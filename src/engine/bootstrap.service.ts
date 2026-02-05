
import { Injectable, inject } from '@angular/core';
import { EngineStateService } from './engine-state.service';
import { EngineRuntimeService } from './runtime/engine-runtime.service';
import { InputManagerService } from './input-manager.service';
import { SubsystemsService } from './subsystems.service';
import { LevelManagerService } from './features/level-manager.service';
import { InteractionService } from './interaction.service';
import { DebugService } from '../services/debug.service';
import type { EngineService } from '../services/engine.service';

@Injectable({
    providedIn: 'root'
})
export class BootstrapService {
    private state = inject(EngineStateService);
    private runtime = inject(EngineRuntimeService);
    private sys = inject(SubsystemsService);
    private level = inject(LevelManagerService);
    private input = inject(InputManagerService);
    private interaction = inject(InteractionService);
    private debugService = inject(DebugService);

    async init(canvas: HTMLCanvasElement, engine: EngineService) {
        try {
            // 1. Initialize Core Systems (Physics & Graphics)
            await this.sys.physics.init();
            this.sys.scene.init(canvas);

            // RUN_THREAD: Warm up procedural generation pool
            (this.sys.assets as any).natureGen?.terrain?.warmup();

            // 2. Bind Input & Interaction
            this.interaction.bind(canvas);
            this.input.init();

            // 3. Initialize Debug Tools
            this.debugService.init(engine);

            // 4. Start Runtime Loop
            this.state.setLoading(false);
            this.runtime.init();

            // 5. Load Default Level
            // RUN_SCENE_OPT: Switched to 'proving-grounds'
            this.level.loadScene(engine, 'proving-grounds');

        } catch (err) {
            console.error('CRITICAL: Engine Boot Sequence Failed', err);
        }
    }
}
