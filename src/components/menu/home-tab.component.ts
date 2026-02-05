import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EngineService } from '../../services/engine.service';
import { LevelManagerService } from '../../engine/features/level-manager.service';

@Component({
    selector: 'app-menu-home-tab',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="h-full flex flex-col animate-in slide-in-from-right-4 duration-300">
      <header class="mb-10 border-b border-white/8 pb-6">
        <h2 class="text-4xl sm:text-5xl font-black text-white tracking-[0.15em] uppercase leading-tight">Dashboard</h2>
        <p class="text-[9px] text-slate-500 font-mono tracking-widest mt-3 font-bold">SYSTEM_OVERVIEW_V1.0</p>
      </header>

      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Quick Actions -->
          <section class="space-y-6">
            <div class="flex items-center gap-3 mb-4">
              <span class="material-symbols-outlined text-cyan-500 text-xl">rocket_launch</span>
              <h3 class="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Quick Actions</h3>
            </div>

            <div class="space-y-4">
              <button
                (click)="onResume.emit()"
                [disabled]="!canContinue()"
                class="w-full p-6 rounded-2xl bg-gradient-to-br from-slate-900/60 to-slate-800/60 border border-white/10 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
                [class.hover:scale-105]="canContinue()">
                <div class="flex items-center justify-between">
                  <div class="text-left">
                    <div class="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">Resume Session</div>
                    <div class="text-[9px] text-slate-500 font-mono tracking-wider mt-1">{{ continueLabel() }}</div>
                  </div>
                  <span class="material-symbols-outlined text-2xl text-cyan-500 group-hover:text-cyan-300 transition-colors">play_arrow</span>
                </div>
              </button>

              <button
                (click)="newSandbox.emit()"
                class="w-full p-6 rounded-2xl bg-gradient-to-br from-slate-900/60 to-slate-800/60 border border-white/10 hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all duration-300 group">
                <div class="flex items-center justify-between">
                  <div class="text-left">
                    <div class="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">New Sandbox</div>
                    <div class="text-[9px] text-slate-500 font-mono tracking-wider mt-1">Initialize fresh environment</div>
                  </div>
                  <span class="material-symbols-outlined text-2xl text-emerald-500 group-hover:text-emerald-300 transition-colors">add_circle</span>
                </div>
              </button>
            </div>
          </section>

          <!-- System Status -->
          <section class="space-y-6">
            <div class="flex items-center gap-3 mb-4">
              <span class="material-symbols-outlined text-slate-600 text-xl">monitoring</span>
              <h3 class="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">System Status</h3>
            </div>

            <div class="space-y-4">
              <div class="p-6 rounded-2xl bg-gradient-to-br from-slate-900/60 to-slate-800/60 border border-white/10">
                <div class="flex items-center justify-between mb-4">
                  <div class="text-left">
                    <div class="text-sm font-bold text-white">Engine State</div>
                    <div class="text-[9px] text-slate-500 font-mono tracking-wider mt-1">Core systems status</div>
                  </div>
                  <span class="material-symbols-outlined text-2xl text-cyan-500">settings</span>
                </div>
                <div class="grid grid-cols-2 gap-4 text-[9px] font-mono">
                  <div class="flex justify-between">
                    <span class="text-slate-500">Physics</span>
                    <span class="text-emerald-400 font-bold">ACTIVE</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-500">Rendering</span>
                    <span class="text-emerald-400 font-bold">ACTIVE</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-500">Input</span>
                    <span class="text-emerald-400 font-bold">ACTIVE</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-500">Audio</span>
                    <span class="text-slate-500 font-bold">PENDING</span>
                  </div>
                </div>
              </div>

              <div class="p-6 rounded-2xl bg-gradient-to-br from-slate-900/60 to-slate-800/60 border border-white/10">
                <div class="flex items-center justify-between mb-4">
                  <div class="text-left">
                    <div class="text-sm font-bold text-white">Memory Usage</div>
                    <div class="text-[9px] text-slate-500 font-mono tracking-wider mt-1">Heap allocation</div>
                  </div>
                  <span class="material-symbols-outlined text-2xl text-cyan-500">memory</span>
                </div>
                <div class="text-[9px] font-mono text-slate-400">
                  <div class="flex justify-between mb-2">
                    <span>Allocated</span>
                    <span class="text-cyan-400">{{ (engine.objectCount() * 0.45).toFixed(1) }} MB</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Objects</span>
                    <span class="text-cyan-400">{{ engine.objectCount() }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 3px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
  `]
})
export class MenuHomeTabComponent {
    engine = inject(EngineService);
    levelManager = inject(LevelManagerService);

    canContinue = input.required<boolean>();
    continueLabel = input.required<string>();
    onResume = output<void>();
    newSandbox = output<void>();
}
