
import { Component, signal, inject } from '@angular/core';
import { EngineService } from '../services/engine.service';
import { LayoutService } from '../services/ui/layout.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-12 md:h-10 flex items-center justify-between px-3 bg-slate-950/95 border-b border-slate-800/80 shadow-lg relative z-30 shrink-0 overflow-x-auto no-scrollbar backdrop-blur-md">
      
      <!-- Left: Input & Spawning -->
      <div class="flex items-center gap-2 shrink-0">
        @if (layout.isMobile()) {
          <button class="tool-btn" 
                  [class.active-state]="layout.leftPanelOpen()" 
                  (click)="layout.toggleLeft()"
                  aria-label="Toggle Scene Tree">
            <span class="material-symbols-outlined icon-md">menu</span>
          </button>
        }

        <!-- Mode Switcher -->
        <button class="flex items-center gap-2 px-3 h-8 md:h-7 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 text-indigo-300 text-[10px] font-bold transition-all min-w-[40px] sm:min-w-[100px] justify-center sm:justify-start active:border-indigo-500 active:text-indigo-200 group"
                (click)="engine.input.toggleMode()"
                title="Switch Input Mode">
           <span class="material-symbols-outlined icon-md group-hover:scale-110 transition-transform">{{ getModeIcon() }}</span>
           <span class="hidden sm:inline font-mono tracking-wider">{{ getModeLabel() }}</span>
        </button>

        @if (engine.mode() === 'walk') {
          <button class="tool-btn-sm ml-1"
                  [class.active-tool]="engine.state.viewMode() === 'tp'"
                  (click)="engine.viewport.toggleViewMode()"
                  title="Toggle FP/TP View (V)">
               <span class="material-symbols-outlined icon-sm">{{ engine.state.viewMode() === 'fp' ? 'person' : 'visibility' }}</span>
          </button>
        }

        @if (!layout.isMobile()) { <div class="w-px h-5 bg-slate-800"></div> }

        <!-- Spawn Button -->
        <button (click)="layout.openSpawnMenu()" 
                class="flex items-center gap-2 px-3 h-8 md:h-7 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-emerald-400 text-[10px] font-bold rounded transition-all group active:scale-95">
            <span class="material-symbols-outlined icon-md group-hover:scale-110 transition-transform shadow-emerald-500/20">add</span>
            <span class="hidden sm:inline font-mono tracking-wider">ENTITY</span>
        </button>

        @if (!layout.isMobile()) {
          <div class="w-px h-5 bg-slate-800 mx-1"></div>
          
          <!-- Gizmo Modes -->
          <div class="flex bg-slate-950 p-0.5 rounded border border-slate-800">
              <button class="tool-btn-sm" [class.active-tool]="engine.transformMode() === 'translate'" 
                      (click)="engine.viewport.setTransformMode('translate')" title="Translate (W)">
                <span class="material-symbols-outlined icon-sm">open_with</span>
              </button>
              <div class="w-px h-full bg-slate-900"></div>
              <button class="tool-btn-sm" [class.active-tool]="engine.transformMode() === 'rotate'" 
                      (click)="engine.viewport.setTransformMode('rotate')" title="Rotate (E)">
                <span class="material-symbols-outlined icon-sm">rotate_right</span>
              </button>
              <div class="w-px h-full bg-slate-900"></div>
              <button class="tool-btn-sm" [class.active-tool]="engine.transformMode() === 'scale'" 
                      (click)="engine.viewport.setTransformMode('scale')" title="Scale (R)">
                <span class="material-symbols-outlined icon-sm">aspect_ratio</span>
              </button>
          </div>

          <button class="tool-btn ml-1" 
                  [disabled]="engine.selectedEntity() === null"
                  [class.opacity-30]="engine.selectedEntity() === null"
                  [class.text-cyan-400]="engine.selectedEntity() !== null"
                  (click)="engine.input.focusSelectedEntity()" 
                  title="Focus Selection (F)">
            <span class="material-symbols-outlined icon-md">center_focus_strong</span>
          </button>
        }
      </div>

      <!-- Center: Playback (Floating with Glow) -->
      @if (!layout.isMobile()) {
        <div class="flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center">
          <button class="w-9 h-9 rounded-full flex items-center justify-center transition-all border group relative overflow-hidden"
                  [class.bg-emerald-600]="!engine.isPaused()"
                  [class.border-emerald-400]="!engine.isPaused()"
                  [class.text-white]="!engine.isPaused()"
                  [class.shadow-[0_0_15px_rgba(16,185,129,0.4)]]="!engine.isPaused()"
                  
                  [class.bg-slate-900]="engine.isPaused()"
                  [class.border-slate-700]="engine.isPaused()"
                  [class.text-amber-500]="engine.isPaused()"
                  [class.hover:border-amber-500]="engine.isPaused()"
                  (click)="engine.sim.togglePause()"
                  title="Toggle Simulation">
               
               <!-- Pulse effect when running -->
               @if (!engine.isPaused()) {
                  <div class="absolute inset-0 bg-white/20 animate-ping rounded-full opacity-30"></div>
               }
               
               <span class="material-symbols-outlined icon-md relative z-10">{{ engine.isPaused() ? 'play_arrow' : 'pause' }}</span>
          </button>
        </div>
      }
      
      <!-- Right: View Options -->
      <div class="flex items-center gap-2 shrink-0 ml-4">
        <!-- Toggles -->
        <div class="flex bg-slate-950 p-0.5 rounded border border-slate-800 mr-2">
            <button class="tool-btn-sm" [class.active-tool]="showGrid()" (click)="toggleGrid()" title="Toggle Grid">
                <span class="material-symbols-outlined icon-sm">grid_3x3</span>
            </button>
            <div class="w-px h-full bg-slate-900"></div>
            <button class="tool-btn-sm" [class.active-tool]="engine.wireframe()" (click)="engine.viewport.toggleWireframe()" title="Toggle Wireframe">
                <span class="material-symbols-outlined icon-sm">deployed_code</span>
            </button>
            <div class="w-px h-full bg-slate-900"></div>
            <button class="tool-btn-sm" [class.active-tool]="engine.showPhysicsDebug()" (click)="engine.viewport.togglePhysicsDebug()" title="Toggle Physics Colliders">
                <span class="material-symbols-outlined icon-sm">bug_report</span>
            </button>
        </div>

        @if (layout.isMobile()) {
          <button class="tool-btn" 
                  [class.active-state]="layout.rightPanelOpen()" 
                  (click)="layout.toggleRight()"
                  aria-label="Toggle Inspector">
            <span class="material-symbols-outlined icon-md">tune</span>
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .tool-btn { 
      @apply w-10 h-10 md:w-8 md:h-8 flex items-center justify-center rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors focus-visible:outline-cyan-400 border border-transparent; 
    }
    .tool-btn.active-state { 
      @apply text-cyan-400 bg-slate-800 border-slate-700; 
    }
    
    .tool-btn-sm { 
      @apply w-8 h-8 md:w-7 md:h-7 flex items-center justify-center hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-all focus-visible:outline-cyan-400; 
    }
    .tool-btn-sm.active-tool { 
      @apply text-cyan-400 bg-slate-900 shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)] border-t border-cyan-500/20; 
    }
    
    .icon-sm { font-size: 18px; }
    .icon-md { font-size: 20px; }
    
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none;  scrollbar-width: none; }
  `]
})
export class ToolbarComponent {
  engine = inject(EngineService);
  layout = inject(LayoutService);

  showGrid = signal(true);
  
  toggleGrid() {
    this.showGrid.update(v => !v);
  }

  getModeLabel() {
      switch(this.engine.mode()) {
          case 'edit': return 'EDIT';
          case 'walk': return 'WALK';
          case 'explore': return 'FLY';
      }
  }

  getModeIcon() {
      switch(this.engine.mode()) {
          case 'edit': return 'edit';
          case 'walk': return 'directions_walk';
          case 'explore': return 'travel_explore';
      }
  }
}
