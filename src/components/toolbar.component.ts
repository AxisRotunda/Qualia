
import { Component, signal, inject } from '@angular/core';
import { EngineService } from '../services/engine.service';
import { LayoutService } from '../services/ui/layout.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-10 flex items-center justify-between px-3 bg-slate-950/90 border-b border-slate-800/80 shadow-lg relative z-30 shrink-0 overflow-x-auto no-scrollbar backdrop-blur-sm">
      
      <!-- Left: Input & Spawning -->
      <div class="flex items-center gap-2 shrink-0">
        <button class="tool-btn lg:hidden" 
                [class.active-state]="layout.leftPanelOpen()" 
                (click)="layout.toggleLeft()"
                aria-label="Toggle Outliner">
          <span class="material-symbols-outlined icon-sm">menu</span>
        </button>

        <!-- Mode Switcher -->
        <button class="flex items-center gap-2 px-3 py-1 rounded-sm bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 text-indigo-300 text-[10px] font-bold transition-all min-w-[40px] sm:min-w-[100px] justify-center sm:justify-start active:border-indigo-500 active:text-indigo-200 group"
                (click)="engine.toggleMode()">
           <span class="material-symbols-outlined icon-sm group-hover:scale-110 transition-transform">{{ getModeIcon() }}</span>
           <span class="hidden sm:inline font-mono tracking-wider">{{ getModeLabel() }}</span>
        </button>

        <div class="w-px h-4 bg-slate-800 hidden lg:block"></div>

        <!-- Spawn Button -->
        <button (click)="layout.openSpawnMenu()" 
                class="flex items-center gap-2 px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-emerald-400 text-[10px] font-bold rounded-sm transition-all group active:scale-95">
            <span class="material-symbols-outlined icon-sm group-hover:scale-110 transition-transform shadow-emerald-500/20">add</span>
            <span class="hidden sm:inline font-mono tracking-wider">ADD ENTITY</span>
        </button>

        <div class="w-px h-4 bg-slate-800 mx-1"></div>
        
        <!-- Gizmo Modes -->
        <div class="hidden lg:flex bg-slate-950 p-0.5 rounded-sm border border-slate-800">
            <button class="tool-btn-sm" [class.active-tool]="engine.transformMode() === 'translate'" 
                    (click)="engine.setTransformMode('translate')" title="Translate (W)">
              <span class="material-symbols-outlined icon-sm">open_with</span>
            </button>
            <div class="w-px h-full bg-slate-900"></div>
            <button class="tool-btn-sm" [class.active-tool]="engine.transformMode() === 'rotate'" 
                    (click)="engine.setTransformMode('rotate')" title="Rotate (E)">
              <span class="material-symbols-outlined icon-sm">rotate_right</span>
            </button>
            <div class="w-px h-full bg-slate-900"></div>
            <button class="tool-btn-sm" [class.active-tool]="engine.transformMode() === 'scale'" 
                    (click)="engine.setTransformMode('scale')" title="Scale (R)">
              <span class="material-symbols-outlined icon-sm">aspect_ratio</span>
            </button>
        </div>

        <button class="tool-btn ml-1 hidden lg:flex" 
                [disabled]="engine.selectedEntity() === null"
                [class.opacity-30]="engine.selectedEntity() === null"
                [class.text-cyan-400]="engine.selectedEntity() !== null"
                (click)="engine.focusSelectedEntity()" 
                title="Focus Selection (F)">
          <span class="material-symbols-outlined icon-sm">center_focus_strong</span>
        </button>
      </div>

      <!-- Center: Playback (Floating with Glow) -->
      <div class="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center">
        <button class="w-8 h-8 rounded-full flex items-center justify-center transition-all border group relative overflow-hidden"
                [class.bg-emerald-600]="!engine.isPaused()"
                [class.border-emerald-400]="!engine.isPaused()"
                [class.text-white]="!engine.isPaused()"
                [class.shadow-[0_0_15px_rgba(16,185,129,0.4)]]="!engine.isPaused()"
                
                [class.bg-slate-900]="engine.isPaused()"
                [class.border-slate-700]="engine.isPaused()"
                [class.text-amber-500]="engine.isPaused()"
                [class.hover:border-amber-500]="engine.isPaused()"
                (click)="engine.togglePause()">
             
             <!-- Pulse effect when running -->
             @if (!engine.isPaused()) {
                <div class="absolute inset-0 bg-white/20 animate-ping rounded-full opacity-30"></div>
             }
             
             <span class="material-symbols-outlined icon-md relative z-10">{{ engine.isPaused() ? 'play_arrow' : 'pause' }}</span>
        </button>
      </div>
      
      <!-- Right: View Options -->
      <div class="flex items-center gap-2 shrink-0 ml-4">
        <!-- Toggles -->
        <div class="flex bg-slate-950 p-0.5 rounded-sm border border-slate-800 mr-2">
            <button class="tool-btn-sm" [class.active-tool]="showGrid()" (click)="toggleGrid()" title="Toggle Grid">
                <span class="material-symbols-outlined icon-sm">grid_3x3</span>
            </button>
            <div class="w-px h-full bg-slate-900"></div>
            <button class="tool-btn-sm" [class.active-tool]="engine.wireframe()" (click)="engine.toggleWireframe()" title="Toggle Wireframe">
                <span class="material-symbols-outlined icon-sm">deployed_code</span>
            </button>
            <div class="w-px h-full bg-slate-900"></div>
            <button class="tool-btn-sm" [class.active-tool]="engine.showPhysicsDebug()" (click)="engine.togglePhysicsDebug()" title="Toggle Physics Colliders">
                <span class="material-symbols-outlined icon-sm">bug_report</span>
            </button>
        </div>

        <button class="tool-btn lg:hidden" 
                [class.active-state]="layout.rightPanelOpen()" 
                (click)="layout.toggleRight()">
          <span class="material-symbols-outlined icon-sm">tune</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .tool-btn { @apply w-8 h-8 flex items-center justify-center rounded-sm hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors focus-visible:outline-cyan-400 border border-transparent; }
    .tool-btn.active-state { @apply text-cyan-400 bg-slate-800 border-slate-700; }
    
    .tool-btn-sm { @apply w-7 h-7 flex items-center justify-center hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-all focus-visible:outline-cyan-400; }
    .tool-btn-sm.active-tool { @apply text-cyan-400 bg-slate-900 shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)] border-t border-cyan-500/20; }
    
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
