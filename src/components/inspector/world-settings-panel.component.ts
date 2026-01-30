
import { Component, input, output, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { WeatherType } from '../../services/particle.service';

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
     <div class="space-y-6 select-none">
        
        <!-- Environment Presets -->
        <div class="space-y-2">
           <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Atmosphere</div>
           <div class="grid grid-cols-2 gap-1.5">
             @for (opt of atmosphereOptions; track opt.id) {
               <button (click)="emitAtmosphere(opt.id)" 
                       [class.bg-cyan-900_40]="currentAtmosphere() === opt.id"
                       [class.border-cyan-500_50]="currentAtmosphere() === opt.id"
                       [class.text-cyan-300]="currentAtmosphere() === opt.id"
                       [class.bg-slate-950]="currentAtmosphere() !== opt.id"
                       [class.text-slate-400]="currentAtmosphere() !== opt.id"
                       class="text-[10px] font-medium py-1.5 px-2 rounded border border-slate-800 hover:bg-slate-800 transition-colors text-left flex items-center gap-2">
                  <span class="material-symbols-outlined text-[14px] opacity-70">{{ opt.icon }}</span>
                  {{ opt.label }}
               </button>
             }
           </div>
        </div>

        <!-- Weather Control -->
        <div class="space-y-2">
           <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Weather</div>
           <div class="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              @for (w of weatherOptions; track w.id) {
                 <button (click)="emitWeather(w.id)"
                         [class.bg-cyan-600]="currentWeather() === w.id"
                         [class.text-white]="currentWeather() === w.id"
                         [class.text-slate-500]="currentWeather() !== w.id"
                         [class.hover:text-slate-300]="currentWeather() !== w.id"
                         [title]="w.label"
                         class="flex-1 py-1 rounded flex items-center justify-center transition-colors">
                    <span class="material-symbols-outlined text-lg">{{ w.icon }}</span>
                 </button>
              }
           </div>
        </div>

        <!-- Time & Light -->
        <div class="space-y-2">
           <div class="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wide">
             <span>Time of Day</span>
             <span class="font-mono text-cyan-400">{{ formatTime(currentTime()) }}</span>
           </div>
           
           <input type="range" min="0" max="24" step="0.1" 
                  [value]="currentTime()" (input)="emitTime($event)"
                  class="w-full h-1.5 bg-gradient-to-r from-indigo-900 via-sky-400 to-indigo-900 rounded-lg appearance-none cursor-pointer">
           
           <div class="grid grid-cols-2 gap-3 pt-2">
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

        <!-- Physics -->
        <div class="space-y-2 border-t border-slate-800 pt-4">
           <div class="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
             <span>Physics Gravity</span>
             <span class="font-mono text-cyan-400">{{ gravity() | number:'1.1-1' }}</span>
           </div>
           <input type="range" min="-20" max="0" step="0.5" 
                  [value]="gravity()" (input)="emitGravity($event)"
                  class="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500">
        </div>

     </div>
  `,
  styles: [`
    .bg-cyan-900_40 { background-color: rgb(22 78 99 / 0.4); }
    .border-cyan-500_50 { border-color: rgb(6 182 212 / 0.5); }
  `]
})
export class WorldSettingsPanelComponent {
  gravity = input.required<number>();
  currentTime = input.required<number>();
  currentWeather = input.required<WeatherType>();
  currentAtmosphere = input.required<string>();
  
  // Signals for state
  lights = signal<LightSettings>({ ambient: 0.4, directional: 0.8, color: '#ffffff' });

  // Outputs
  gravityChange = output<number>();
  lightChange = output<LightSettings>();
  weatherChange = output<WeatherType>();
  timeChange = output<number>();
  atmosphereChange = output<any>();

  atmosphereOptions = [
      { id: 'clear', label: 'Clear Sky', icon: 'sunny' },
      { id: 'city', label: 'Urban Haze', icon: 'location_city' },
      { id: 'forest', label: 'Deep Forest', icon: 'forest' },
      { id: 'fog', label: 'Dense Fog', icon: 'foggy' },
      { id: 'blizzard', label: 'Blizzard', icon: 'ac_unit' },
      { id: 'night', label: 'Midnight', icon: 'nights_stay' },
      { id: 'space', label: 'Deep Space', icon: 'rocket_launch' },
      { id: 'ice', label: 'Glacial', icon: 'filter_hdr' }
  ];

  weatherOptions: {id: WeatherType, label: string, icon: string}[] = [
      { id: 'clear', label: 'None', icon: 'block' },
      { id: 'rain', label: 'Rain', icon: 'rainy' },
      { id: 'snow', label: 'Snow', icon: 'cloudy_snowing' },
      { id: 'ash', label: 'Ash Fall', icon: 'blur_on' }
  ];

  formatTime(val: number): string {
      const h = Math.floor(val) % 24;
      const m = Math.floor((val % 1) * 60);
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  emitGravity(e: Event) {
      this.gravityChange.emit(parseFloat((e.target as HTMLInputElement).value));
  }

  emitTime(e: Event) {
      this.timeChange.emit(parseFloat((e.target as HTMLInputElement).value));
  }

  emitWeather(w: WeatherType) {
      this.weatherChange.emit(w);
  }

  emitAtmosphere(id: string) {
      this.atmosphereChange.emit(id);
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
