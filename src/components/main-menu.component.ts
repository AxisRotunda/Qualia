
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EngineService } from '../services/engine.service';
import { SceneRegistryService } from '../services/scene-registry.service';
import { LevelManagerService } from '../engine/features/level-manager.service';
import { MenuHomeTabComponent } from './menu/home-tab.component';
import { MenuWorldsTabComponent } from './menu/worlds-tab.component';
import { MenuSettingsTabComponent } from './menu/settings-tab.component';
import { MenuSidebarComponent, MenuTab } from './menu/menu-sidebar.component';

@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [
    CommonModule, 
    MenuSidebarComponent,
    MenuHomeTabComponent, 
    MenuWorldsTabComponent, 
    MenuSettingsTabComponent
  ],
  template: `
    <div class="fixed inset-0 z-[100] flex items-center justify-center animate-in fade-in duration-300 font-sans">
      
      <!-- Abstract Tech Background -->
      <div class="absolute inset-0 bg-slate-950">
         <div class="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
         <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black"></div>
         <div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-900/50 to-transparent"></div>
         <div class="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-900/50 to-transparent"></div>
      </div>

      <!-- Main Layout -->
      <div class="relative w-full h-full lg:max-w-6xl lg:h-[85vh] flex flex-col lg:flex-row bg-slate-950/80 lg:border border-slate-800 lg:rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl ring-1 ring-white/5">
         
         <!-- Sidebar Component -->
         <app-menu-sidebar [activeTab]="activeTab()" (switchTab)="activeTab.set($event)" />

         <!-- Content Area -->
         <main class="flex-1 overflow-y-auto relative z-10 custom-scrollbar p-4 lg:p-10 bg-gradient-to-b from-slate-900/50 to-transparent">
            @switch (activeTab()) {
                @case ('home') {
                  <app-menu-home-tab 
                    [canContinue]="canContinue"
                    [continueLabel]="levelManager.getQuickSaveLabel()"
                    (resume)="levelManager.quickLoad(engine); engine.state.mainMenuVisible.set(false)"
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
            }
         </main>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
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
      this.engine.state.mainMenuVisible.set(false);
  }

  togglePerformance() {
      this.performanceMode = !this.performanceMode;
      this.engine.viewport.setPerformanceMode(this.performanceMode);
  }
}
