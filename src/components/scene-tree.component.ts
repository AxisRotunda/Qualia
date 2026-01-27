
import { Component, computed, inject, signal } from '@angular/core';
import { EngineService } from '../services/engine.service';
import { Entity } from '../engine/core';

@Component({
  selector: 'app-scene-tree',
  standalone: true,
  template: `
    <div class="h-full flex flex-col text-slate-300">
      <div class="p-3 border-b border-slate-700 font-bold text-xs tracking-wide bg-slate-950 text-slate-400">
        HIERARCHY
      </div>
      
      <div class="flex-1 overflow-y-auto relative custom-scrollbar" (scroll)="onScroll($event)">
        <!-- Virtual Scroll Spacer -->
        <div [style.height.px]="totalHeight()" class="absolute w-full top-0 left-0 z-0"></div>

        <!-- Rendered Items -->
        <div [style.transform]="'translateY(' + scrollOffset() + 'px)'" class="relative z-10">
          @for (entity of visibleEntities(); track entity) {
            <div 
              class="flex items-center gap-2 px-3 py-1 text-xs cursor-pointer border-l-2 transition-all select-none group"
              [class.bg-cyan-900_20]="engine.selectedEntity() === entity"
              [class.bg-cyan-900-20]="engine.selectedEntity() === entity" 
              [class.border-cyan-400]="engine.selectedEntity() === entity"
              [class.border-transparent]="engine.selectedEntity() !== entity"
              [class.text-cyan-300]="engine.selectedEntity() === entity"
              [class.hover:bg-slate-800]="engine.selectedEntity() !== entity"
              (click)="select(entity)"
              (contextmenu)="onContextMenu($event, entity)"
            >
              <span class="material-symbols-outlined text-[10px] opacity-70 group-hover:opacity-100">data_object</span>
              <span class="font-mono opacity-90">Entity_{{ entity }}</span>
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
    .bg-cyan-900-20 { background-color: rgb(22 78 99 / 0.3); }
  `]
})
export class SceneTreeComponent {
  engine = inject(EngineService);

  private readonly ROW_HEIGHT = 26;
  private scrollTop = signal(0);
  
  private allEntities = computed(() => {
    this.engine.objectCount(); 
    return Array.from(this.engine.world.entities);
  });

  totalHeight = computed(() => this.allEntities().length * this.ROW_HEIGHT);

  visibleEntities = computed(() => {
    const start = Math.floor(this.scrollTop() / this.ROW_HEIGHT);
    const end = start + 40; 
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
      // Basic implementation for now: just select
      this.select(entity);
  }
}
