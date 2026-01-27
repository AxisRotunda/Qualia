
import { Component, computed, inject, signal } from '@angular/core';
import { EngineService } from '../services/engine.service';
import { Entity } from '../engine/core';

@Component({
  selector: 'app-scene-tree',
  standalone: true,
  template: `
    <div class="h-full flex flex-col text-slate-300">
      <div class="h-9 flex items-center justify-between px-3 border-b border-slate-800 bg-slate-950/50">
        <span class="text-[11px] tracking-wide text-slate-500 font-bold uppercase">Outliner</span>
        <span class="text-[10px] text-slate-600 font-mono">{{ engine.objectCount() }} OBJ</span>
      </div>
      
      <div class="flex-1 overflow-y-auto relative custom-scrollbar" (scroll)="onScroll($event)">
        <!-- Virtual Scroll Spacer -->
        <div [style.height.px]="totalHeight()" class="absolute w-full top-0 left-0 z-0"></div>

        <!-- Rendered Items -->
        <div [style.transform]="'translateY(' + scrollOffset() + 'px)'" class="relative z-10">
          @for (entity of visibleEntities(); track entity) {
            <div 
              class="flex items-center gap-2.5 px-3 h-[30px] text-xs cursor-pointer select-none transition-colors border-l-2"
              [class.bg-cyan-950_30]="engine.selectedEntity() === entity"
              [class.border-cyan-400]="engine.selectedEntity() === entity"
              [class.border-transparent]="engine.selectedEntity() !== entity"
              [class.text-cyan-300]="engine.selectedEntity() === entity"
              [class.text-slate-400]="engine.selectedEntity() !== entity"
              [class.hover:bg-slate-800]="engine.selectedEntity() !== entity"
              [class.hover:text-slate-200]="engine.selectedEntity() !== entity"
              (click)="select(entity)"
              (contextmenu)="onContextMenu($event, entity)"
            >
              <span class="material-symbols-outlined text-[14px] opacity-70">
                  {{ entity % 2 === 0 ? 'deployed_code' : 'circle' }}
              </span>
              <span class="font-mono truncate">Entity_{{ entity }}</span>
            </div>
          }
          @if (allEntities().length === 0) {
              <div class="flex flex-col items-center justify-center py-12 text-slate-600 gap-2">
                 <span class="material-symbols-outlined text-xl opacity-50">inbox</span>
                 <span class="text-xs italic">Scene is empty</span>
              </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .bg-cyan-950-30 { background-color: rgb(8 51 68 / 0.3); }
  `]
})
export class SceneTreeComponent {
  engine = inject(EngineService);

  private readonly ROW_HEIGHT = 30;
  private scrollTop = signal(0);
  
  allEntities = computed(() => {
    this.engine.objectCount(); 
    return Array.from(this.engine.world.entities);
  });

  totalHeight = computed(() => this.allEntities().length * this.ROW_HEIGHT);

  visibleEntities = computed(() => {
    const start = Math.floor(this.scrollTop() / this.ROW_HEIGHT);
    const end = start + 40; // Render slightly more buffer
    const all = this.allEntities();
    return all.slice(start, end);
  });

  scrollOffset = computed(() => {
    return Math.floor(this.scrollTop() / this.ROW_HEIGHT) * this.ROW_HEIGHT;
  });

  onScroll(e: Event) {
    this.scrollTop.set((e.target as HTMLElement).scrollTop);
  }

  select(e: Entity) {
    this.engine.selectedEntity.set(e);
  }

  onContextMenu(e: MouseEvent, entity: Entity) {
      e.preventDefault();
      this.select(entity);
  }
}
