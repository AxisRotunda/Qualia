
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-ui-panel',
  standalone: true,
  template: `
    <div class="flex flex-col bg-slate-900 border border-slate-700 rounded-lg overflow-hidden h-full shadow-lg">
      <!-- Header -->
      <div class="px-3 py-2 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between shrink-0">
        <h2 class="text-[11px] font-bold uppercase tracking-widest bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          {{ title() }}
        </h2>
        <div class="flex gap-2">
            <ng-content select="[header-actions]"></ng-content>
        </div>
      </div>

      <!-- Content -->
      <div class="p-3 flex-1 overflow-y-auto custom-scrollbar relative">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  `]
})
export class UiPanelComponent {
  title = input.required<string>();
}
