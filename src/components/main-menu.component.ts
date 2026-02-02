import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EngineService } from '../services/engine.service';
import { SceneRegistryService } from '../engine/level/scene-registry.service';
import { LevelManagerService } from '../engine/features/level-manager.service';
import { MenuHomeTabComponent } from './menu/home-tab.component';
import { MenuWorldsTabComponent } from './menu/worlds-tab.component';
import { MenuSettingsTabComponent } from './menu/settings-tab.component';
import { SystemTabComponent } from './menu/system-tab.component';
import { MenuSidebarComponent, MenuTab } from './menu/menu-sidebar.component';

@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [
    CommonModule, 
    MenuSidebarComponent,
    MenuHomeTabComponent, 
    MenuWorldsTabComponent, 
    MenuSettingsTabComponent,
    SystemTabComponent
  ],
  template: `
    <div class="fixed inset-0 z-[300] flex items-center justify-center animate-in fade-in duration-500 font-sans">
      
      <!-- Abstract Silicon Void Background -->
      <div class="absolute inset-0 bg-slate-950 overflow-hidden">
         <!-- Grain Overlay -->
         <div class="absolute inset-0 opacity-15 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
         <!-- Depth Gradients -->
         <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black"></div>
         <div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-900/50 to-transparent"></div>
         <div class="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-900/50 to-transparent"></div>
         <!-- Pulsing Glows -->
         <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-cyan-500/5 blur-[120px] animate-pulse"></div>
         <div class="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/5 blur-[120px] animate-pulse" style="animation-delay: 2s"></div>
      </div>

      <!-- Main Layout -->
      <div class="relative w-full h-full lg:max-w-6xl lg:h-[85vh] flex flex-col lg:flex-row bg-slate-950/80 lg:border border-slate-800 lg:rounded-2xl shadow-2xl overflow-hidden backdrop-blur-3xl ring-1 ring-white/5">
         
         <!-- Sidebar Component -->
         <app-menu-sidebar [activeTab]="activeTab()" (switchTab)="activeTab.set($event)" />

         <!-- Content Area -->
         <main class="flex-1 overflow-y-auto relative z-10 custom-scrollbar p-4 lg:p-10 bg-gradient-to-b from-slate-900/30 to-transparent">
            @switch (activeTab()) {
                @case ('home') {
                  <app-menu-home-tab 
                    [canContinue]="canContinue"
                    [continueLabel]="levelManager.getQuickSaveLabel()"
                    (resume)="levelManager.quickLoad(engine); engine.setMainMenuVisible(false)"
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
                    [timeScale]="engine.timeScale()"
                    (togglePerformance)="togglePerformance()"
                    (toggleWireframe)="engine.viewport.toggleWireframe()"
                    (updateTimeScale)="engine.sim.setTimeScale($event)"
                  />
                }
                @case ('system') {
                  <app-menu-system-tab />
                }
            }
         </main>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
  `]
})
export class MainMenuComponent {
  engine = inject(EngineService);
  registry = inject(SceneRegistryService);
  levelManager = inject(LevelManagerService);
  
  scenes = this.registry.listScenes();
  activeTab = signal<MenuTab>('home');
  performanceMode = false;

  get canContinue() {
      return this.levelManager.hasSavedState();
  }

  loadScene(id: string) {
      this.levelManager.loadScene(this.engine, id);
  }

  newSandbox() {
      this.levelManager.reset();
      this.engine.setMainMenuVisible(false);
  }

  togglePerformance() {
      this.performanceMode = !this.performanceMode;
      this.engine.viewport.setPerformanceMode(this.performanceMode);
  }
}