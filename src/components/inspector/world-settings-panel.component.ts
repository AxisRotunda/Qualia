
import { Component, input, output, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

export interface LightSettings {
    ambient: number;
    directional: number;
    color: string;
}

@Component({
  selector: 'app-world-settings-panel',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  template: `
     <div class="space-y-4">
        
        <!-- Gravity -->
        <div>
          <div class="flex justify-between text-[10px] text-slate-400 mb-1">
             <span>Gravity Y</span>
             <span class="font-mono text-cyan-400">{{ gravity() | number:'1.1-1' }}</span>
          </div>
          <input type="range" min="-20" max="0" step="0.5" 
                 [value]="gravity()" (input)="emitGravity($event)"
                 class="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500">
        </div>

        <!-- Lighting -->
        <div class="space-y-2">
           <div class="text-[10px] font-bold text-slate-500 uppercase">Atmosphere</div>
           
           <div class="grid grid-cols-2 gap-2">
              <div class="space-y-1">
                 <label class="text-[9px] text-slate-500">Sun Intensity</label>
                 <input type="range" min="0" max="3" step="0.1" [value]="lights().directional" (input)="emitLight('dir', $event)"
                        class="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 block">
              </div>
              <div class="space-y-1">
                 <label class="text-[9px] text-slate-500">Ambient</label>
                 <input type="range" min="0" max="1" step="0.1" [value]="lights().ambient" (input)="emitLight('ambient', $event)"
                        class="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 block">
              </div>
           </div>
        </div>

     </div>
  `
})
export class WorldSettingsPanelComponent {
  gravity = input.required<number>();
  
  // Internal state for lights to keep slider smooth, updated via parent if needed
  lights = signal<LightSettings>({ ambient: 0.4, directional: 0.8, color: '#ffffff' });

  gravityChange = output<number>();
  lightChange = output<LightSettings>();

  emitGravity(e: Event) {
      this.gravityChange.emit(parseFloat((e.target as HTMLInputElement).value));
  }

  emitLight(type: 'ambient' | 'dir', e: Event) {
      const val = parseFloat((e.target as HTMLInputElement).value);
      this.lights.update(curr => {
          const next = { ...curr };
          if (type === 'ambient') next.ambient = val;
          if (type === 'dir') next.directional = val;
          return next;
      });
      this.lightChange.emit(this.lights());
  }
}
