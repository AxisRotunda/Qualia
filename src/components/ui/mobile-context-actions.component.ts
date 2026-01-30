
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mobile-context-actions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- The "Grab/Release" Toggle Button -->
    <div class="fixed top-1/2 right-4 -translate-y-1/2 z-40 flex flex-col items-center gap-2 pointer-events-auto animate-in slide-in-from-right duration-200">
        <button (click)="toggleControlMode.emit()"
                class="w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-2 transition-all active:scale-95 backdrop-blur-md"
                [class.bg-cyan-600]="controlMode() === 'object'"
                [class.border-cyan-400]="controlMode() === 'object'"
                [class.text-white]="controlMode() === 'object'"
                [class.bg-slate-900_80]="controlMode() === 'camera'"
                [class.border-slate-600]="controlMode() === 'camera'"
                [class.text-slate-400]="controlMode() === 'camera'">
            <span class="material-symbols-outlined text-[28px]">{{ controlMode() === 'object' ? 'open_with' : 'back_hand' }}</span>
        </button>
        <span class="text-[9px] font-bold tracking-widest uppercase text-white shadow-black drop-shadow-md">
            {{ controlMode() === 'object' ? 'RELEASE' : 'GRAB' }}
        </span>
    </div>

    <!-- Deselect / Delete Quick Actions (Bottom Center-Right) -->
    <div class="fixed bottom-32 right-1/2 translate-x-1/2 flex gap-4 z-40 pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
       <button (click)="deselect.emit()" 
               class="h-10 px-4 rounded-full bg-slate-900/80 border border-slate-600 text-slate-300 text-xs font-bold uppercase tracking-wide flex items-center gap-2 shadow-lg active:bg-slate-800">
           <span class="material-symbols-outlined text-sm">close</span> Deselect
       </button>
       
       <button (click)="deleteSelected.emit()" 
               class="h-10 w-10 rounded-full bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center shadow-lg active:bg-rose-900">
           <span class="material-symbols-outlined text-sm">delete</span>
       </button>
    </div>
  `,
  styles: [`
    .bg-slate-900_80 { background-color: rgb(15 23 42 / 0.8); }
  `]
})
export class MobileContextActionsComponent {
  controlMode = input.required<'camera' | 'object'>();
  
  toggleControlMode = output<void>();
  deselect = output<void>();
  deleteSelected = output<void>();
}
