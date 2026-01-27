
import { Component, signal, output, inject, input } from '@angular/core';
import { EngineService } from '../services/engine.service';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  template: `
    <div class="h-10 flex items-center justify-between px-2 bg-slate-900 border-b border-slate-800 shadow-sm relative z-30">
      
      <!-- Left Controls -->
      <div class="flex items-center gap-1">
        <button class="tool-btn lg:hidden" 
                [class.active]="leftPanelOpen()" 
                (click)="toggleLeftPanel.emit()"
                aria-label="Toggle Scene Tree">
          <span class="material-symbols-outlined text-[20px]">menu</span>
        </button>

        <!-- Divider for desktop -->
        <div class="w-px h-5 bg-slate-700 mx-1 hidden lg:block"></div>

        <!-- Spawn Tools -->
        <div class="flex bg-slate-800 rounded p-0.5">
            <button class="tool-btn-sm" (click)="spawnBox.emit()" title="Spawn Box">
            <span class="material-symbols-outlined text-[18px]">check_box_outline_blank</span>
            </button>
            <button class="tool-btn-sm" (click)="spawnSphere.emit()" title="Spawn Sphere">
            <span class="material-symbols-outlined text-[18px]">circle</span>
            </button>
        </div>

        <div class="w-px h-5 bg-slate-700 mx-2"></div>

        <!-- Selection Tools -->
        <button class="tool-btn" 
                [disabled]="engine.selectedEntity() === null"
                [class.opacity-40]="engine.selectedEntity() === null"
                (click)="engine.focusSelectedEntity()" 
                title="Focus Selection (F)">
          <span class="material-symbols-outlined text-[20px]">center_focus_strong</span>
        </button>
      </div>

      <!-- Center Controls (Playback) -->
      <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
        <button class="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                [class.bg-emerald-500]="!engine.isPaused()"
                [class.text-white]="!engine.isPaused()"
                [class.bg-slate-800]="engine.isPaused()"
                [class.text-slate-400]="engine.isPaused()"
                (click)="engine.togglePause()"
                title="Play/Pause">
             <span class="material-symbols-outlined text-[20px]">{{ engine.isPaused() ? 'play_arrow' : 'pause' }}</span>
        </button>
      </div>
      
      <!-- Right Controls -->
      <div class="flex items-center gap-1">
        <!-- View Options -->
        <div class="flex bg-slate-800 rounded p-0.5 mr-2">
            <button class="tool-btn-sm" [class.active]="showGrid()" (click)="toggleGrid()" title="Toggle Grid">
                <span class="material-symbols-outlined text-[18px]">grid_3x3</span>
            </button>
            <button class="tool-btn-sm" [class.active]="engine.wireframe()" (click)="engine.toggleWireframe()" title="Toggle Wireframe">
                <span class="material-symbols-outlined text-[18px]">deployed_code</span>
            </button>
        </div>

        <button class="tool-btn lg:hidden" 
                [class.active]="rightPanelOpen()" 
                (click)="toggleRightPanel.emit()"
                aria-label="Toggle Inspector">
          <span class="material-symbols-outlined text-[20px]">tune</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .tool-btn {
      @apply w-8 h-8 flex items-center justify-center rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors;
    }
    .tool-btn.active {
      @apply text-cyan-400 bg-cyan-950/50;
    }
    .tool-btn-sm {
      @apply w-7 h-7 flex items-center justify-center rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors;
    }
    .tool-btn-sm.active {
      @apply text-cyan-400 bg-slate-700;
    }
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
