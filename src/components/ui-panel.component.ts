
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-ui-panel',
  standalone: true,
  template: `
    <div class="flex flex-col bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-sm overflow-hidden h-full shadow-2xl relative group isolate">
      <!-- Background Noise & Scanline Effect -->
      <div class="absolute inset-0 opacity-[0.03] pointer-events-none z-[-1] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      <div class="absolute inset-0 pointer-events-none z-[-1] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] bg-repeat"></div>

      <!-- Tech Accent: Corner Markers -->
      <div class="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500/50 group-hover:border-cyan-400 transition-colors z-20"></div>
      <div class="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-slate-600/50 group-hover:border-slate-400 transition-colors z-20"></div>

      <!-- Header -->
      <div class="h-8 px-2 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between shrink-0 relative">
        <div class="flex items-center gap-2">
            <!-- Status LED -->
            <div class="w-1 h-1 bg-cyan-500 rounded-full shadow-[0_0_4px_rgba(6,182,212,0.8)]"></div>
            <h2 class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 select-none font-mono">
              {{ title() }}
            </h2>
        </div>
        <div class="flex gap-2">
            <ng-content select="[header-actions]"></ng-content>
        </div>
        <!-- Animated Header Line -->
        <div class="absolute bottom-0 left-0 h-px bg-gradient-to-r from-cyan-500/50 to-transparent w-1/3"></div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto custom-scrollbar relative p-2">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.5); }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 0; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
  `]
})
export class UiPanelComponent {
  title = input.required<string>();
}
