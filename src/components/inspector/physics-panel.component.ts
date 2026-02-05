
import { Component, input, output } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { PhysicsProps } from '../../engine/core';

@Component({
    selector: 'app-physics-panel',
    standalone: true,
    imports: [CommonModule, DecimalPipe],
    template: `
    <section>
       <h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">Physics Properties</h3>
       @if (data(); as p) {
          <div class="space-y-3">
              <div class="control-group">
                 <div class="flex justify-between text-[10px] mb-1">
                    <span class="text-slate-400">Restitution</span>
                    <span class="font-mono text-cyan-300">{{ p.restitution | number:'1.1-1' }}</span>
                 </div>
                 <input type="range" min="0" max="1.5" step="0.1" [value]="p.restitution" (input)="emitUpdate('restitution', $event)"
                        class="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500">
              </div>

              <div class="control-group">
                 <div class="flex justify-between text-[10px] mb-1">
                    <span class="text-slate-400">Friction</span>
                    <span class="font-mono text-cyan-300">{{ p.friction | number:'1.1-1' }}</span>
                 </div>
                 <input type="range" min="0" max="2.0" step="0.1" [value]="p.friction" (input)="emitUpdate('friction', $event)"
                        class="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500">
              </div>
          </div>
       }
    </section>
  `
})
export class PhysicsPanelComponent {
    data = input<PhysicsProps | null>(null);
    update = output<{prop: 'friction'|'restitution', value: number}>();

    emitUpdate(prop: 'friction'|'restitution', event: Event) {
        const value = parseFloat((event.target as HTMLInputElement).value);
        this.update.emit({ prop, value });
    }
}
