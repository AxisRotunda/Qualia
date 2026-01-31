
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
           <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
             <span class="material-symbols-outlined text-[12px]">public</span> Atmosphere
           </div>
           <div class="grid grid-cols-2 gap-1.5">
             @for (opt of atmosphereOptions; track opt.id) {
               <button (click)="emitAtmosphere(opt.id)" 
                       [class.bg-cyan-950_50]="currentAtmosphere() === opt.id"
                       [class.border-cyan-500_50]="currentAtmosphere() === opt.id"
                       [class.text-cyan-300]="currentAtmosphere() === opt.id"
                       [class.shadow-glow]="currentAtmosphere() === opt.id"
                       [class.bg-slate-900]="currentAtmosphere() !== opt.id"
                       [class.text-slate-400]="currentAtmosphere() !== opt.id"
                       class="text-[10px] font-medium py-1.5 px-2 rounded border border-slate-800 hover:bg-slate-800 transition-all text-left flex items-center gap-2 group">
                  <span class="material-symbols-outlined text-[14px] opacity-70 group-hover:text-white transition-colors">{{ opt.icon }}</span>
                  {{ opt.label }}
               </button>
             }
           </div>
        </div>

        <!-- Weather Control -->
        <div class="space-y-2">
           <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
             <span class="material-symbols-outlined text-[12px]">cloud</span> Weather
           </div>
           <div class="flex gap-1 bg-slate-950 p-1 rounded border border-slate-800">
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
        <div class="space-y-3">
           <div class="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wide">
             <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[12px]">schedule</span> Time Cycle</span>
             <span class="font-mono text-cyan-400 bg-cyan-950/30 px-1.5 rounded border border-cyan-900/50">{{ formatTime(currentTime()) }}</span>
           </div>
           
           <input type="range" min="0" max="24" step="0.1" 
                  [value]="currentTime()" (input)="emitTime($event)"
                  class="custom-range w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer border border-slate-700">
           
           <div class="grid grid-cols-2 gap-3 pt-2">
              <div class="space-y-1">
                 <label class="text-[9px] text-slate-500 font-mono">SUN INTENSITY</label>
                 <input type="range" min="0" max="3" step="0.1" [value]="lights().directional" (input)="emitLight('dir', $event)"
                        class="custom-range-mini w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer">
              </div>
              <div class="space-y-1">
                 <label class="text-[9px] text-slate-500 font-mono">AMBIENT LUX</label>
                 <input type="range" min="0" max="1" step="0.1" [value]="lights().ambient" (input)="emitLight('ambient', $event)"
                        class="custom-range-mini w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer">
              </div>
           </div>
        </div>

        <!-- Physics -->
        <div class="space-y-2 border-t border-slate-800 pt-4">
           <div class="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
             <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[12px]">public_off</span> Gravity (G)</span>
             <span class="font-mono text-cyan-400 bg-cyan-950/30 px-1.5 rounded border border-cyan-900/50">{{ gravity() | number:'1.1-1' }}</span>
           </div>
           <input type="range" min="-20" max="0" step="0.5" 
                  [value]="gravity()" (input)="emitGravity($event)"
                  class="custom-range w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer border border-slate-700">
        </div>

     </div>
  `,
  styles: [`
    .bg-cyan-950_50 { background-color: rgba(8, 51, 68, 0.5); }
    .border-cyan-500_50 { border-color: rgba(6, 182, 212, 0.5); }
    .shadow-glow { box-shadow: inset 0 0 10px rgba(6, 182, 212, 0.1); }
    
    /* Custom Range Slider Styling */
    .custom-range::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 12px;
        height: 12px;
        background: #06b6d4;
        border: 2px solid #083344;
        border-radius: 50%;
        cursor: pointer;
        transition: transform 0.1s;
    }
    .custom-range::-webkit-slider-thumb:hover { transform: scale(1.2); }
    
    .custom-range-mini::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 8px;
        height: 8px;
        background: #64748b;
        border-radius: 50%;
        cursor: pointer;
    }
    .custom-range-mini::-webkit-slider-thumb:hover { background: #94a3b8; }
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
