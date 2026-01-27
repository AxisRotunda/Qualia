
import { Component, inject, signal } from '@angular/core';
import { EngineService } from '../services/engine.service';
import { SceneRegistryService } from '../services/scene-registry.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
      
      <div class="w-full max-w-5xl h-[85vh] flex flex-col md:flex-row bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden mx-4">
         
         <!-- Left Sidebar: Actions -->
         <div class="w-full md:w-80 bg-slate-950 border-r border-slate-800 p-8 flex flex-col shrink-0">
            <div class="mb-10">
                <h1 class="text-3xl font-black text-white tracking-tight">QUALIA<span class="text-cyan-500">3D</span></h1>
                <p class="text-xs text-slate-500 font-mono mt-1">PHYSICS SANDBOX v0.2</p>
            </div>

            <div class="space-y-4 flex-1">
                <!-- Resume Button -->
                <button 
                    (click)="engine.quickLoad()" 
                    [disabled]="!canContinue"
                    class="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 p-px shadow-lg transition-all hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <div class="relative flex items-center gap-3 bg-slate-900/10 px-4 py-4 h-full">
                        <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white shadow-inner">
                            <span class="material-symbols-outlined">resume</span>
                        </span>
                        <div class="text-left">
                            <div class="text-sm font-bold text-white group-hover:text-cyan-100">{{ continueLabel() }}</div>
                            <div class="text-[10px] text-cyan-200/60">Resume previous session</div>
                        </div>
                    </div>
                </button>

                <!-- New Sandbox -->
                <button (click)="newSandbox()" class="w-full flex items-center gap-3 px-4 py-4 rounded-xl border border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-all text-slate-300 group">
                    <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-slate-400 group-hover:text-white group-hover:bg-slate-700 transition-colors">
                        <span class="material-symbols-outlined">add</span>
                    </span>
                    <div class="text-left">
                        <div class="text-sm font-bold group-hover:text-white">New Sandbox</div>
                        <div class="text-[10px] text-slate-500">Empty void, zero gravity</div>
                    </div>
                </button>
            </div>

            <div class="mt-auto pt-8 border-t border-slate-800">
                <div class="flex items-center gap-2 text-[10px] text-slate-600 font-mono">
                    <span>ENGINE: THREE.JS + RAPIER</span>
                </div>
            </div>
         </div>

         <!-- Right Content: Scene Browser -->
         <div class="flex-1 bg-slate-900 p-8 overflow-y-auto">
            <h2 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <span class="material-symbols-outlined text-lg">grid_view</span> Available Worlds
            </h2>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                @for (s of scenes; track s.id) {
                    <button (click)="loadScene(s.id)" 
                            class="group relative flex flex-col text-left h-40 rounded-xl overflow-hidden border border-slate-700 hover:border-cyan-500/50 transition-all bg-slate-800 hover:bg-slate-800/80">
                        
                        <!-- Accent Bar -->
                        <div class="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b transition-all group-hover:w-2"
                             [ngClass]="s.previewColor"></div>
                        
                        <div class="p-5 pl-7 flex flex-col h-full">
                            <div class="flex justify-between items-start">
                                <h3 class="font-bold text-lg text-slate-200 group-hover:text-white transition-colors">{{ s.label }}</h3>
                                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/50 text-slate-500 border border-slate-800 uppercase group-hover:text-cyan-400 group-hover:border-cyan-900/50 transition-colors">
                                    {{ s.theme }}
                                </span>
                            </div>
                            
                            <p class="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed group-hover:text-slate-400 transition-colors">
                                {{ s.description }}
                            </p>

                            <div class="mt-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                <span class="text-xs font-bold text-cyan-400 flex items-center gap-1">
                                    Load Scene <span class="material-symbols-outlined text-sm">arrow_forward</span>
                                </span>
                            </div>
                        </div>
                    </button>
                }
            </div>
         </div>

      </div>
    </div>
  `
})
export class MainMenuComponent {
  engine = inject(EngineService);
  registry = inject(SceneRegistryService);
  
  scenes = this.registry.listScenes();
  
  continueLabel = signal(this.engine.getQuickSaveLabel());
  
  get canContinue() {
      return this.engine.hasSavedState();
  }

  loadScene(id: string) {
      this.engine.loadScene(id);
  }

  newSandbox() {
      this.engine.reset();
      this.engine.mainMenuVisible.set(false);
  }
}
