
import { Component, input, inject, computed } from '@angular/core';
import { EngineService } from '../services/engine.service';

@Component({
  selector: 'app-status-bar',
  standalone: true,
  template: `
    <div class="flex items-center justify-between px-3 py-1 bg-slate-950 
                border-t border-slate-800 text-[10px] text-slate-500 font-mono select-none">
      <div class="flex gap-4">
        <span class="hover:text-cyan-400 cursor-default">ENTITIES: <span class="text-slate-300">{{ engine.objectCount() }}</span></span>
        <span class="hover:text-cyan-400 cursor-default">SELECTED: <span class="text-slate-300">{{ engine.selectedEntity() ?? 'NONE' }}</span></span>
      </div>
      
      <div class="flex gap-4">
        <span class="flex items-center gap-1.5 hover:text-cyan-400 cursor-default">
          <span class="w-1.5 h-1.5 rounded-full" 
                [class.bg-emerald-500]="engine.fps() >= 55"
                [class.bg-amber-500]="engine.fps() >= 30 && engine.fps() < 55"
                [class.bg-rose-500]="engine.fps() < 30"></span>
          {{ engine.fps() }} FPS
        </span>
      </div>
    </div>
  `
})
export class StatusBarComponent {
  engine = inject(EngineService);
}
