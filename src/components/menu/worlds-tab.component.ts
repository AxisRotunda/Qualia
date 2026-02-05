
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScenePreset } from '../../data/scene-definitions';

@Component({
  selector: 'app-menu-worlds-tab',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col animate-in slide-in-from-right-4 duration-300">
      <!-- Header -->
      <header class="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-white/8 pb-6 shrink-0 gap-4">
        <div>
          <h2 class="text-4xl sm:text-5xl font-black text-white tracking-[0.15em] uppercase leading-tight">Simulations</h2>
          <div class="flex items-center gap-2 text-[9px] mt-3 text-slate-500 font-mono tracking-widest">
              <span class="px-2.5 py-1 bg-slate-900/60 border border-slate-800/40 rounded-md text-cyan-500 font-bold">{{ scenes().length }}</span>
              <span class="font-bold">AVAILABLE_PRESETS</span>
          </div>
        </div>
        
        <div class="hidden sm:flex gap-2">
            <button class="px-3.5 py-2 text-[9px] font-black bg-cyan-900/40 text-cyan-400 border border-cyan-500/40 rounded-lg tracking-widest uppercase hover:bg-cyan-500/30 hover:border-cyan-500/60 transition-all active:scale-95">All</button>
            <button class="px-3.5 py-2 text-[9px] font-black bg-slate-900/40 text-slate-500 border border-slate-800/40 rounded-lg tracking-widest uppercase hover:text-slate-300 hover:bg-slate-800/40 transition-all active:scale-95">Planetary</button>
            <button class="px-3.5 py-2 text-[9px] font-black bg-slate-900/40 text-slate-500 border border-slate-800/40 rounded-lg tracking-widest uppercase hover:text-slate-300 hover:bg-slate-800/40 transition-all active:scale-95">Orbital</button>
        </div>
      </header>

      <!-- Scrollable Grid -->
      <div class="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-12">
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            @for (s of scenes(); track s.id) {
            <button (click)="loadScene.emit(s.id)" 
                    class="group relative h-72 rounded-2xl overflow-hidden border border-white/10 bg-slate-950/60 text-left transition-all hover:scale-[1.02] hover:border-cyan-500/50 hover:shadow-[0_0_40px_rgba(6,182,212,0.15)] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-slate-950 backdrop-blur-sm">
                
                <!-- Theme Base Gradient -->
                <div class="absolute inset-0 bg-gradient-to-br opacity-20 group-hover:opacity-35 transition-opacity duration-700" 
                     [ngClass]="s.previewColor"></div>
                
                <!-- Noise & Scanline Overlay -->
                <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-8 mix-blend-overlay"></div>
                <div class="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,4px_100%] pointer-events-none opacity-15"></div>

                <!-- Hover Scan Animation -->
                <div class="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/15 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1200 ease-in-out pointer-events-none opacity-60"></div>

                <!-- Content Matrix -->
                <div class="absolute inset-0 p-7 flex flex-col z-10">
                    
                    <!-- Top Logic: Profiling Badges -->
                    <div class="flex justify-between items-start mb-auto gap-3">
                        <div class="flex flex-wrap gap-2">
                            <span class="badge border-cyan-500/30 text-cyan-400 bg-cyan-950/40">
                                {{ getGravityLabel(s.id, s.theme) }}
                            </span>
                            <span class="badge border-white/10 text-white/60 bg-white/5 uppercase">
                                {{ s.theme }}
                            </span>
                        </div>
                        
                        <div class="w-12 h-12 rounded-xl bg-black/50 backdrop-blur-lg flex items-center justify-center border border-white/10 group-hover:border-cyan-400/50 group-hover:bg-black/70 transition-all shadow-lg">
                            <span class="material-symbols-outlined text-white/50 group-hover:text-cyan-400 transition-colors text-3xl group-hover:scale-110 duration-300">{{ getSceneIcon(s.theme) }}</span>
                        </div>
                    </div>

                    <!-- Description Domain -->
                    <div class="space-y-3">
                        <h3 class="text-2xl sm:text-3xl font-black text-white tracking-tight group-hover:text-cyan-100 transition-colors drop-shadow-lg uppercase leading-tight">{{ s.label }}</h3>
                        <p class="text-[10px] text-slate-400 line-clamp-3 leading-relaxed font-medium group-hover:text-slate-300 transition-colors">{{ s.description }}</p>
                    </div>

                    <!-- Footer: Initialization Sequence -->
                    <div class="mt-6 flex items-center gap-3 opacity-40 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                        <div class="h-px bg-gradient-to-r from-cyan-500/50 to-transparent flex-1 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
                        <span class="text-[9px] font-black text-cyan-400 uppercase tracking-[0.3em] whitespace-nowrap">RUN_INIT</span>
                        <span class="material-symbols-outlined text-sm text-cyan-400 group-hover:translate-x-1 transition-transform duration-300">arrow_forward_ios</span>
                    </div>
                </div>
            </button>
            }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .badge {
        @apply px-2.5 py-1 rounded-lg text-[8px] font-black font-mono border tracking-widest backdrop-blur-sm shadow-sm;
    }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 3px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
  `]
})
export class MenuWorldsTabComponent {
  scenes = input.required<ScenePreset[]>();
  loadScene = output<string>();

  getSceneIcon(theme: string) {
    switch(theme) {
        case 'city': return 'location_city';
        case 'forest': return 'forest';
        case 'ice': return 'ac_unit';
        case 'space': return 'rocket_launch';
        case 'desert': return 'landscape';
        default: return 'grid_view';
    }
  }

  getGravityLabel(id: string, theme: string): string {
      if (theme === 'space') return '0.0G';
      if (id.includes('moon')) return '0.16G';
      return '1.0G';
  }
}
