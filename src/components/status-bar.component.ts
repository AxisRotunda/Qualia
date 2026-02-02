
import { Component, inject, effect } from '@angular/core';
import { EngineService } from '../services/engine.service';
import { A11yService } from '../services/ui/a11y.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-between px-3 py-1 bg-slate-950 text-[10px] text-slate-500 font-mono select-none shrink-0 z-20 border-t border-cyan-900/30 relative"
         role="status" aria-label="Engine Telemetry">
      <!-- Glow Line -->
      <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>

      <!-- ARIA Live Region for System Announcements -->
      <div class="sr-only" aria-live="polite">{{ a11y.currentAnnouncement() }}</div>

      <div class="flex gap-4 items-center">
        <!-- System Status -->
        <span class="flex items-center gap-1.5 cursor-default min-w-[80px] group"
              [attr.aria-label]="'Simulation ' + (engine.isPaused() ? 'Halted' : 'Active')">
           <div class="w-1.5 h-1.5 rounded-sm transition-colors" 
                [class.bg-emerald-500]="!engine.isPaused()" 
                [class.bg-amber-500]="engine.isPaused()"
                [class.shadow-[0_0_5px_currentColor]]="true"></div>
           <span [class.text-slate-300]="!engine.isPaused()" [class.text-amber-500]="engine.isPaused()" class="tracking-wider font-bold">
             {{ engine.isPaused() ? 'HALTED' : 'ACTIVE' }}
           </span>
        </span>
        
        <span class="text-cyan-600 font-bold border border-cyan-900/50 bg-cyan-950/20 px-1.5 rounded text-[9px] tracking-widest uppercase">
            {{ engine.mode() }}
        </span>

        @if (engine.mode() === 'walk') {
            <span class="text-slate-500 hidden sm:inline opacity-70">WASD + SPACE</span>
        } @else {
            <div class="flex items-center gap-4 border-l border-slate-800 pl-4 ml-2">
                <span class="hover:text-cyan-400 cursor-default hidden sm:inline transition-colors">
                    ENTITIES <span class="text-slate-300 font-bold tabular-nums">{{ engine.objectCount() }}</span>
                </span>
                <span class="hover:text-cyan-400 cursor-default hidden sm:inline transition-colors truncate max-w-[150px]">
                    TARGET <span class="text-slate-300 font-bold">{{ engine.selectedEntity() !== null ? engine.selectedEntity() : 'VOID' }}</span>
                </span>
            </div>
        }
      </div>
      
      <div class="flex gap-4 items-center">
        <div class="flex items-center gap-3 border-r border-slate-800 pr-4 mr-2">
            <span class="hover:text-cyan-400 cursor-default hidden md:inline transition-colors" title="Physics Step Time">
                PHYS <span class="text-slate-300 tabular-nums">{{ engine.physicsTime() | number:'1.2-2' }}</span><span class="text-[9px] opacity-50 ml-0.5">ms</span>
            </span>
            <span class="hover:text-cyan-400 cursor-default hidden md:inline transition-colors" title="Render Time">
                REND <span class="text-slate-300 tabular-nums">{{ engine.renderTime() | number:'1.2-2' }}</span><span class="text-[9px] opacity-50 ml-0.5">ms</span>
            </span>
        </div>
        
        <span class="flex items-center gap-1.5 hover:text-cyan-400 cursor-default min-w-[50px] justify-end">
          <span class="text-slate-200 font-bold tabular-nums text-[11px]">{{ engine.fps() }}</span> FPS
        </span>
      </div>
    </div>
  `,
  styles: [`
    .tabular-nums { font-variant-numeric: tabular-nums; }
  `]
})
export class StatusBarComponent {
  engine = inject(EngineService);
  a11y = inject(A11yService);

  constructor() {
      // Monitor simulation state for accessibility announcements
      effect(() => {
          const paused = this.engine.isPaused();
          this.a11y.announce(`Simulation ${paused ? 'halted' : 'started'}`);
      });

      // Monitor mode changes
      effect(() => {
          const mode = this.engine.mode();
          this.a11y.announce(`System mode changed to ${mode}`);
      });
  }
}
