
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
      
      <!-- Backdrop with Blur -->
      <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm pointer-events-auto transition-opacity animate-in fade-in duration-200" 
           (click)="close.emit()"></div>

      <!-- Panel Container -->
      <div class="relative w-full h-[60vh] sm:h-auto sm:max-h-[85vh] sm:w-[680px] bg-slate-900 border-t sm:border border-cyan-900/30 shadow-2xl rounded-t-2xl sm:rounded-xl flex flex-col pointer-events-auto animate-in slide-in-from-bottom duration-300 overflow-hidden ring-1 ring-white/5">
        
        <!-- Technical Decor -->
        <div class="absolute top-0 right-0 p-2 pointer-events-none opacity-20">
            <span class="material-symbols-outlined text-4xl text-cyan-500">grid_4x4</span>
        </div>

        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/50 shrink-0 relative z-10">
           <div class="flex items-center gap-3">
               <div class="w-8 h-8 rounded bg-cyan-950/50 border border-cyan-900 flex items-center justify-center text-cyan-400">
                   <span class="material-symbols-outlined text-lg">add</span>
               </div>
               <div class="flex flex-col">
                   <h2 class="text-xs font-bold text-slate-100 uppercase tracking-[0.2em]">Fabricator</h2>
                   <span class="text-[9px] text-slate-500 font-mono">SELECT ENTITY TEMPLATE</span>
               </div>
           </div>
           <button (click)="close.emit()" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 text-slate-400 active:text-white transition-colors">
             <span class="material-symbols-outlined">close</span>
           </button>
        </div>

        <!-- Category Tabs (Scrollable) -->
        <div class="flex px-2 py-2 gap-1 overflow-x-auto no-scrollbar shrink-0 bg-slate-950/30 border-b border-slate-800/50">
           @for (cat of categories; track cat) {
              <button (click)="activeCategory.set(cat)"
                      [class.bg-cyan-950_80]="activeCategory() === cat"
                      [class.text-cyan-400]="activeCategory() === cat"
                      [class.border-cyan-700]="activeCategory() === cat"
                      [class.shadow-glow]="activeCategory() === cat"
                      [class.bg-slate-900]="activeCategory() !== cat"
                      [class.text-slate-500]="activeCategory() !== cat"
                      [class.border-transparent]="activeCategory() !== cat"
                      class="px-3 py-2 rounded border transition-all flex items-center gap-2 whitespace-nowrap group shrink-0">
                 <span class="material-symbols-outlined text-[18px] opacity-70 group-hover:opacity-100">{{ getCategoryIcon(cat) }}</span>
                 <span class="text-[10px] font-bold uppercase tracking-wider">{{ cat }}</span>
              </button>
           }
        </div>

        <!-- Grid Content -->
        <div class="flex-1 overflow-y-auto min-h-0 p-4 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
           <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pb-8">
              @for (item of filteredTemplates(); track item.id) {
                 <button (click)="spawn(item)"
                         class="group relative flex flex-col aspect-square rounded-lg bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] active:scale-95 transition-all overflow-hidden">
                    
                    <!-- Item Preview Icon -->
                    <div class="flex-1 flex items-center justify-center relative">
                        <div class="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-50"></div>
                        <span class="material-symbols-outlined text-4xl text-slate-600 group-hover:text-cyan-400 transition-colors drop-shadow-lg scale-90 group-hover:scale-100 duration-200 ease-out">{{ item.icon }}</span>
                        
                        <!-- Shape Color Dot -->
                        @if (item.category === 'shape') {
                            <div class="absolute top-2 right-2 w-2 h-2 rounded-full ring-1 ring-black/50" [style.background-color]="getAsHex(item.color)"></div>
                        }
                    </div>
                    
                    <!-- Label -->
                    <div class="px-2 py-2 bg-slate-950/50 border-t border-slate-800/50 backdrop-blur-sm">
                      <div class="text-[9px] font-bold text-slate-300 group-hover:text-white leading-tight truncate text-center font-mono">{{ item.label }}</div>
                    </div>
                 </button>
              }
           </div>
        </div>
        
        <!-- Mobile Footer Handle (Visual Only) -->
        <div class="sm:hidden h-6 flex items-center justify-center shrink-0 border-t border-slate-800 bg-slate-900">
            <div class="w-12 h-1 bg-slate-700 rounded-full"></div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none;  scrollbar-width: none; }
    .bg-cyan-950_80 { background-color: rgba(8, 51, 68, 0.8); }
    .shadow-glow { box-shadow: 0 0 10px rgba(6,182,212,0.15), inset 0 0 0 1px rgba(6,182,212,0.2); }
  `]
})
export class SpawnMenuComponent {
  engine = inject(EngineService);
  
  close = output<void>();
  
  categories: EntityCategory[] = ['building', 'prop', 'nature', 'terrain', 'shape'];
  activeCategory = signal<EntityCategory>('building');

  filteredTemplates = computed(() => {
     return this.engine.library.templates.filter(t => t.category === this.activeCategory());
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
      this.engine.spawner.startPlacement(item.id);
      this.close.emit();
  }

  getAsHex(color: number | undefined): string {
      if (!color) return 'transparent';
      return '#' + color.toString(16).padStart(6, '0');
  }
}
