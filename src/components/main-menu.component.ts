
import { Component, inject, signal, computed } from '@angular/core';
import { EngineService } from '../services/engine.service';
import { SceneRegistryService } from '../services/scene-registry.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div class="w-[800px] max-w-[95vw] bg-slate-900 border border-slate-700 shadow-2xl rounded-xl overflow-hidden flex flex-col transform transition-all max-h-[90vh]">
         
         <!-- Header -->
         <div class="p-6 text-center border-b border-slate-800 bg-slate-950/50 shrink-0">
            <h1 class="text-3xl font-bold tracking-tight text-white mb-1">QUALIA<span class="text-cyan-500">3D</span></h1>
            <p class="text-xs text-slate-500 uppercase tracking-widest font-mono">Physics Sandbox Environment</p>
         </div>
         
         @if (!showSettings()) {
            <!-- Main Content Grid -->
            <div class="flex-1 overflow-y-auto p-6">
                <!-- Top Actions -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <button 
                        (click)="engine.quickLoad()" 
                        [disabled]="!canContinue"
                        class="menu-btn-primary group relative overflow-hidden h-20 flex flex-col items-center justify-center gap-1"
                    >
                        <span class="relative z-10 flex items-center gap-2 text-lg">
                            <span class="material-symbols-outlined">resume</span> 
                            {{ continueLabel() }}
                        </span>
                        @if(!canContinue) { <span class="text-[10px] text-slate-400 opacity-70 uppercase">No Save Data</span> }
                    </button>

                    <button (click)="newSandbox()" class="menu-btn h-20 flex flex-col items-center justify-center gap-1 border-dashed border-2 border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/80">
                        <span class="flex items-center gap-2 text-slate-200 font-bold">
                            <span class="material-symbols-outlined">check_box_outline_blank</span> New Empty Sandbox
                        </span>
                        <span class="text-[10px] text-slate-500">Start from scratch</span>
                    </button>
                </div>

                <!-- Scene Presets -->
                <div class="space-y-4">
                    <h2 class="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <span class="material-symbols-outlined text-sm">collections</span> Scenes
                    </h2>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        @for (s of scenes; track s.id) {
                            <button (click)="loadScene(s.id)" 
                                    class="relative group bg-slate-800 rounded-lg p-4 text-left border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all overflow-hidden">
                                
                                <!-- Color Strip -->
                                <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b opacity-80 group-hover:opacity-100 transition-opacity"
                                     [ngClass]="s.previewColor"></div>

                                <div class="pl-2">
                                    <h3 class="font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">{{ s.label }}</h3>
                                    <p class="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{{ s.description }}</p>
                                    
                                    <div class="mt-3 flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <span class="text-[10px] font-mono text-cyan-600 bg-cyan-950/30 px-1.5 rounded uppercase border border-cyan-900/30">
                                            {{ s.theme }}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        }
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="p-4 border-t border-slate-800 bg-slate-950/30 flex justify-between items-center shrink-0">
                <button (click)="showSettings.set(true)" class="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors">
                    <span class="material-symbols-outlined text-sm">settings</span> Settings
                </button>
                <span class="text-[10px] text-slate-600 font-mono">v0.2.0-beta</span>
            </div>

         } @else {
            <!-- Settings Sub-View -->
            <div class="flex flex-col h-full animate-in slide-in-from-right-4 duration-200">
                <div class="flex items-center gap-2 p-4 border-b border-slate-800 bg-slate-800/20 text-slate-200">
                    <button (click)="showSettings.set(false)" class="p-1 hover:bg-slate-700 rounded transition-colors">
                        <span class="material-symbols-outlined">arrow_back</span>
                    </button>
                    <span class="font-bold">Settings</span>
                </div>
                
                <div class="p-6 space-y-6 flex-1 overflow-y-auto">
                    <!-- Textures -->
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-slate-300">Enable Textures</span>
                        <button 
                          (click)="engine.toggleTextures()"
                          class="w-12 h-6 rounded-full transition-colors relative"
                          [class.bg-cyan-600]="engine.texturesEnabled()"
                          [class.bg-slate-700]="!engine.texturesEnabled()"
                        >
                            <div class="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200"
                                 [class.left-7]="engine.texturesEnabled()"
                                 [class.left-1]="!engine.texturesEnabled()"
                            ></div>
                        </button>
                    </div>

                    <!-- Wireframe -->
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-slate-300">Wireframe Mode</span>
                         <button 
                          (click)="engine.toggleWireframe()"
                          class="w-12 h-6 rounded-full transition-colors relative"
                          [class.bg-cyan-600]="engine.wireframe()"
                          [class.bg-slate-700]="!engine.wireframe()"
                        >
                            <div class="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200"
                                 [class.left-7]="engine.wireframe()"
                                 [class.left-1]="!engine.wireframe()"
                            ></div>
                        </button>
                    </div>

                    <!-- Debug -->
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-slate-300">Show Debug Info</span>
                         <button 
                          (click)="toggleDebug()"
                          class="w-12 h-6 rounded-full transition-colors relative"
                          [class.bg-cyan-600]="engine.showDebugOverlay()"
                          [class.bg-slate-700]="!engine.showDebugOverlay()"
                        >
                            <div class="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200"
                                 [class.left-7]="engine.showDebugOverlay()"
                                 [class.left-1]="!engine.showDebugOverlay()"
                            ></div>
                        </button>
                    </div>

                    <!-- Gravity -->
                    <div class="space-y-2">
                        <div class="flex justify-between text-sm text-slate-300">
                            <span>Gravity Y</span>
                            <span class="font-mono text-cyan-400">{{ engine.gravityY() }}</span>
                        </div>
                        <input type="range" min="-20" max="0" step="0.5" 
                               [value]="engine.gravityY()" 
                               (input)="updateGravity($event)"
                               class="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500">
                    </div>
                </div>
            </div>
         }
      </div>
    </div>
  `,
  styles: [`
    .menu-btn { 
        @apply px-4 text-sm font-medium text-slate-300 bg-slate-800/50 hover:bg-slate-800 hover:text-white rounded-md transition-all border border-transparent hover:border-slate-600; 
    }
    .menu-btn-primary {
        @apply px-4 text-sm font-bold text-white bg-cyan-700 hover:bg-cyan-600 rounded-md transition-all shadow-lg shadow-cyan-900/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none;
    }
  `]
})
export class MainMenuComponent {
  engine = inject(EngineService);
  registry = inject(SceneRegistryService);
  
  scenes = this.registry.listScenes();
  showSettings = signal(false);
  
  // Computed wasn't strictly necessary since engine state isn't changing reactively for LS, 
  // but good for structure if we add reactive LS later.
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

  toggleDebug() {
      this.engine.setDebugOverlayVisible(!this.engine.showDebugOverlay());
  }
  
  updateGravity(e: Event) {
      const v = parseFloat((e.target as HTMLInputElement).value);
      this.engine.setGravity(v);
  }
}
