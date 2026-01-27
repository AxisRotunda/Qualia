
import { Component, signal, output } from '@angular/core';

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
      
      <!-- View Options -->
      <div class="flex gap-1 pl-1">
        <button class="tool-btn" [class.active]="showGrid()"
                (click)="toggleGrid()" title="Toggle Grid (G)">
          <span class="icon">#</span>
        </button>
         <button class="tool-btn" [class.active]="showWireframe()"
                (click)="toggleWireframe()" title="Toggle Wireframe">
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
    .icon {
      font-family: 'Material Symbols Outlined';
      font-size: 18px;
    }
  `]
})
export class ToolbarComponent {
  mode = signal<'select' | 'move' | 'rotate'>('select');
  showGrid = signal(true);
  showWireframe = signal(false);
  
  modeChange = output<'select' | 'move' | 'rotate'>();
  spawnBox = output<void>();
  spawnSphere = output<void>();

  setMode(m: 'select' | 'move' | 'rotate') {
    this.mode.set(m);
    this.modeChange.emit(m);
  }

  toggleGrid() {
    this.showGrid.update(v => !v);
    // Future: emit grid toggle
  }

  toggleWireframe() {
    this.showWireframe.update(v => !v);
    // Future: emit wireframe toggle
  }
}
