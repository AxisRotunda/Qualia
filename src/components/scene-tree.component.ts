
import { Component, computed, inject, signal } from '@angular/core';
import { EngineService } from '../services/engine.service';
import { Entity } from '../engine/core';
import { UiPanelComponent } from './ui-panel.component';

@Component({
  selector: 'app-scene-tree',
  standalone: true,
  imports: [UiPanelComponent],
  template: `
    <div class="h-full bg-transparent flex flex-col">
      <app-ui-panel title="MANIFEST">
        
        <!-- Header Extras -->
        <div header-actions class="flex items-center gap-2">
             <span class="text-[9px] font-mono text-cyan-500 bg-cyan-950/30 px-1.5 py-0.5 rounded border border-cyan-900/50 tabular-nums">
                {{ filteredCount() }} / {{ engine.objectCount() }}
             </span>
        </div>

        <!-- Search -->
        <div class="mb-2 sticky top-0 z-20 px-1 pt-1 bg-transparent">
            <div class="relative group">
                <span class="material-symbols-outlined absolute left-2 top-1.5 text-slate-500 text-xs group-focus-within:text-cyan-400 transition-colors">search</span>
                <input 
                    type="text" 
                    placeholder="FILTER SIGNAL..." 
                    (input)="searchQuery.set($any($event.target).value)"
                    class="w-full bg-slate-900/80 border border-slate-700/50 rounded-sm py-1 pl-7 pr-2 text-[10px] text-slate-300 focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-600 transition-all font-mono tracking-wide uppercase"
                >
            </div>
        </div>

        <!-- Virtual Scroll Container -->
        <div class="relative min-h-0 px-1 flex-1" (scroll)="onScroll($event)" style="height: calc(100vh - 160px); overflow-y: auto;">
          
          <div [style.height.px]="totalHeight()" class="absolute w-full top-0 left-0 z-0"></div>

          <div [style.transform]="'translateY(' + scrollOffset() + 'px)'" class="relative z-10 flex flex-col gap-[1px]">
            @for (entity of visibleEntities(); track entity) {
              <div 
                class="flex items-center gap-2 px-2 h-[28px] text-[11px] cursor-pointer select-none transition-all group relative border-l-[3px]"
                [class.bg-gradient-to-r]="engine.selectedEntity() === entity"
                [class.from-cyan-900_40]="engine.selectedEntity() === entity"
                [class.to-transparent]="engine.selectedEntity() === entity"
                [class.border-cyan-400]="engine.selectedEntity() === entity"
                [class.text-cyan-100]="engine.selectedEntity() === entity"
                [class.shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]]="engine.selectedEntity() === entity"
                
                [class.border-transparent]="engine.selectedEntity() !== entity"
                [class.text-slate-400]="engine.selectedEntity() !== entity"
                [class.hover:bg-slate-800]="engine.selectedEntity() !== entity"
                [class.hover:text-slate-200]="engine.selectedEntity() !== entity"
                [class.hover:border-slate-600]="engine.selectedEntity() !== entity"
                
                (click)="select(entity)"
                (contextmenu)="onContextMenu($event, entity)"
              >
                <!-- Active Indicator Dot -->
                @if (engine.selectedEntity() === entity) {
                    <div class="absolute left-[-3px] top-0 bottom-0 w-[3px] bg-cyan-400 shadow-[0_0_8px_cyan]"></div>
                }

                <span class="material-symbols-outlined text-[14px] opacity-70 group-hover:opacity-100 transition-opacity">
                    {{ getIcon(entity) }}
                </span>
                <span class="font-mono truncate flex-1 tracking-tight">{{ engine.getEntityName(entity) }}</span>
                <span class="text-[9px] text-slate-600 font-mono">{{ entity }}</span>
              </div>
            }
            
            @if (filteredCount() === 0) {
                <div class="flex flex-col items-center justify-center py-12 text-slate-600 gap-2 opacity-60">
                   <span class="material-symbols-outlined text-2xl">wifi_off</span>
                   <span class="text-[10px] font-mono uppercase tracking-widest">No Signal</span>
                </div>
            }
          </div>
        </div>

      </app-ui-panel>
    </div>
  `,
  styles: [`
    .bg-cyan-900_40 { background-color: rgba(8, 51, 68, 0.4); }
  `]
})
export class SceneTreeComponent {
  engine = inject(EngineService);

  private readonly ROW_HEIGHT = 29; 
  private scrollTop = signal(0);
  searchQuery = signal('');
  
  filteredEntities = computed(() => {
    this.engine.objectCount(); // Dependency
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
    const end = start + 30; // Render buffer
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
      const name = this.engine.getEntityName(e).toLowerCase();
      if (name.includes('light') || name.includes('sun')) return 'light_mode';
      if (name.includes('cam')) return 'videocam';
      if (name.includes('box') || name.includes('crate')) return 'package_2';
      if (name.includes('sphere') || name.includes('ball')) return 'circle';
      return 'deployed_code';
  }
}
