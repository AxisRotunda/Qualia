
import { Component, computed, inject, signal } from '@angular/core';
import { EngineService } from '../services/engine.service';
import { Entity } from '../engine/core';
import { UiPanelComponent } from './ui-panel.component';

@Component({
  selector: 'app-scene-tree',
  standalone: true,
  imports: [UiPanelComponent],
  template: `
    <div class="h-full p-2 bg-slate-950/50">
      <app-ui-panel title="Entities">
        
        <!-- Search Header -->
        <div header-actions class="flex items-center">
             <span class="text-[10px] text-slate-500 font-mono">{{ filteredCount() }} / {{ engine.objectCount() }}</span>
        </div>

        <div class="mb-3 sticky top-0 z-20">
            <div class="relative">
                <span class="material-symbols-outlined absolute left-2 top-1.5 text-slate-500 text-xs">search</span>
                <input 
                    type="text" 
                    placeholder="Search entities..." 
                    (input)="searchQuery.set($any($event.target).value)"
                    class="w-full bg-slate-950 border border-slate-800 rounded py-1 pl-7 pr-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-600 transition-colors"
                >
            </div>
        </div>

        <!-- Virtual Scroll Container -->
        <div class="relative min-h-0" [style.height.px]="400" (scroll)="onScroll($event)" style="height: calc(100vh - 200px);">
          
          <div [style.height.px]="totalHeight()" class="absolute w-full top-0 left-0 z-0"></div>

          <div [style.transform]="'translateY(' + scrollOffset() + 'px)'" class="relative z-10">
            @for (entity of visibleEntities(); track entity) {
              <div 
                class="flex items-center gap-2 px-2 h-[30px] text-xs cursor-pointer select-none transition-all rounded border border-transparent"
                [class.bg-cyan-950_50]="engine.selectedEntity() === entity"
                [class.border-cyan-800]="engine.selectedEntity() === entity"
                [class.text-cyan-200]="engine.selectedEntity() === entity"
                [class.text-slate-400]="engine.selectedEntity() !== entity"
                [class.hover:bg-slate-800]="engine.selectedEntity() !== entity"
                (click)="select(entity)"
                (contextmenu)="onContextMenu($event, entity)"
              >
                <span class="material-symbols-outlined text-[14px] opacity-70">
                    {{ getIcon(entity) }}
                </span>
                <span class="font-mono truncate flex-1">{{ engine.getEntityName(entity) }}</span>
              </div>
            }
            
            @if (filteredCount() === 0) {
                <div class="flex flex-col items-center justify-center py-8 text-slate-600 gap-1 opacity-60">
                   <span class="text-xs italic">No entities found</span>
                </div>
            }
          </div>
        </div>

      </app-ui-panel>
    </div>
  `,
  styles: [`
    .bg-cyan-950-50 { background-color: rgb(8 51 68 / 0.5); }
  `]
})
export class SceneTreeComponent {
  engine = inject(EngineService);

  private readonly ROW_HEIGHT = 30;
  private scrollTop = signal(0);
  searchQuery = signal('');
  
  // Get all entities as an array, filtered by search
  filteredEntities = computed(() => {
    // Trigger on count change
    this.engine.objectCount();
    const query = this.searchQuery().toLowerCase();
    
    const all = Array.from(this.engine.world.entities);
    
    if (!query) return all;
    
    return all.filter(e => {
        const name = this.engine.getEntityName(e).toLowerCase();
        return name.includes(query);
    });
  });

  filteredCount = computed(() => this.filteredEntities().length);
  totalHeight = computed(() => this.filteredCount() * this.ROW_HEIGHT);

  visibleEntities = computed(() => {
    const start = Math.floor(this.scrollTop() / this.ROW_HEIGHT);
    const end = start + 30; // Viewport size roughly
    return this.filteredEntities().slice(start, end);
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
  
  getIcon(e: Entity): string {
      // Simple heuristic for icon based on name or component
      const name = this.engine.getEntityName(e).toLowerCase();
      if (name.includes('light') || name.includes('sun')) return 'light_mode';
      if (name.includes('cam')) return 'videocam';
      if (name.includes('box') || name.includes('crate')) return 'package_2';
      if (name.includes('sphere') || name.includes('ball')) return 'circle';
      return 'deployed_code';
  }
}
