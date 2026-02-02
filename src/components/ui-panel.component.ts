
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-ui-panel',
  standalone: true,
  host: {
    'class': 'flex flex-col bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden h-full shadow-2xl relative isolate transition-all'
  },
  template: `
    <!-- Clean Header -->
    <div class="h-12 px-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/5 select-none">
      <h2 class="text-xs font-bold uppercase tracking-widest text-slate-300">
        {{ title() }}
      </h2>
      <div class="flex gap-2">
          <ng-content select="[header-actions]"></ng-content>
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-y-auto custom-scrollbar p-3 relative">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host { display: flex; }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
  `]
})
export class UiPanelComponent {
  title = input.required<string>();
}
