
import { Component, input, output, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { EngineService } from '../../services/engine.service';

@Component({
  selector: 'app-menu-settings-tab',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  template: `
    <div class="max-w-2xl mx-auto animate-in fade-in duration-500">
      <header class="mb-10 border-b border-slate-800 pb-5">
        <h2 class="text-2xl font-black text-white tracking-[0.2em] uppercase">Configuration</h2>
        <p class="text-[10px] text-slate-500 font-mono tracking-widest mt-1">ENGINE_CORE_CALIBRATION_V6.1</p>
      </header>

      <div class="space-y-10">
        <!-- Visual Matrix -->
        <section>
          <div class="flex items-center gap-3 mb-6">
              <span class="material-symbols-outlined text-cyan-500 text-lg">visibility</span>
              <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Rendering Profile</h3>
          </div>
          
          <div class="bg-slate-950/60 rounded-2xl border border-white/5 p-2 space-y-1 backdrop-blur-sm">
            <div class="settings-row">
              <div>
                <div class="text-sm font-bold text-slate-200">Shadows & Textures</div>
                <div class="text-[10px] text-slate-500 tracking-wide uppercase font-bold mt-0.5">High-fidelity material stack</div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" [checked]="!isPerformanceMode()" (change)="togglePerformance.emit()" class="sr-only peer">
                <div class="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600 shadow-inner"></div>
              </label>
            </div>

            <div class="settings-row">
              <div>
                <div class="text-sm font-bold text-slate-200">Cinematic FX</div>
                <div class="text-[10px] text-slate-500 tracking-wide uppercase font-bold mt-0.5">Bloom, Grain & Lens Gradients</div>
              </div>
              <button (click)="engine.viewport.togglePostProcessing()" 
                      class="px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all uppercase border"
                      [class.bg-cyan-600]="engine.state.postProcessingEnabled()"
                      [class.border-cyan-400]="engine.state.postProcessingEnabled()"
                      [class.text-white]="engine.state.postProcessingEnabled()"
                      [class.bg-slate-900]="!engine.state.postProcessingEnabled()"
                      [class.border-white/5]="!engine.state.postProcessingEnabled()"
                      [class.text-slate-500]="!engine.state.postProcessingEnabled()">
                {{ engine.state.postProcessingEnabled() ? 'Online' : 'Offline' }}
              </button>
            </div>

            <div class="settings-row border-0">
              <div>
                <div class="text-sm font-bold text-slate-200">Mesh Topology</div>
                <div class="text-[10px] text-slate-500 tracking-wide uppercase font-bold mt-0.5">Global Wireframe Overlay</div>
              </div>
              <button (click)="toggleWireframe.emit()" 
                      class="px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all uppercase border"
                      [class.bg-cyan-600]="isWireframe()"
                      [class.border-cyan-400]="isWireframe()"
                      [class.text-white]="isWireframe()"
                      [class.bg-slate-900]="!isWireframe()"
                      [class.border-white/5]="!isWireframe()"
                      [class.text-slate-500]="!isWireframe()">
                {{ isWireframe() ? 'Active' : 'Hidden' }}
              </button>
            </div>
          </div>
        </section>

        <!-- Chronos Config -->
        <section>
          <div class="flex items-center gap-3 mb-6">
              <span class="material-symbols-outlined text-emerald-500 text-lg">history</span>
              <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Temporal Dilation</h3>
          </div>
          
          <div class="bg-slate-950/60 rounded-2xl border border-white/5 p-8 space-y-6 backdrop-blur-sm">
            <div class="flex justify-between items-center">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Physics Time Scale</span>
              <span class="text-sm font-mono font-black text-emerald-400 tabular-nums">{{ timeScale() | number:'1.2-2' }}x</span>
            </div>
            <div class="relative group">
                <input type="range" min="0.1" max="2.0" step="0.05"
                       [value]="timeScale()" 
                       (input)="emitTimeScale($event)"
                       class="w-full h-1.5 bg-slate-900 rounded-full appearance-none cursor-pointer border border-white/5 accent-emerald-500">
                <div class="absolute -bottom-6 left-0 right-0 flex justify-between text-[8px] font-mono text-slate-600 tracking-tighter uppercase font-bold">
                    <span>Bullet Time</span>
                    <span>Standard</span>
                    <span>Overclock</span>
                </div>
            </div>
          </div>
        </section>

        <!-- Audio Logic (Staged) -->
        <section class="opacity-40 select-none grayscale pointer-events-none">
          <div class="flex items-center gap-3 mb-6">
              <span class="material-symbols-outlined text-slate-600 text-lg">volume_up</span>
              <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Acoustic Signal</h3>
          </div>
          <div class="bg-slate-950/30 rounded-2xl border border-white/5 p-8 space-y-6">
            <div class="flex justify-between items-center text-[10px] font-black text-slate-600 uppercase tracking-widest">
              <span>Master Gain</span>
              <span>PENDING_ALLOCATION</span>
            </div>
            <div class="w-full h-1 bg-slate-900 rounded-full"></div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .settings-row { @apply flex items-center justify-between p-5 border-b border-white/5 transition-colors hover:bg-white/5; }
  `]
})
export class MenuSettingsTabComponent {
  engine = inject(EngineService);

  isPerformanceMode = input.required<boolean>();
  isWireframe = input.required<boolean>();
  timeScale = input.required<number>();
  
  togglePerformance = output<void>();
  toggleWireframe = output<void>();
  updateTimeScale = output<number>();

  emitTimeScale(e: Event) {
      const val = parseFloat((e.target as HTMLInputElement).value);
      this.updateTimeScale.emit(val);
  }
}
