
import { Component, input, output, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { EngineService } from '../../../services/engine.service';
import { EnvironmentControlService } from '../../../engine/features/environment-control.service';

@Component({
  selector: 'app-world-light-tab',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  template: `
    <div class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div class="bg-slate-950/40 p-4 rounded-xl border border-white/5">
            <div class="flex justify-between items-center mb-4">
                <label class="section-title">Day/Night Cycle</label>
                <button (click)="toggleCycle()" 
                        class="w-8 h-8 rounded bg-slate-800 border border-white/10 flex items-center justify-center transition-colors"
                        [class.active-cycle]="engine.state.dayNightActive()">
                    <span class="material-symbols-outlined text-lg">{{ engine.state.dayNightActive() ? 'pause' : 'play_arrow' }}</span>
                </button>
            </div>
            <input type="range" min="0" max="1.0" step="0.01" 
                   [value]="engine.state.dayNightSpeed()" (input)="updateCycleSpeed($event)"
                   class="modern-range accent-cyan-500">
        </div>

        <div class="space-y-3">
            <div class="flex justify-between items-end">
                <label class="section-title">Chronos Sync</label>
                <span class="text-xl font-mono font-bold text-cyan-400 tabular-nums">{{ formatTime(currentTime()) }}</span>
            </div>
            <input type="range" min="0" max="24" step="0.1" 
                   [value]="currentTime()" (input)="emitTime($event)"
                   class="modern-range">
        </div>

        <div class="h-px bg-white/5"></div>

        <div class="space-y-4">
            <label class="section-title">Calibration</label>
            <div class="control-row">
                <span class="row-label">Solar Power</span>
                <input type="range" min="0" max="10" step="0.1" 
                       [value]="engine.state.sunIntensity()" (input)="updateSunInt($event)"
                       class="modern-range">
                <span class="val-pill">{{ engine.state.sunIntensity() | number:'1.1-1' }}</span>
            </div>
            <div class="control-row">
                <span class="row-label">Ambient Fill</span>
                <input type="range" min="0" max="2" step="0.05" 
                       [value]="engine.state.ambientIntensity()" (input)="updateAmbient($event)"
                       class="modern-range">
                <span class="val-pill">{{ engine.state.ambientIntensity() | number:'1.2-2' }}</span>
            </div>
            <div class="control-row">
                <span class="row-label">Solar Color</span>
                <input type="color" [value]="engine.state.sunColor()" (input)="updateSunColor($event)"
                       class="flex-1 h-8 rounded border border-white/10 bg-transparent cursor-pointer p-0.5">
            </div>
        </div>
    </div>
  `,
  styles: [`
    .section-title { @apply text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]; }
    .modern-range { @apply w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer border border-white/5 relative; }
    .modern-range::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; background: white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.5); margin-top: -6px; border: 2px solid #1e293b; }
    .control-row { @apply flex items-center gap-4; }
    .row-label { @apply text-[9px] font-bold text-slate-500 uppercase whitespace-nowrap min-w-[80px]; }
    .val-pill { @apply min-w-[32px] text-right font-mono text-[10px] text-cyan-500; }
    .active-cycle { @apply bg-cyan-600 text-white; }
  `]
})
export class WorldLightTabComponent {
  engine = inject(EngineService);
  envControl = inject(EnvironmentControlService);

  currentTime = input.required<number>();
  timeChange = output<number>();

  formatTime(val: number): string {
      const h = Math.floor(val) % 24;
      const m = Math.floor((val % 1) * 60);
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  toggleCycle() {
      this.envControl.toggleDayNightCycle(!this.engine.state.dayNightActive());
  }

  updateCycleSpeed(e: Event) {
      const val = parseFloat((e.target as HTMLInputElement).value);
      this.envControl.setCycleSpeed(val);
  }

  emitTime(e: Event) {
      const val = parseFloat((e.target as HTMLInputElement).value);
      this.timeChange.emit(val);
  }

  updateSunInt(e: Event) { 
      const val = parseFloat((e.target as HTMLInputElement).value);
      this.engine.state.setSunIntensity(val); 
      this.envControl.setLightSettings({}); 
  }
  
  updateAmbient(e: Event) { 
      const val = parseFloat((e.target as HTMLInputElement).value);
      this.engine.state.setAmbientIntensity(val); 
      this.envControl.setLightSettings({}); 
  }
  
  updateSunColor(e: Event) { 
      const val = (e.target as HTMLInputElement).value;
      this.engine.state.setSunColor(val); 
      this.envControl.setLightSettings({}); 
  }
}
