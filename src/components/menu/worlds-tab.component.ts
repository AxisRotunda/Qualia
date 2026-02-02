
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
      <header class="mb-8 flex justify-between items-end border-b border-white/10 pb-4 shrink-0">
        <div>
          <h2 class="text-4xl font-black text-white tracking-[0.2em] uppercase">Simulations</h2>
          <div class="flex items-center gap-2 text-xs mt-2 text-slate-500 font-mono tracking-widest">
              <span class="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-cyan-500 font-bold">{{ scenes().length }}</span>
              <span>AVAILABLE_PRESETS</span>
          </div>
        </div>
        
        <div class="hidden sm:flex gap-2">
            <button class="px-3 py-1 text-[10px] font-black bg-cyan-900/30 text-cyan-400 border border-cyan-500/30 rounded tracking-widest uppercase hover:bg-cyan-500/20 transition-colors">All</button>
            <button class="px-3 py-1 text-[10px] font-black bg-slate-900 text-slate-500 border border-slate-800 rounded tracking-widest uppercase hover:text-slate-300 transition-colors">Planetary</button>
            <button class="px-3 py-1 text-[10px] font-black bg-slate-900 text-slate-500 border border-slate-800 rounded tracking-widest uppercase hover:text-slate-300 transition-colors">Orbital</button>
        </div>
      </header>

      <!-- Scrollable Grid -->
      <div class="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-12">
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            @for (s of scenes(); track s.id) {
            <button (click)="loadScene.emit(s.id)" 
                    class="group relative h-64 rounded-2xl overflow-hidden border border-white/10 bg-slate-950 text-left transition-all hover:scale-[1.02] hover:border-cyan-500/60 hover:shadow-2xl hover:shadow-cyan-900/20 active:scale-[0.99] focus:outline-none">
                
                <!-- Theme Base Gradient -->
                <div class="absolute inset-0 bg-gradient-to-br opacity-25 group-hover:opacity-40 transition-opacity duration-700" 
                     [ngClass]="s.previewColor"></div>
                
                <!-- Noise & Scanline Overlay -->
                <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                <div class="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,4px_100%] pointer-events-none opacity-20"></div>

                <!-- Hover Scan Animation -->
                <div class="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 ease-in-out pointer-events-none"></div>

                <!-- Content Matrix -->
                <div class="absolute inset-0 p-6 flex flex-col z-10">
                    
                    <!-- Top Logic: Profiling Badges -->
                    <div class="flex justify-between items-start mb-auto">
                        <div class="flex flex-wrap gap-2">
                            <span class="badge border-cyan-500/20 text-cyan-400 bg-cyan-950/30">
                                {{ getGravityLabel(s.id, s.theme) }}
                            </span>
                            <span class="badge border-white/10 text-white/50 bg-white/5 uppercase">
                                {{ s.theme }}
                            </span>
                        </div>
                        
                        <div class="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:border-cyan-400/40 transition-colors shadow-lg">
                            <span class="material-symbols-outlined text-white/40 group-hover:text-cyan-400 transition-colors text-2xl">{{ getSceneIcon(s.theme) }}</span>
                        </div>
                    </div>

                    <!-- Description Domain -->
                    <div class="space-y-2.5">
                        <h3 class="text-2xl font-black text-white tracking-tight group-hover:text-cyan-100 transition-colors drop-shadow-lg uppercase leading-none">{{ s.label }}</h3>
                        <p class="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-medium group-hover:text-slate-300 transition-colors">{{ s.description }}</p>
                    </div>

                    <!-- Footer: Initialization Sequence -->
                    <div class="mt-5 flex items-center gap-4 opacity-40 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                        <div class="h-[1px] bg-cyan-500/50 flex-1 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
                        <span class="text-[9px] font-black text-cyan-400 uppercase tracking-[0.3em]">Run Initialization</span>
                        <span class="material-symbols-outlined text-xs text-cyan-400 animate-pulse">arrow_forward_ios</span>
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
        @apply px-2 py-0.5 rounded text-[8px] font-black font-mono border tracking-widest backdrop-blur-sm shadow-sm;
    }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
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
