
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mobile-transform-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col gap-3 items-center pointer-events-auto z-40 touch-none w-full max-w-sm px-4">
      <div class="flex items-center gap-2 bg-slate-950/90 p-2 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md">
        
        <button class="edit-btn" (click)="undo.emit()" [disabled]="!canUndo()" [class.opacity-40]="!canUndo()">
           <span class="material-symbols-outlined">undo</span>
        </button>
        
        <div class="w-px h-6 bg-slate-700/50 mx-1"></div>

        <!-- Transform Modes -->
        <button class="edit-btn" (click)="setMode.emit('translate')" [class.active-tool]="currentMode() === 'translate'">
           <span class="material-symbols-outlined">open_with</span>
        </button>
        <button class="edit-btn" (click)="setMode.emit('rotate')" [class.active-tool]="currentMode() === 'rotate'">
           <span class="material-symbols-outlined">rotate_right</span>
        </button>
        <button class="edit-btn" (click)="setMode.emit('scale')" [class.active-tool]="currentMode() === 'scale'">
           <span class="material-symbols-outlined">aspect_ratio</span>
        </button>

        <div class="w-px h-6 bg-slate-700/50 mx-1"></div>

        <button class="edit-btn" (click)="toggleInspector.emit()" [class.text-cyan-400]="hasSelection()">
           <span class="material-symbols-outlined">tune</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .edit-btn { @apply w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/50 text-slate-400 active:bg-cyan-900/50 active:text-white transition-colors; }
    .active-tool { @apply text-cyan-400 bg-cyan-950/40 border border-cyan-500/30; }
  `]
})
export class MobileTransformToolbarComponent {
  currentMode = input.required<'translate' | 'rotate' | 'scale'>();
  canUndo = input.required<boolean>();
  hasSelection = input.required<boolean>();
  
  setMode = output<'translate' | 'rotate' | 'scale'>();
  undo = output<void>();
  toggleInspector = output<void>();
}
