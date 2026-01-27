
import { Component, inject } from '@angular/core';
import { EngineService } from '../services/engine.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-debug-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-10 left-3 z-50 pointer-events-none opacity-80 font-mono text-[10px] text-cyan-400 bg-slate-950/80 p-2 border border-slate-800 rounded">
      <div class="font-bold text-slate-500 mb-1 border-b border-slate-800">INVARIANT MONITOR</div>
      <div class="flex flex-col gap-0.5">
        <div class="flex justify-between gap-4">
          <span>STATE</span>
          <span [class.text-emerald-400]="info().paused" [class.text-amber-400]="!info().paused">
            {{ info().paused ? 'PAUSED' : 'RUNNING' }}
          </span>
        </div>
        <div class="flex justify-between gap-4">
           <span>BODIES STEPPED</span>
           <span class="text-white">{{ info().bodyCount }}</span>
        </div>
        <div class="flex justify-between gap-4">
           <span>SINGLE UPDS</span>
           <span class="text-slate-300">{{ info().singleUpdate ?? 'NONE' }}</span>
        </div>
      </div>
    </div>
  `
})
export class DebugOverlayComponent {
  engine = inject(EngineService);
  info = this.engine.debugInfo;
}
