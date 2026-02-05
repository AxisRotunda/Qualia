
import { Component, computed, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EngineService } from '../services/engine.service';
import { EntityCategory, EntityTemplate } from '../data/entity-types';

@Component({
    selector: 'app-spawn-menu',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center pointer-events-none isolate">
      <div class="absolute inset-0 bg-slate-950/90 backdrop-blur-md pointer-events-auto transition-opacity animate-in fade-in duration-200"
           (click)="close.emit()"></div>

      <div class="relative w-full h-[65vh] sm:h-auto sm:max-h-[85vh] sm:w-[720px] bg-slate-900 border-t sm:border border-cyan-500/20 shadow-2xl shadow-cyan-900/20 rounded-t-2xl sm:rounded-xl flex flex-col pointer-events-auto animate-in slide-in-from-bottom duration-300 overflow-hidden ring-1 ring-cyan-500/10">
        <!-- Decorative corner accent -->
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-500/5 to-transparent pointer-events-none"></div>

        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-950/80 to-slate-900/80 shrink-0 relative z-10">
           <div class="flex items-center gap-3">
               <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-600 to-cyan-800 shadow-lg shadow-cyan-900/50 flex items-center justify-center text-white">
                   <span class="material-symbols-outlined text-xl">add</span>
               </div>
               <div class="flex flex-col">
                   <h2 class="text-sm font-bold text-slate-100 uppercase tracking-[0.15em]">Fabricator</h2>
                   <span class="text-[10px] text-cyan-500/70 font-mono tracking-wider">SELECT ENTITY TEMPLATE</span>
               </div>
           </div>
           <button (click)="close.emit()" class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-800/80 text-slate-400 hover:text-white transition-all active:scale-95">
             <span class="material-symbols-outlined text-xl">close</span>
           </button>
        </div>

        <!-- Category Tabs -->
        <div class="flex px-3 py-3 gap-2 overflow-x-auto no-scrollbar shrink-0 bg-slate-950/50 border-b border-slate-800/50">
           @for (cat of availableCategories(); track cat) {
              <button (click)="activeCategory.set(cat)"
                      [class.bg-cyan-600]="activeCategory() === cat"
                      [class.text-white]="activeCategory() === cat"
                      [class.border-cyan-400]="activeCategory() === cat"
                      [class.bg-slate-800/60]="activeCategory() !== cat"
                      [class.text-slate-400]="activeCategory() !== cat"
                      [class.border-slate-700]="activeCategory() !== cat"
                      class="px-4 py-2.5 rounded-lg border transition-all duration-200 flex items-center gap-2.5 whitespace-nowrap group shrink-0 hover:border-cyan-500/50">
                 <span class="material-symbols-outlined text-[20px] transition-transform duration-200 group-hover:scale-110">{{ getCategoryIcon(cat) }}</span>
                 <span class="text-[11px] font-bold uppercase tracking-wider">{{ cat }}</span>
              </button>
           }
        </div>

        <!-- Content Area -->
        <div class="flex-1 overflow-y-auto min-h-0 bg-gradient-to-b from-slate-900 to-slate-950">
           @if (filteredTemplates().length === 0) {
              <!-- Empty State -->
              <div class="flex flex-col items-center justify-center h-full py-12 text-slate-500">
                 <span class="material-symbols-outlined text-5xl mb-3 opacity-30">inventory_2</span>
                 <p class="text-sm font-medium">No items available</p>
                 <p class="text-xs opacity-60 mt-1">This category is currently empty</p>
              </div>
           } @else {
              <div class="p-5 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 pb-8">
                 @for (item of filteredTemplates(); track item.id) {
                    <button (click)="spawn(item)"
                            class="group relative flex flex-col aspect-square rounded-xl bg-slate-800/50 border border-slate-700/50 
                                   hover:bg-slate-800 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] 
                                   active:scale-95 transition-all duration-200 overflow-hidden">
                       <!-- Card Background Gradient -->
                       <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                       
                       <div class="flex-1 flex items-center justify-center relative">
                           <!-- Subtle vignette -->
                           <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                           
                           <!-- Icon -->
                           <span class="material-symbols-outlined text-4xl text-slate-500 group-hover:text-cyan-400 transition-all duration-200 drop-shadow-lg 
                                        scale-90 group-hover:scale-110 group-hover:drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">{{ item.icon }}</span>
                           
                           <!-- Color indicator for shapes -->
                           @if (item.category === 'shape' && item.color) {
                               <div class="absolute top-2.5 right-2.5 w-3 h-3 rounded-full ring-2 ring-slate-900 shadow-sm" 
                                    [style.background-color]="getAsHex(item.color)"></div>
                           }
                       </div>
                       
                       <!-- Label -->
                       <div class="px-3 py-2.5 bg-slate-950/60 border-t border-slate-800/50 backdrop-blur-sm relative">
                         <div class="text-[10px] font-semibold text-slate-300 group-hover:text-white leading-tight truncate text-center tracking-wide">{{ item.label }}</div>
                       </div>
                    </button>
                 }
              </div>
           }
        </div>
        
        <!-- Mobile Handle -->
        <div class="sm:hidden h-8 flex items-center justify-center shrink-0 border-t border-slate-800 bg-slate-900/50">
            <div class="w-10 h-1 bg-slate-600 rounded-full"></div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none;  scrollbar-width: none; }
  `]
})
export class SpawnMenuComponent {
    engine = inject(EngineService);
    close = output<void>();
    allCategories: EntityCategory[] = ['building', 'prop', 'nature', 'terrain', 'shape'];
    activeCategory = signal<EntityCategory>('building');

    // Only show categories that have templates
    availableCategories = computed(() => {
        return this.allCategories.filter(cat => 
            this.engine.library.getTemplatesByCategory(cat).length > 0
        );
    });

    filteredTemplates = computed(() => this.engine.library.getTemplatesByCategory(this.activeCategory()));

    getCategoryIcon(c: EntityCategory): string {
        switch (c) {
            case 'building': return 'domain';
            case 'prop': return 'deployed_code';
            case 'nature': return 'forest';
            case 'terrain': return 'landscape';
            case 'shape': return 'category';
            default: return 'help';
        }
    }

    spawn(item: EntityTemplate) {
        this.engine.spawner.startPlacement(item.id);
        this.close.emit();
    }

    getAsHex(color: number | undefined): string {
        if (!color) return 'transparent';
        return '#' + color.toString(16).padStart(6, '0');
    }
}
