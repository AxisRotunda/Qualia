
import { Component, input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Transform } from '../../engine/core';

@Component({
  selector: 'app-transform-panel',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  template: `
    <section>
       <h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">Transform <span class="text-[9px] opacity-50 ml-1">(READ ONLY)</span></h3>
       @if (data(); as t) {
          <div class="grid grid-cols-1 gap-2">
             <!-- Position -->
             <div class="grid grid-cols-3 gap-1">
                <div class="prop-readout"><span class="text-rose-500">X</span> {{ t.position.x | number:'1.2-2' }}</div>
                <div class="prop-readout"><span class="text-emerald-500">Y</span> {{ t.position.y | number:'1.2-2' }}</div>
                <div class="prop-readout"><span class="text-blue-500">Z</span> {{ t.position.z | number:'1.2-2' }}</div>
             </div>
             <!-- Rot/Scale Compact -->
             <div class="grid grid-cols-2 gap-2">
                 <div class="bg-slate-950/50 p-1.5 rounded border border-slate-800/50 text-[10px] text-slate-400 flex justify-between">
                    <span>Scale</span> <span class="font-mono text-slate-200">{{ t.scale.x | number:'1.1-1' }}</span>
                 </div>
                 <div class="bg-slate-950/50 p-1.5 rounded border border-slate-800/50 text-[10px] text-slate-400 flex justify-between">
                    <span>Rot Y</span> <span class="font-mono text-slate-200">{{ t.rotation.y | number:'1.2-2' }}</span>
                 </div>
             </div>
          </div>
       }
    </section>
  `,
  styles: [`
    .prop-readout { @apply bg-slate-950 rounded border border-slate-800 py-1.5 px-2 text-[10px] font-mono text-slate-300 flex items-center gap-2; }
  `]
})
export class TransformPanelComponent {
  data = input<Transform | null>(null);
}
