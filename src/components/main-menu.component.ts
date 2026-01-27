
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
      <div class="w-96 bg-slate-900 border border-slate-700 shadow-2xl rounded-xl overflow-hidden flex flex-col transform transition-all">
         
         <!-- Header -->
         <div class="p-6 text-center border-b border-slate-800 bg-slate-950/50">
            <h1 class="text-3xl font-bold tracking-tight text-white mb-1">QUALIA<span class="text-cyan-500">3D</span></h1>
            <p class="text-xs text-slate-500 uppercase tracking-widest font-mono">Physics Sandbox Environment</p>
         </div>
         
         @if (!showSettings()) {
            <!-- Main Options -->
            <div class="p-4 space-y-2 flex flex-col">
               <button 
                 (click)="engine.quickLoad()" 
                 [disabled]="!canContinue"
                 class="menu-btn-primary group relative overflow-hidden"
               >
                  <span class="relative z-10 flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined text-lg">resume</span> Continue
                  </span>
                  @if(!canContinue) { <span class="absolute right-4 text-[10px] text-slate-500 opacity-50 uppercase">No Save</span> }
               </button>

               <button (click)="newSandbox()" class="menu-btn">
                  <span class="material-symbols-outlined text-lg">check_box_outline_blank</span> New Sandbox
               </button>
               
               <div class="h-px bg-slate-800 my-2 mx-2"></div>
               
               <div class="text-[10px] font-bold text-slate-500 uppercase px-2 mb-1 tracking-wider">Presets</div>
               <div class="grid grid-cols-1 gap-1">
                 @for (s of scenes; track s.id) {
                    <button (click)="loadScene(s.id)" class="menu-btn-sub text-left px-4 py-2 hover:bg-slate-800/50 rounded flex justify-between items-center group">
                       <span>{{s.label}}</span>
                       <span class="material-symbols-outlined text-slate-600 group-hover:text-cyan-500 text-sm">arrow_forward</span>
                    </button>
                 }
               </div>

               <div class="h-px bg-slate-800 my-2 mx-2"></div>
               
               <button (click)="showSettings.set(true)" class="menu-btn text-slate-400 hover:text-white">
                  <span class="material-symbols-outlined text-lg">settings</span> Settings
               </button>
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
                
                <div class="p-6 space-y-6 flex-1">
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
        @apply w-full h-10 px-4 flex items-center gap-3 text-sm font-medium text-slate-300 bg-slate-800/50 hover:bg-slate-800 hover:text-white rounded-md transition-all border border-transparent hover:border-slate-600; 
    }
    .menu-btn-primary {
        @apply w-full h-12 px-4 flex items-center justify-between text-sm font-bold text-white bg-cyan-700 hover:bg-cyan-600 rounded-md transition-all shadow-lg shadow-cyan-900/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none;
    }
    .menu-btn-sub {
        @apply text-sm text-slate-400 transition-colors;
    }
  `]
})
export class MainMenuComponent {
  engine = inject(EngineService);
  registry = inject(SceneRegistryService);
  
  scenes = this.registry.listScenes();
  showSettings = signal(false);
  
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
