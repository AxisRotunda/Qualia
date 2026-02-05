
import { Component, input, output } from '@angular/core';

@Component({
    selector: 'app-context-menu',
    standalone: true,
    template: `
    <div class="absolute bg-slate-900 border border-slate-700 shadow-xl rounded-lg py-1 z-50 min-w-[140px] animate-in fade-in zoom-in-95 duration-100"
         [style.top.px]="y()"
         [style.left.px]="x()">
       <button class="menu-item" (click)="select.emit(entityId())">
         <span class="material-symbols-outlined icon-xs">check_circle</span> Select
       </button>
       <button class="menu-item" (click)="duplicate.emit(entityId())">
         <span class="material-symbols-outlined icon-xs">content_copy</span> Duplicate
       </button>
       <div class="h-px bg-slate-800 my-1 mx-2"></div>
       <button class="menu-item text-red-400 hover:bg-red-950/50" (click)="deleteEntity.emit(entityId())">
         <span class="material-symbols-outlined icon-xs">delete</span> Delete
       </button>
    </div>
  `,
    styles: [`
    .menu-item { @apply w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-slate-800 transition-colors text-slate-300; }
    .icon-xs { font-size: 16px; }
  `]
})
export class ContextMenuComponent {
    x = input.required<number>();
    y = input.required<number>();
    entityId = input.required<number>();

    select = output<number>();
    duplicate = output<number>();
    deleteEntity = output<number>();
    close = output<void>();
}
