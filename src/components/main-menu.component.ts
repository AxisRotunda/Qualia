
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EngineService } from '../services/engine.service';
import { SceneRegistryService } from '../services/scene-registry.service';
import { MenuHomeTabComponent } from './menu/home-tab.component';
import { MenuWorldsTabComponent } from './menu/worlds-tab.component';
import { MenuSettingsTabComponent } from './menu/settings-tab.component';

type MenuTab = 'home' | 'worlds' | 'settings';

@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [
    CommonModule, 
    MenuHomeTabComponent, 
    MenuWorldsTabComponent, 
    MenuSettingsTabComponent
  ],
  template: `
    <div class="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
      
      <!-- Main Container -->
      <div class="w-full h-full lg:max-w-6xl lg:h-[85vh] flex flex-col lg:flex-row bg-slate-900/90 lg:border border-slate-700/50 lg:rounded-2xl shadow-2xl overflow-hidden relative isolate">
         
         <!-- Background Abstract Art -->
         <div class="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950/50 to-slate-950 pointer-events-none z-0"></div>

         <!-- Left Sidebar (Desktop) / Bottom Bar (Mobile) -->
         <nav class="lg:w-72 bg-slate-950/80 border-t lg:border-t-0 lg:border-r border-slate-800 p-2 lg:p-6 flex lg:flex-col justify-between shrink-0 order-2 lg:order-1 z-10">
            
            <!-- Branding -->
            <div class="hidden lg:block mb-10">
                <h1 class="text-3xl font-black text-white tracking-tight flex items-center gap-2">
                    <span class="material-symbols-outlined text-cyan-500 text-3xl">deployed_code_history</span>
                    QUALIA<span class="text-cyan-500">3D</span>
                </h1>
                <div class="flex items-center gap-2 mt-2">
                    <span class="text-[10px] bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-900/50 font-mono">v0.4.0</span>
                    <span class="text-[10px] text-slate-500 font-mono">BETA</span>
                </div>
            </div>

            <!-- Navigation Links -->
            <div class="flex flex-1 justify-around lg:justify-start lg:flex-col lg:gap-2">
                <button (click)="activeTab.set('home')" 
                        [class.active]="activeTab() === 'home'"
                        class="nav-btn group">
                    <span class="material-symbols-outlined icon">home</span>
                    <span class="label">Home</span>
                </button>
                
                <button (click)="activeTab.set('worlds')" 
                        [class.active]="activeTab() === 'worlds'"
                        class="nav-btn group">
                    <span class="material-symbols-outlined icon">grid_view</span>
                    <span class="label">Worlds</span>
                </button>

                <button (click)="activeTab.set('settings')" 
                        [class.active]="activeTab() === 'settings'"
                        class="nav-btn group">
                    <span class="material-symbols-outlined icon">tune</span>
                    <span class="label">Settings</span>
                </button>
            </div>

            <!-- User/Footer (Desktop) -->
            <div class="hidden lg:block mt-auto pt-6 border-t border-slate-800">
               <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-cyan-500/20">
                    Q
                  </div>
                  <div class="flex flex-col">
                      <span class="text-xs font-bold text-slate-300">User Session</span>
                      <span class="text-[10px] text-slate-500">Local Sandbox</span>
                  </div>
               </div>
            </div>
         </nav>

         <!-- Content Area -->
         <main class="flex-1 overflow-y-auto relative z-10 order-1 lg:order-2 custom-scrollbar p-4 lg:p-10">
            @switch (activeTab()) {
                @case ('home') {
                  <app-menu-home-tab 
                    [canContinue]="canContinue"
                    [continueLabel]="engine.getQuickSaveLabel()"
                    (resume)="engine.quickLoad(); engine.mainMenuVisible.set(false)"
                    (newSandbox)="newSandbox()"
                  />
                }
                @case ('worlds') {
                  <app-menu-worlds-tab 
                    [scenes]="scenes"
                    (loadScene)="loadScene($event)"
                  />
                }
                @case ('settings') {
                  <app-menu-settings-tab 
                    [isPerformanceMode]="performanceMode"
                    [isWireframe]="engine.wireframe()"
                    (togglePerformance)="togglePerformance()"
                    (toggleWireframe)="engine.toggleWireframe()"
                  />
                }
            }
         </main>
      </div>
    </div>
  `,
  styles: [`
    .nav-btn {
        @apply flex flex-col lg:flex-row items-center gap-1 lg:gap-3 p-2 lg:px-4 lg:py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all;
    }
    .nav-btn.active {
        @apply text-cyan-400 bg-cyan-950/30 lg:border-l-2 border-cyan-400 rounded-l-none;
    }
    .nav-btn .icon {
        @apply text-2xl lg:text-xl;
    }
    .nav-btn .label {
        @apply text-[10px] lg:text-sm font-bold;
    }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
  `]
})
export class MainMenuComponent {
  engine = inject(EngineService);
  registry = inject(SceneRegistryService);
  
  scenes = this.registry.listScenes();
  activeTab = signal<MenuTab>('home');
  performanceMode = false;

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

  togglePerformance() {
      this.performanceMode = !this.performanceMode;
      this.engine.setPerformanceMode(this.performanceMode);
  }
}
