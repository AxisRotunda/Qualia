
import { Component, input, output } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-world-phys-tab',
    standalone: true,
    imports: [CommonModule, DecimalPipe],
    template: `
    <div class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div class="p-4 rounded-xl bg-gradient-to-br from-rose-950/30 to-slate-900 border border-rose-500/20 space-y-4 shadow-lg">
            <div class="flex justify-between items-center">
                <label class="section-title text-rose-400">Gravitational Constant</label>
                <span class="text-xs font-mono font-bold text-rose-300 bg-rose-950/50 px-2 py-1 rounded border border-rose-500/20 tabular-nums">{{ gravity() | number:'1.2-2' }} G</span>
            </div>
            <input type="range" min="-20" max="0" step="0.1"
                   [value]="gravity()" (input)="emitGravity($event)"
                   class="modern-range accent-rose-500">
        </div>
        <div class="p-4 rounded-xl bg-gradient-to-br from-emerald-950/30 to-slate-900 border border-emerald-500/20 space-y-4 shadow-lg">
            <div class="flex justify-between items-center">
                <label class="section-title text-emerald-400">Temporal Scale</label>
                <span class="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/50 px-2 py-1 rounded border border-emerald-500/20 tabular-nums">{{ timeScale() | number:'1.1-1' }}x</span>
            </div>
            <input type="range" min="0.1" max="2.0" step="0.1"
                   [value]="timeScale()" (input)="emitTimeScale($event)"
                   class="modern-range accent-emerald-500">
        </div>
    </div>
  `,
    styles: [`
    .section-title { @apply text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]; }
    .modern-range { @apply w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer border border-white/5 relative; }
    .modern-range::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; background: white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.5); margin-top: -6px; border: 2px solid #1e293b; }
  `]
})
export class WorldPhysTabComponent {
    gravity = input.required<number>();
    timeScale = input<number>(1.0);

    gravityChange = output<number>();
    timeScaleChange = output<number>();

    emitGravity(e: Event) {
        const val = parseFloat((e.target as HTMLInputElement).value);
        this.gravityChange.emit(val);
    }

    emitTimeScale(e: Event) {
        const val = parseFloat((e.target as HTMLInputElement).value);
        this.timeScaleChange.emit(val);
    }
}
