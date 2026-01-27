
import { Component, inject } from '@angular/core';
import { EngineService } from '../services/engine.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-between px-3 py-1 bg-slate-950 
                border-t border-slate-800 text-[10px] text-slate-500 font-mono select-none shrink-0 z-20">
      <div class="flex gap-4">
        <span class="flex items-center gap-1.5 cursor-default min-w-[80px]">
           <div class="w-1.5 h-1.5 rounded-full" 
                [class.bg-emerald-500]="!engine.isPaused()" 
                [class.bg-amber-500]="engine.isPaused()"></div>
           <span [class.text-slate-300]="!engine.isPaused()" [class.text-amber-500]="engine.isPaused()">
             {{ engine.isPaused() ? 'PAUSED' : 'RUNNING' }}
           </span>
        </span>
        
        <span class="text-cyan-600 font-bold border border-cyan-900/50 bg-cyan-950/20 px-1 rounded">
            {{ engine.mode() | uppercase }}
        </span>

        <span class="hover:text-cyan-400 cursor-default hidden sm:inline">ENTITIES: <span class="text-slate-300">{{ engine.objectCount() }}</span></span>
        <span class="hover:text-cyan-400 cursor-default hidden sm:inline">SELECTED: <span class="text-slate-300">{{ engine.selectedEntity() ?? 'NONE' }}</span></span>
      </div>
      
      <div class="flex gap-4 items-center">
        <span class="hover:text-cyan-400 cursor-default hidden md:inline" title="Physics Step Time">PHYS: <span class="text-slate-300">{{ engine.physicsTime() }}ms</span></span>
        <span class="hover:text-cyan-400 cursor-default hidden md:inline" title="Render Time">RENDER: <span class="text-slate-300">{{ engine.renderTime() }}ms</span></span>
        
        <div class="h-3 w-px bg-slate-800 mx-1 hidden md:block"></div>
        
        <span class="flex items-center gap-1.5 hover:text-cyan-400 cursor-default min-w-[50px] justify-end">
          {{ engine.fps() }} FPS
        </span>
      </div>
    </div>
  `
})
export class StatusBarComponent {
  engine = inject(EngineService);
}
    