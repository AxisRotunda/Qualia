
import { Component, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EngineService } from '../../services/engine.service';

@Component({
  selector: 'app-mobile-context-actions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- The "Grab/Release" Toggle Button -->
    <div class="fixed top-1/2 right-6 -translate-y-1/2 z-40 flex flex-col items-center gap-3 pointer-events-auto animate-in slide-in-from-right duration-500">
        
        @if (controlMode() === 'object') {
            <!-- Dynamic Label for Active Manipulation -->
            <div class="absolute -top-12 right-0 whitespace-nowrap bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded text-[8px] font-black text-cyan-400 tracking-[0.2em] animate-pulse">
                TARGET_LOCKED: {{ targetName() }}
            </div>
        }

        <button (click)="toggleControlMode.emit()"
                class="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl border transition-all active:scale-95 backdrop-blur-xl relative group"
                [class.bg-cyan-600_80]="controlMode() === 'object'"
                [class.border-cyan-400]="controlMode() === 'object'"
                [class.text-white]="controlMode() === 'object'"
                [class.bg-slate-900_80]="controlMode() === 'camera'"
                [class.border-slate-700]="controlMode() === 'camera'"
                [class.text-slate-400]="controlMode() === 'camera'">
            
            <div class="absolute inset-1 border border-white/5 rounded-xl pointer-events-none"></div>
            
            <span class="material-symbols-outlined text-[32px] transition-transform group-active:scale-110">
                {{ controlMode() === 'object' ? 'open_with' : 'back_hand' }}
            </span>
        </button>
        
        <span class="text-[9px] font-black tracking-[0.3em] uppercase text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {{ controlMode() === 'object' ? 'RELEASE' : 'GRAB' }}
        </span>
    </div>

    <!-- Deselect / Delete Quick Actions (Bottom Center-Right) -->
    <div class="fixed bottom-32 right-1/2 translate-x-1/2 flex gap-6 z-40 pointer-events-auto animate-in fade-in slide-in-from-bottom-6 duration-500">
       <button (click)="deselect.emit()" 
               class="h-12 px-6 rounded-2xl bg-slate-950/90 border border-slate-700 text-slate-200 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl active:bg-slate-800 backdrop-blur-md transition-all">
           <span class="material-symbols-outlined text-lg text-slate-500">close</span> Deselect
       </button>
       
       <button (click)="deleteSelected.emit()" 
               class="h-12 w-12 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-400 flex items-center justify-center shadow-2xl active:bg-rose-900 active:scale-90 backdrop-blur-md transition-all">
           <span class="material-symbols-outlined text-xl">delete_forever</span>
       </button>
    </div>
  `,
  styles: [`
    .bg-slate-900_80 { background-color: rgba(15, 23, 42, 0.8); }
    .bg-cyan-600_80 { background-color: rgba(8, 145, 178, 0.8); }
  `]
})
export class MobileContextActionsComponent {
  engine = inject(EngineService);
  controlMode = input.required<'camera' | 'object'>();
  
  toggleControlMode = output<void>();
  deselect = output<void>();
  deleteSelected = output<void>();

  targetName = computed(() => {
      const e = this.engine.selectedEntity();
      return e !== null ? this.engine.ops.getEntityName(e).toUpperCase() : 'VOID';
  });
}
