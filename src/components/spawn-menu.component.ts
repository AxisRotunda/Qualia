
import { Component, computed, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntityLibraryService } from '../services/entity-library.service';
import { EntityCategory, EntityTemplate } from '../data/entity-types';
import { EngineService } from '../services/engine.service';

@Component({
  selector: 'app-spawn-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center pointer-events-none">
      
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity" 
           (click)="close.emit()"></div>

      <!-- Panel -->
      <div class="relative w-full sm:w-[600px] max-h-[80vh] bg-slate-900 border-t sm:border border-slate-700 shadow-2xl rounded-t-2xl sm:rounded-2xl flex flex-col pointer-events-auto animate-in slide-in-from-bottom duration-300 overflow-hidden">
        
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/50 shrink-0">
           <h2 class="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
             <span class="material-symbols-outlined text-cyan-500">add_circle</span> Spawn Entity
           </h2>
           <button (click)="close.emit()" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 text-slate-400">
             <span class="material-symbols-outlined">close</span>
           </button>
        </div>

        <!-- Category Tabs -->
        <div class="flex p-2 gap-1 overflow-x-auto no-scrollbar shrink-0 bg-slate-900/50">
           @for (cat of categories; track cat) {
              <button (click)="activeCategory.set(cat)"
                      [class.bg-cyan-950]="activeCategory() === cat"
                      [class.text-cyan-400]="activeCategory() === cat"
                      [class.border-cyan-800]="activeCategory() === cat"
                      [class.bg-slate-800]="activeCategory() !== cat"
                      [class.text-slate-400]="activeCategory() !== cat"
                      [class.border-slate-700]="activeCategory() !== cat"
                      class="px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-2 whitespace-nowrap capitalize">
                 <span class="material-symbols-outlined text-[16px]">{{ getCategoryIcon(cat) }}</span>
                 {{ cat }}
              </button>
           }
        </div>

        <!-- Grid -->
        <div class="p-4 overflow-y-auto min-h-[300px]">
           <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
              @for (item of filteredTemplates(); track item.id) {
                 <button (click)="spawn(item)"
                         class="group relative flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-900/20 transition-all text-center">
                    
                    <div class="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center border border-slate-700 group-hover:border-cyan-500/30 group-hover:scale-110 transition-transform">
                       <span class="material-symbols-outlined text-3xl text-slate-500 group-hover:text-cyan-400 transition-colors">{{ item.icon }}</span>
                    </div>
                    
                    <div class="flex flex-col gap-0.5">
                      <span class="text-[10px] font-bold text-slate-300 group-hover:text-white leading-tight">{{ item.label }}</span>
                      <span class="text-[9px] text-slate-500 uppercase">{{ item.geometry }}</span>
                    </div>

                    <!-- Shape Preview Hint -->
                    @if (item.category === 'shape') {
                        <div class="absolute top-2 right-2 w-2 h-2 rounded-full" [style.background-color]="getAsHex(item.color)"></div>
                    }
                 </button>
              }
           </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .no-scrollbar::-webkit-scrollbar { display: none; }
  `]
})
export class SpawnMenuComponent {
  entityLib = inject(EntityLibraryService);
  engine = inject(EngineService);
  
  close = output<void>();
  
  categories: EntityCategory[] = ['building', 'prop', 'nature', 'terrain', 'shape'];
  activeCategory = signal<EntityCategory>('building');

  filteredTemplates = computed(() => {
     return this.entityLib.templates.filter(t => t.category === this.activeCategory());
  });

  getCategoryIcon(c: EntityCategory): string {
      switch(c) {
          case 'building': return 'domain';
          case 'prop': return 'deployed_code';
          case 'nature': return 'forest';
          case 'terrain': return 'landscape';
          case 'shape': return 'category';
      }
  }

  spawn(item: EntityTemplate) {
      this.engine.startPlacement(item.id);
      this.close.emit();
  }

  getAsHex(color: number | undefined): string {
      if (!color) return 'transparent';
      return '#' + color.toString(16).padStart(6, '0');
  }
}
