
import { Component, computed, inject, signal } from '@angular/core';
import { EngineService } from '../services/engine.service';
import { Entity } from '../engine/core';

@Component({
  selector: 'app-scene-tree',
  standalone: true,
  template: `
    <div class="h-full flex flex-col text-slate-300">
      <div class="h-10 flex items-center px-4 border-b border-slate-800 bg-slate-900 font-bold text-xs tracking-wider text-slate-400 uppercase select-none">
        Outliner
      </div>
      
      <div class="flex-1 overflow-y-auto relative custom-scrollbar p-2" (scroll)="onScroll($event)">
        <!-- Virtual Scroll Spacer -->
        <div [style.height.px]="totalHeight()" class="absolute w-full top-0 left-0 z-0"></div>

        <!-- Rendered Items -->
        <div [style.transform]="'translateY(' + scrollOffset() + 'px)'" class="relative z-10 space-y-0.5">
          @for (entity of visibleEntities(); track entity) {
            <div 
              class="flex items-center gap-3 px-3 py-1.5 text-xs cursor-pointer rounded transition-all select-none group border border-transparent"
              [class.bg-cyan-950_40]="engine.selectedEntity() === entity"
              [class.border-cyan-900]="engine.selectedEntity() === entity"
              [class.text-cyan-300]="engine.selectedEntity() === entity"
              [class.text-slate-400]="engine.selectedEntity() !== entity"
              [class.hover:bg-slate-800]="engine.selectedEntity() !== entity"
              [class.hover:text-slate-200]="engine.selectedEntity() !== entity"
              (click)="select(entity)"
              (contextmenu)="onContextMenu($event, entity)"
            >
              <span class="material-symbols-outlined text-[14px] opacity-70 group-hover:opacity-100">
                  {{ entity % 2 === 0 ? 'deployed_code' : 'circle' }}
              </span>
              <span class="font-mono">Entity_{{ entity }}</span>
            </div>
          }
          @if (allEntities().length === 0) {
              <div class="text-center py-8 text-xs text-slate-600 italic">No objects in scene</div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .bg-cyan-950-40 { background-color: rgb(8 51 68 / 0.4); }
  `]
})
export class SceneTreeComponent {
  engine = inject(EngineService);

  private readonly ROW_HEIGHT = 30; // Increased touch target size
  private scrollTop = signal(0);
  
  // Computed wrapper to trigger updates when count changes
  allEntities = computed(() => {
    this.engine.objectCount(); 
    return Array.from(this.engine.world.entities);
  });

  totalHeight = computed(() => this.allEntities().length * this.ROW_HEIGHT);

  visibleEntities = computed(() => {
    const start = Math.floor(this.scrollTop() / this.ROW_HEIGHT);
    const end = start + 30; 
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
