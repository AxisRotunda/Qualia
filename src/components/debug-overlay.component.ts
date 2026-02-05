
import { Component, inject } from '@angular/core';
import { EngineService } from '../services/engine.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-debug-overlay',
    standalone: true,
    imports: [CommonModule],
    template: `
    @if (engine.showDebugOverlay()) {
      <div class="fixed bottom-10 left-3 z-50 pointer-events-none opacity-80 font-mono text-[9px] text-cyan-400 bg-slate-950/80 p-2 border border-slate-800 rounded shadow-xl backdrop-blur-sm min-w-[200px]">
        <div class="font-bold text-slate-500 mb-1 border-b border-slate-800 flex justify-between">
            <span>INVARIANT MONITOR</span>
            <span [class.text-emerald-400]="info().paused" [class.text-amber-400]="!info().paused">
              {{ info().paused ? 'PAUSED' : 'RUNNING' }}
            </span>
        </div>

        <div class="flex flex-col gap-0.5">
          <!-- Row 1: Physics Activity -->
          <div class="flex justify-between gap-4">
            <span class="text-slate-400">BODIES</span>
            <span class="text-white">
                {{ info().activeBodyCount }} <span class="text-slate-600">/</span> {{ info().bodyCount }}
                <span class="text-slate-500 ml-1">({{ info().sleepingBodyCount }} Zzz)</span>
            </span>
          </div>

          <!-- Row 2: Render Workload -->
          <div class="flex justify-between gap-4">
            <span class="text-slate-400">MESHES</span>
            <span class="text-white">
                {{ info().visibleMeshCount }} <span class="text-slate-600">/</span> {{ info().totalMeshCount }}
            </span>
          </div>

          <!-- Row 3: Memory / Sparse Set -->
          <div class="flex justify-between gap-4">
            <span class="text-slate-400">STORE</span>
            <span class="text-slate-300">
                T:{{ info().transformCount }} <span class="text-slate-700">|</span> M:{{ info().totalMeshCount }}
            </span>
          </div>
        </div>
      </div>
    }
  `
})
export class DebugOverlayComponent {
    engine = inject(EngineService);
    info = this.engine.debugInfo;
}
