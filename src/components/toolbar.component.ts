
import { Component, signal, output, inject, input } from '@angular/core';
import { EngineService } from '../services/engine.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-10 flex items-center justify-between px-2 bg-slate-900 border-b border-slate-800 shadow-sm relative z-30 shrink-0">
      
      <!-- Left: Mobile Toggle & Spawning -->
      <div class="flex items-center gap-1.5">
        <button class="tool-btn lg:hidden" 
                [class.active]="leftPanelOpen()" 
                (click)="toggleLeftPanel.emit()"
                aria-label="Toggle Outliner">
          <span class="material-symbols-outlined icon-sm">menu</span>
        </button>

        <!-- Mode Switcher -->
        <button class="flex items-center gap-2 px-3 py-1 rounded bg-indigo-950/50 hover:bg-indigo-900/50 border border-indigo-500/30 text-indigo-200 text-xs font-bold transition-all ml-1 mr-2"
                (click)="engine.toggleMode()">
           <span class="material-symbols-outlined icon-sm">{{ engine.mode() === 'edit' ? 'edit' : 'travel_explore' }}</span>
           <span class="hidden sm:inline">{{ engine.mode() === 'edit' ? 'EDIT MODE' : 'EXPLORE MODE' }}</span>
        </button>

        <div class="w-px h-5 bg-slate-800 mx-1 hidden lg:block"></div>

        <!-- Entity Palette -->
        <select #palette (change)="spawn(palette.value); palette.value=''" 
                class="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-cyan-500 max-w-[120px]">
          <option value="" disabled selected>+ Spawn Entity</option>
          <optgroup label="Buildings">
            <option value="building-small">Small Building</option>
            <option value="building-tall">Tower</option>
            <option value="building-wide">Warehouse</option>
          </optgroup>
          <optgroup label="Terrain">
            <option value="terrain-road">Road</option>
            <option value="terrain-platform">Platform</option>
          </optgroup>
          <optgroup label="Props">
            <option value="prop-crate">Crate</option>
            <option value="prop-barrel">Barrel</option>
            <option value="prop-pillar">Pillar</option>
          </optgroup>
        </select>

        <div class="w-px h-5 bg-slate-800 mx-1"></div>
        
        <!-- Gizmo Modes (Edit only) -->
        <div class="flex bg-slate-800/50 rounded p-0.5 border border-slate-700/50" [class.opacity-50]="engine.mode() === 'explore'">
            <button class="tool-btn-sm" [class.active]="engine.transformMode() === 'translate'" 
                    [disabled]="engine.mode() === 'explore'" (click)="engine.setTransformMode('translate')">
              <span class="material-symbols-outlined icon-sm">open_with</span>
            </button>
            <button class="tool-btn-sm" [class.active]="engine.transformMode() === 'rotate'" 
                    [disabled]="engine.mode() === 'explore'" (click)="engine.setTransformMode('rotate')">
              <span class="material-symbols-outlined icon-sm">rotate_right</span>
            </button>
            <button class="tool-btn-sm" [class.active]="engine.transformMode() === 'scale'" 
                    [disabled]="engine.mode() === 'explore'" (click)="engine.setTransformMode('scale')">
              <span class="material-symbols-outlined icon-sm">aspect_ratio</span>
            </button>
        </div>

        <button class="tool-btn ml-1" 
                [disabled]="engine.selectedEntity() === null || engine.mode() === 'explore'"
                [class.opacity-40]="engine.selectedEntity() === null"
                (click)="engine.focusSelectedEntity()" 
                title="Focus Selection (F)">
          <span class="material-symbols-outlined icon-sm">center_focus_strong</span>
        </button>
      </div>

      <!-- Center: Playback -->
      <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1">
        <button class="w-8 h-8 rounded-full flex items-center justify-center transition-all focus-visible:outline-cyan-400"
                [class.bg-emerald-600]="!engine.isPaused()"
                [class.text-white]="!engine.isPaused()"
                [class.hover:bg-emerald-500]="!engine.isPaused()"
                [class.bg-slate-800]="engine.isPaused()"
                [class.text-slate-400]="engine.isPaused()"
                [class.hover:text-slate-200]="engine.isPaused()"
                (click)="engine.togglePause()">
             <span class="material-symbols-outlined icon-md">{{ engine.isPaused() ? 'play_arrow' : 'pause' }}</span>
        </button>
      </div>
      
      <!-- Right: View Options -->
      <div class="flex items-center gap-1.5">
        <div class="flex bg-slate-800/50 rounded p-0.5 border border-slate-700/50 mr-2">
            <button class="tool-btn-sm" [class.active]="showGrid()" (click)="toggleGrid()" title="Toggle Grid">
                <span class="material-symbols-outlined icon-sm">grid_3x3</span>
            </button>
            <button class="tool-btn-sm" [class.active]="engine.wireframe()" (click)="engine.toggleWireframe()" title="Toggle Wireframe">
                <span class="material-symbols-outlined icon-sm">deployed_code</span>
            </button>
        </div>

        <button class="tool-btn lg:hidden" 
                [class.active]="rightPanelOpen()" 
                (click)="toggleRightPanel.emit()">
          <span class="material-symbols-outlined icon-sm">tune</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .tool-btn { @apply w-8 h-8 flex items-center justify-center rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors focus-visible:outline-cyan-400; }
    .tool-btn.active { @apply text-cyan-400 bg-cyan-950/30; }
    .tool-btn-sm { @apply w-7 h-7 flex items-center justify-center rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors focus-visible:outline-cyan-400; }
    .tool-btn-sm.active { @apply text-cyan-400 bg-slate-700; }
    .icon-sm { font-size: 18px; }
    .icon-md { font-size: 20px; }
  `]
})
export class ToolbarComponent {
  engine = inject(EngineService);
  
  leftPanelOpen = input(true);
  rightPanelOpen = input(true);
  
  toggleLeftPanel = output<void>();
  toggleRightPanel = output<void>();
  spawnBox = output<void>();
  spawnSphere = output<void>();

  showGrid = signal(true);
  
  toggleGrid() {
    this.showGrid.update(v => !v);
  }

  spawn(id: string) {
      if(id) this.engine.spawnFromTemplate(id);
  }
}
    