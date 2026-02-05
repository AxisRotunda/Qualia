
import { Component, input, output, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { EngineService } from '../../services/engine.service';

@Component({
    selector: 'app-menu-settings-tab',
    standalone: true,
    imports: [CommonModule, DecimalPipe],
    template: `
    <div class="max-w-3xl animate-in fade-in duration-500">
      <header class="mb-10 border-b border-white/8 pb-6">
        <h2 class="text-4xl sm:text-5xl font-black text-white tracking-[0.15em] uppercase leading-tight">Configuration</h2>
        <p class="text-[9px] text-slate-500 font-mono tracking-widest mt-3 font-bold">ENGINE_CORE_CALIBRATION_V6.1</p>
      </header>

      <div class="space-y-10 pb-8">
        <!-- Visual Matrix -->
        <section>
          <div class="flex items-center gap-3 mb-8">
              <span class="material-symbols-outlined text-cyan-500 text-xl">visibility</span>
              <h3 class="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Rendering Profile</h3>
          </div>

          <div class="bg-slate-950/50 rounded-2xl border border-white/8 p-2 space-y-1 backdrop-blur-md">
            <div class="settings-row">
              <div>
                <div class="text-sm font-bold text-slate-200">Shadows & Textures</div>
                <div class="text-[9px] text-slate-500 tracking-wide uppercase font-bold mt-1">High-fidelity material stack</div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" [checked]="!isPerformanceMode()" (change)="togglePerformance.emit()" class="sr-only peer">
                <div class="w-12 h-7 bg-slate-800 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:start-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600 shadow-inner hover:shadow-cyan-600/20"></div>
              </label>
            </div>

            <div class="settings-row">
              <div>
                <div class="text-sm font-bold text-slate-200">Cinematic FX</div>
                <div class="text-[9px] text-slate-500 tracking-wide uppercase font-bold mt-1">Bloom, Grain & Lens Gradients</div>
              </div>
              <button (click)="engine.viewport.togglePostProcessing()"
                      class="px-5 py-2 rounded-lg text-[9px] font-black tracking-widest transition-all uppercase border duration-300"
                      [class.bg-cyan-600/80]="engine.state.postProcessingEnabled()"
                      [class.border-cyan-400/60]="engine.state.postProcessingEnabled()"
                      [class.hover:bg-cyan-600]="engine.state.postProcessingEnabled()"
                      [class.text-white]="engine.state.postProcessingEnabled()"
                      [class.bg-slate-900/60]="!engine.state.postProcessingEnabled()"
                      [class.border-white/5]="!engine.state.postProcessingEnabled()"
                      [class.hover:bg-slate-800/60]="!engine.state.postProcessingEnabled()"
                      [class.text-slate-500]="!engine.state.postProcessingEnabled()"
                      [class.hover:text-slate-300]="!engine.state.postProcessingEnabled()">
                {{ engine.state.postProcessingEnabled() ? 'Online' : 'Offline' }}
              </button>
            </div>

            <div class="settings-row border-0">
              <div>
                <div class="text-sm font-bold text-slate-200">Mesh Topology</div>
                <div class="text-[9px] text-slate-500 tracking-wide uppercase font-bold mt-1">Global Wireframe Overlay</div>
              </div>
              <button (click)="toggleWireframe.emit()"
                      class="px-5 py-2 rounded-lg text-[9px] font-black tracking-widest transition-all uppercase border duration-300"
                      [class.bg-cyan-600/80]="isWireframe()"
                      [class.border-cyan-400/60]="isWireframe()"
                      [class.hover:bg-cyan-600]="isWireframe()"
                      [class.text-white]="isWireframe()"
                      [class.bg-slate-900/60]="!isWireframe()"
                      [class.border-white/5]="!isWireframe()"
                      [class.hover:bg-slate-800/60]="!isWireframe()"
                      [class.text-slate-500]="!isWireframe()"
                      [class.hover:text-slate-300]="!isWireframe()">
                {{ isWireframe() ? 'Active' : 'Hidden' }}
              </button>
            </div>
          </div>
        </section>

        <!-- Chronos Config -->
        <section>
          <div class="flex items-center gap-3 mb-8">
              <span class="material-symbols-outlined text-emerald-500 text-xl">history</span>
              <h3 class="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Temporal Dilation</h3>
          </div>

          <div class="bg-slate-950/50 rounded-2xl border border-white/8 p-8 space-y-7 backdrop-blur-md">
            <div class="flex justify-between items-center">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Physics Time Scale</span>
              <span class="text-lg font-mono font-black text-emerald-400 tabular-nums tracking-tighter">{{ timeScale() | number:'1.2-2' }}x</span>
            </div>
            <div class="relative group">
                <input type="range" min="0.1" max="2.0" step="0.05"
                       [value]="timeScale()"
                       (input)="emitTimeScale($event)"
                       class="w-full h-2 bg-slate-900 rounded-full appearance-none cursor-pointer border border-white/8 accent-emerald-500 transition-shadow hover:shadow-emerald-600/20 hover:shadow-lg">
                <div class="absolute -bottom-7 left-0 right-0 flex justify-between text-[8px] font-mono text-slate-600 tracking-tighter uppercase font-bold">
                    <span>Bullet Time</span>
                    <span>Standard</span>
                    <span>Overclock</span>
                </div>
            </div>
          </div>
        </section>

        <!-- Audio Logic (Staged) -->
        <section class="opacity-50 select-none">
          <div class="flex items-center gap-3 mb-8">
              <span class="material-symbols-outlined text-slate-600 text-xl">volume_up</span>
              <h3 class="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Acoustic Signal</h3>
          </div>
          <div class="bg-slate-950/30 rounded-2xl border border-white/5 p-8 space-y-6 backdrop-blur-sm cursor-not-allowed">
            <div class="flex justify-between items-center text-[10px] font-black text-slate-600 uppercase tracking-widest">
              <span>Master Gain</span>
              <span class="text-slate-700 text-[9px]">PENDING_ALLOCATION</span>
            </div>
            <div class="w-full h-1.5 bg-slate-900 rounded-full border border-white/5"></div>
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
