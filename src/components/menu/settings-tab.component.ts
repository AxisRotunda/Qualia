
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu-settings-tab',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-2xl mx-auto animate-in fade-in duration-300">
      <header class="mb-8 border-b border-slate-800 pb-4">
        <h2 class="text-xl font-bold text-white">Engine Settings</h2>
      </header>

      <div class="space-y-8">
        <!-- Graphics -->
        <section>
          <h3 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Graphics</h3>
          <div class="bg-slate-950/50 rounded-xl border border-slate-800 p-1">
            <div class="flex items-center justify-between p-4 border-b border-slate-800/50">
              <div>
                <div class="text-sm font-bold text-slate-200">Shadows & Textures</div>
                <div class="text-xs text-slate-500">Enable for higher fidelity, disable for performance.</div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" [checked]="!isPerformanceMode()" (change)="togglePerformance.emit()" class="sr-only peer">
                <div class="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>
            <div class="flex items-center justify-between p-4">
              <div>
                <div class="text-sm font-bold text-slate-200">Wireframe Overlay</div>
                <div class="text-xs text-slate-500">Show mesh topology.</div>
              </div>
              <button (click)="toggleWireframe.emit()" 
                      [class.bg-cyan-600]="isWireframe()"
                      [class.bg-slate-700]="!isWireframe()"
                      class="px-3 py-1 rounded text-xs font-bold text-white transition-colors">
                {{ isWireframe() ? 'ON' : 'OFF' }}
              </button>
            </div>
          </div>
        </section>

        <!-- Audio (Placeholder) -->
        <section>
          <h3 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Audio</h3>
          <div class="bg-slate-950/50 rounded-xl border border-slate-800 p-6 space-y-4 opacity-75">
            <div class="flex justify-between items-center text-xs">
              <span class="text-slate-400">Master Volume</span>
              <span class="text-slate-500 font-mono">100%</span>
            </div>
            <input type="range" class="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" disabled>
            <p class="text-[10px] text-amber-500/80 italic">Audio engine not loaded.</p>
          </div>
        </section>
      </div>
    </div>
  `
})
export class MenuSettingsTabComponent {
  isPerformanceMode = input.required<boolean>();
  isWireframe = input.required<boolean>();
  
  togglePerformance = output<void>();
  toggleWireframe = output<void>();
}
