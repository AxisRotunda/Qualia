
import { Component, computed, inject, signal } from '@angular/core';
import { EngineService } from '../services/engine.service';
import { Entity } from '../engine/core';

@Component({
  selector: 'app-scene-tree',
  standalone: true,
  template: `
    <div class="h-full flex flex-col bg-slate-900 border-r border-slate-700 text-slate-300">
      <div class="p-3 border-b border-slate-700 font-bold text-sm tracking-wide bg-slate-950">
        SCENE HIERARCHY
      </div>
      
      <div class="flex-1 overflow-y-auto relative" (scroll)="onScroll($event)">
        <!-- Virtual Scroll Spacer -->
        <div [style.height.px]="totalHeight()" class="absolute w-full top-0 left-0 z-0"></div>

        <!-- Rendered Items -->
        <div [style.transform]="'translateY(' + scrollOffset() + 'px)'" class="relative z-10">
          @for (entity of visibleEntities(); track entity) {
            <div 
              class="flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer border-l-2 transition-colors"
              [class.bg-cyan-900_20]="engine.selectedEntity() === entity"
              [class.border-cyan-400]="engine.selectedEntity() === entity"
              [class.border-transparent]="engine.selectedEntity() !== entity"
              [class.text-cyan-400]="engine.selectedEntity() === entity"
              [class.hover:bg-slate-800]="engine.selectedEntity() !== entity"
              (click)="select(entity)"
            >
              <span class="text-slate-500 material-symbols-outlined text-[10px]">{{ getIcon(entity) }}</span>
              <span>Entity {{ entity }}</span>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: #334155; }
  `]
})
export class SceneTreeComponent {
  engine = inject(EngineService);

  private readonly ROW_HEIGHT = 28;
  private scrollTop = signal(0);
  
  // React to object count changes to refresh the set conversion
  private allEntities = computed(() => {
    // Dependency on objectCount ensures re-evaluation when entities change
    this.engine.objectCount(); 
    return Array.from(this.engine.world.entities);
  });

  totalHeight = computed(() => this.allEntities().length * this.ROW_HEIGHT);

  visibleEntities = computed(() => {
    const start = Math.floor(this.scrollTop() / this.ROW_HEIGHT);
    // Buffer a few items
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

  getIcon(e: Entity): string {
    // Simple check: if radius exists in creation logic it's a sphere, else box.
    // For now, we don't store "type" in ECS explicitly for the icon, but we can assume 'cube' generic
    return '◈';
  }
}
