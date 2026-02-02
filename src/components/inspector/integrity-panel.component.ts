
import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Integrity } from '../../engine/ecs/integrity-store';

@Component({
  selector: 'app-integrity-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section>
       <h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2 flex justify-between">
          <span>Integrity</span>
          @if (data(); as d) {
             <span class="text-rose-400">{{ getPercentage(d) }}%</span>
          }
       </h3>
       
       @if (data(); as d) {
          <div class="space-y-3">
              <!-- Health Bar Visual -->
              <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div class="h-full bg-rose-500 transition-all duration-300"
                       [style.width.%]="getPercentage(d)"></div>
              </div>

              <!-- Controls -->
              <div class="grid grid-cols-2 gap-2">
                  <div class="input-wrapper">
                      <label>Health</label>
                      <input type="number" [value]="d.health" (change)="emitChange('health', $event)" class="param-input">
                  </div>
                  <div class="input-wrapper">
                      <label>Max</label>
                      <input type="number" [value]="d.maxHealth" (change)="emitChange('maxHealth', $event)" class="param-input">
                  </div>
              </div>

              <div class="input-wrapper">
                  <label title="Minimum impulse required to damage">Impact Thresh.</label>
                  <input type="number" [value]="d.threshold" (change)="emitChange('threshold', $event)" class="param-input">
              </div>
          </div>
       }
    </section>
  `,
  styles: [`
    .input-wrapper { @apply flex flex-col gap-1; }
    .input-wrapper label { @apply text-[9px] text-slate-500 uppercase font-bold; }
    .param-input { 
      @apply w-full bg-slate-900 border border-slate-800 rounded py-1 px-2 text-[10px] font-mono text-slate-300 focus:outline-none focus:border-cyan-500/50 focus:text-white transition-colors;
    }
  `]
})
export class IntegrityPanelComponent {
  data = input<Integrity | null>(null);
  update = output<{prop: keyof Integrity, value: number}>();

  getPercentage(d: Integrity): number {
      if (d.maxHealth <= 0) return 0;
      return Math.round((d.health / d.maxHealth) * 100);
  }

  emitChange(prop: keyof Integrity, event: Event) {
      const val = parseFloat((event.target as HTMLInputElement).value);
      if (!isNaN(val)) {
          this.update.emit({ prop, value: val });
      }
  }
}
