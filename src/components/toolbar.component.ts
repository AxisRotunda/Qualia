
import { Component, signal, output, inject } from '@angular/core';
import { EngineService } from '../services/engine.service';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  template: `
    <div class="flex items-center gap-1 px-2 py-1.5 bg-slate-900 border-b border-slate-700">
      <!-- Transform Mode -->
      <div class="flex gap-1 border-r border-slate-700 pr-2">
        <button class="tool-btn" [class.active]="mode() === 'select'"
                (click)="setMode('select')" title="Select (Q)">
          <span class="icon">◎</span>
        </button>
        <button class="tool-btn" [class.active]="mode() === 'move'"
                (click)="setMode('move')" title="Move (W)">
          <span class="icon">↔</span>
        </button>
        <button class="tool-btn" [class.active]="mode() === 'rotate'"
                (click)="setMode('rotate')" title="Rotate (E)">
          <span class="icon">↻</span>
        </button>
      </div>
      
      <!-- Spawn Tools -->
      <div class="flex gap-1 border-r border-slate-700 pr-2 pl-1">
        <button class="tool-btn" (click)="spawnBox.emit()" title="Box">
          <span class="icon">■</span>
        </button>
        <button class="tool-btn" (click)="spawnSphere.emit()" title="Sphere">
          <span class="icon">●</span>
        </button>
      </div>
      
      <!-- Actions -->
      <div class="flex gap-1 border-r border-slate-700 pr-2 pl-1">
        <button class="tool-btn" 
                [disabled]="!engine.selectedEntity() && engine.selectedEntity() !== 0"
                [class.opacity-50]="!engine.selectedEntity() && engine.selectedEntity() !== 0"
                (click)="engine.focusSelectedEntity()" 
                title="Focus Selection (F)">
          <span class="icon">center_focus_strong</span>
        </button>
      </div>

      <!-- Playback Controls -->
      <div class="flex gap-1 border-r border-slate-700 pr-2 pl-1">
        <button class="tool-btn" 
                [class.text-amber-400]="engine.isPaused()"
                [class.bg-amber-900_20]="engine.isPaused()"
                (click)="engine.togglePause()" 
                [title]="engine.isPaused() ? 'Resume (Space)' : 'Pause (Space)'">
          <span class="icon">{{ engine.isPaused() ? 'play_arrow' : 'pause' }}</span>
        </button>
      </div>
      
      <!-- View Options -->
      <div class="flex gap-1 pl-1">
        <button class="tool-btn" [class.active]="showGrid()"
                (click)="toggleGrid()" title="Toggle Grid (G)">
          <span class="icon">grid_3x3</span>
        </button>
         <button class="tool-btn" [class.active]="engine.wireframe()"
                (click)="engine.toggleWireframe()" title="Toggle Wireframe">
          <span class="icon">deployed_code</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .tool-btn {
      @apply w-7 h-7 flex items-center justify-center rounded
             text-slate-400 hover:text-slate-200 hover:bg-slate-800
             transition-colors text-lg leading-none select-none;
    }
    .tool-btn.active {
      @apply bg-cyan-900/40 text-cyan-400 ring-1 ring-cyan-500/30;
    }
    .bg-amber-900-20 { background-color: rgb(120 53 15 / 0.2); }
    .icon {
      font-family: 'Material Symbols Outlined';
      font-size: 18px;
    }
  `]
})
export class ToolbarComponent {
  engine = inject(EngineService);
  
  mode = signal<'select' | 'move' | 'rotate'>('select');
  showGrid = signal(true);
  
  modeChange = output<'select' | 'move' | 'rotate'>();
  spawnBox = output<void>();
  spawnSphere = output<void>();

  setMode(m: 'select' | 'move' | 'rotate') {
    this.mode.set(m);
    this.modeChange.emit(m);
  }

  toggleGrid() {
    this.showGrid.update(v => !v);
  }
}
