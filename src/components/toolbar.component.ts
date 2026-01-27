
import { Component, signal, output, inject, input } from '@angular/core';
import { EngineService } from '../services/engine.service';

@Component({
  selector: 'app-toolbar',
  standalone: true,
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

        <div class="w-px h-5 bg-slate-800 mx-1 hidden lg:block"></div>

        <div class="flex bg-slate-800/50 rounded p-0.5 border border-slate-700/50">
            <button class="tool-btn-sm" (click)="spawnBox.emit()" title="Spawn Cube">
              <span class="material-symbols-outlined icon-sm">check_box_outline_blank</span>
            </button>
            <button class="tool-btn-sm" (click)="spawnSphere.emit()" title="Spawn Sphere">
              <span class="material-symbols-outlined icon-sm">circle</span>
            </button>
        </div>

        <div class="w-px h-5 bg-slate-800 mx-1"></div>
        
        <!-- Gizmo Modes -->
        <div class="flex bg-slate-800/50 rounded p-0.5 border border-slate-700/50">
            <button class="tool-btn-sm" [class.active]="engine.transformMode() === 'translate'" (click)="engine.setTransformMode('translate')" title="Translate">
              <span class="material-symbols-outlined icon-sm">open_with</span>
            </button>
            <button class="tool-btn-sm" [class.active]="engine.transformMode() === 'rotate'" (click)="engine.setTransformMode('rotate')" title="Rotate">
              <span class="material-symbols-outlined icon-sm">rotate_right</span>
            </button>
            <button class="tool-btn-sm" [class.active]="engine.transformMode() === 'scale'" (click)="engine.setTransformMode('scale')" title="Scale">
              <span class="material-symbols-outlined icon-sm">aspect_ratio</span>
            </button>
        </div>

        <button class="tool-btn ml-1" 
                [disabled]="engine.selectedEntity() === null"
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
                (click)="engine.togglePause()"
                [attr.aria-label]="engine.isPaused() ? 'Play Simulation' : 'Pause Simulation'">
             <span class="material-symbols-outlined icon-md">{{ engine.isPaused() ? 'play_arrow' : 'pause' }}</span>
        </button>
        
        @if (engine.isPaused()) {
            <button class="w-6 h-6 rounded-full flex items-center justify-center bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
                    (click)="engine.stepSimulation()"
                    title="Step Forward">
                <span class="material-symbols-outlined text-[16px]">skip_next</span>
            </button>
        }
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
                (click)="toggleRightPanel.emit()"
                aria-label="Toggle Inspector">
          <span class="material-symbols-outlined icon-sm">tune</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .tool-btn {
      @apply w-8 h-8 flex items-center justify-center rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors focus-visible:outline-cyan-400;
    }
    .tool-btn.active {
      @apply text-cyan-400 bg-cyan-950/30;
    }
    .tool-btn-sm {
      @apply w-7 h-7 flex items-center justify-center rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors focus-visible:outline-cyan-400;
    }
    .tool-btn-sm.active {
      @apply text-cyan-400 bg-slate-700;
    }
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

  showGrid = signal(true);
  
  spawnBox = output<void>();
  spawnSphere = output<void>();

  toggleGrid() {
    this.showGrid.update(v => !v);
  }
}