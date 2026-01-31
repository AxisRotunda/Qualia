
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-ui-panel',
  standalone: true,
  template: `
    <div class="flex flex-col bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-sm overflow-hidden h-full shadow-2xl relative group isolate ring-1 ring-white/5"
         [attr.aria-label]="title()"
         role="region">
      
      <!-- Tech Decor: Corner Brackets -->
      <div class="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-slate-500 z-20 opacity-50 group-hover:opacity-100 transition-opacity"></div>
      <div class="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-cyan-500 z-20 shadow-[0_0_8px_rgba(6,182,212,0.6)]"></div>
      <div class="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-slate-500 z-20 opacity-50 group-hover:opacity-100 transition-opacity"></div>
      <div class="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-slate-500 z-20 opacity-50 group-hover:opacity-100 transition-opacity"></div>

      <!-- Header -->
      <div class="h-9 px-3 border-b border-slate-800 bg-gradient-to-r from-slate-900/80 to-slate-900/40 flex items-center justify-between shrink-0 relative select-none">
        <div class="flex items-center gap-2.5">
            <!-- Status LED -->
            <div class="w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_6px_rgba(34,211,238,0.8)]"></div>
            <h2 class="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-200 font-mono text-shadow-sm">
              {{ title() }}
            </h2>
        </div>
        <div class="flex gap-2">
            <ng-content select="[header-actions]"></ng-content>
        </div>
        
        <!-- Header Accent Line -->
        <div class="absolute bottom-[-1px] left-0 h-px bg-gradient-to-r from-cyan-500/40 via-transparent to-transparent w-2/3"></div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto custom-scrollbar relative p-2 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-[0.02]">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .text-shadow-sm { text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.5); }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 2px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
  `]
})
export class UiPanelComponent {
  title = input.required<string>();
}
