
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu-home-tab',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 class="text-2xl font-bold text-white mb-1">Welcome Back</h2>
        <p class="text-slate-400 text-sm">Resume your simulation or start a new experiment.</p>
      </header>

      <!-- Hero Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Resume -->
        <button (click)="resume.emit()" 
                [disabled]="!canContinue()"
                class="group relative h-40 rounded-2xl overflow-hidden text-left border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 hover:border-cyan-500/50 transition-all shadow-lg hover:shadow-cyan-900/20 disabled:opacity-50">
          <div class="absolute inset-0 bg-slate-950/50 group-hover:bg-transparent transition-colors"></div>
          <div class="absolute bottom-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <span class="material-symbols-outlined text-9xl transform translate-x-4 translate-y-4">resume</span>
          </div>
          <div class="relative p-6 h-full flex flex-col justify-end z-10">
            <div class="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-auto border border-cyan-500/30">
              <span class="material-symbols-outlined">play_arrow</span>
            </div>
            <h3 class="text-lg font-bold text-white group-hover:text-cyan-200">{{ continueLabel() }}</h3>
            <p class="text-xs text-slate-400 mt-1">Load local snapshot</p>
          </div>
        </button>

        <!-- New Empty -->
        <button (click)="newSandbox.emit()" 
                class="group relative h-40 rounded-2xl overflow-hidden text-left border border-slate-700 bg-slate-900/50 hover:bg-slate-800 transition-all">
          <div class="relative p-6 h-full flex flex-col justify-end z-10">
            <div class="w-10 h-10 rounded-full bg-slate-700/50 text-slate-300 flex items-center justify-center mb-auto border border-slate-600">
              <span class="material-symbols-outlined">add</span>
            </div>
            <h3 class="text-lg font-bold text-slate-200 group-hover:text-white">New Sandbox</h3>
            <p class="text-xs text-slate-500 mt-1">Start from empty void</p>
          </div>
        </button>
      </div>

      <!-- Stats / Info -->
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-slate-950/30 rounded-xl p-4 border border-slate-800">
          <div class="text-[10px] text-slate-500 uppercase font-bold mb-1">FPS Target</div>
          <div class="text-xl font-mono text-emerald-400">60</div>
        </div>
        <div class="bg-slate-950/30 rounded-xl p-4 border border-slate-800">
          <div class="text-[10px] text-slate-500 uppercase font-bold mb-1">Engine</div>
          <div class="text-xl font-mono text-blue-400">Rapier</div>
        </div>
        <div class="bg-slate-950/30 rounded-xl p-4 border border-slate-800">
          <div class="text-[10px] text-slate-500 uppercase font-bold mb-1">Version</div>
          <div class="text-xl font-mono text-purple-400">0.4.0</div>
        </div>
      </div>
    </div>
  `
})
export class MenuHomeTabComponent {
  canContinue = input.required<boolean>();
  continueLabel = input.required<string>();
  
  resume = output<void>();
  newSandbox = output<void>();
}
