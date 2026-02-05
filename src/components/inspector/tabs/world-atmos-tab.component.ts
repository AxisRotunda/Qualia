
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherType } from '../../../services/particle.service';

@Component({
    selector: 'app-world-atmos-tab',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div class="space-y-2">
            <label class="section-title">Conditions</label>
            <div class="grid grid-cols-4 gap-2">
                @for (w of weatherOptions; track w.id) {
                    <button (click)="weatherChange.emit(w.id)"
                            [class.active-weather]="currentWeather() === w.id"
                            class="weather-tile group">
                        <span class="material-symbols-outlined text-2xl mb-1 group-hover:scale-110 transition-transform">{{ w.icon }}</span>
                        <span class="text-[9px] font-medium uppercase tracking-wide opacity-70">{{ w.label }}</span>
                    </button>
                }
            </div>
        </div>
        <div class="space-y-2">
            <label class="section-title">Biome Preset</label>
            <div class="grid grid-cols-1 gap-2">
                @for (opt of atmosphereOptions; track opt.id) {
                    <button (click)="atmosphereChange.emit(opt.id)"
                            [class.active-biome]="currentAtmosphere() === opt.id"
                            class="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all text-left group">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 shrink-0" [ngClass]="opt.colorClass">
                            <span class="material-symbols-outlined text-white text-lg">{{ opt.icon }}</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="text-sm font-bold text-slate-200 group-hover:text-white truncate">{{ opt.label }}</div>
                            <div class="text-[10px] text-slate-500 truncate">{{ opt.desc }}</div>
                        </div>
                        @if (currentAtmosphere() === opt.id) {
                            <span class="material-symbols-outlined text-cyan-400 animate-in fade-in zoom-in">check_circle</span>
                        }
                    </button>
                }
            </div>
        </div>
    </div>
  `,
    styles: [`
    .section-title { @apply text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]; }
    .weather-tile { @apply flex flex-col items-center justify-center py-3 rounded-xl bg-slate-800/40 border border-white/5 text-slate-400 hover:bg-slate-800 hover:text-white transition-all active:scale-95; }
    .active-weather { @apply bg-cyan-600 text-white border-cyan-400 shadow-lg shadow-cyan-900/20; }
    .active-biome { @apply border-cyan-500/50 bg-slate-800/80; }
  `]
})
export class WorldAtmosTabComponent {
    currentWeather = input.required<WeatherType>();
    currentAtmosphere = input.required<string>();

    weatherChange = output<WeatherType>();
    atmosphereChange = output<string>();

    atmosphereOptions = [
        { id: 'clear', label: 'Clear Sky', desc: 'Standard visibility', icon: 'sunny', colorClass: 'bg-gradient-to-br from-blue-400 to-sky-300' },
        { id: 'city', label: 'Urban Haze', desc: 'Smog and particulate', icon: 'location_city', colorClass: 'bg-gradient-to-br from-slate-400 to-gray-500' },
        { id: 'forest', label: 'Deep Forest', desc: 'Rich organic greens', icon: 'forest', colorClass: 'bg-gradient-to-br from-green-600 to-emerald-400' },
        { id: 'fog', label: 'Dense Fog', desc: 'Low visibility mist', icon: 'foggy', colorClass: 'bg-gradient-to-br from-gray-300 to-slate-400' },
        { id: 'blizzard', label: 'Blizzard', desc: 'Whiteout snow storm', icon: 'ac_unit', colorClass: 'bg-gradient-to-br from-slate-200 to-white' },
        { id: 'night', label: 'Midnight', desc: 'Darkness & stars', icon: 'nights_stay', colorClass: 'bg-gradient-to-br from-indigo-900 to-slate-900' },
        { id: 'space', label: 'Deep Space', desc: 'Void vacuum', icon: 'rocket_launch', colorClass: 'bg-gradient-to-br from-black to-slate-800' },
        { id: 'ice', label: 'Glacial', desc: 'Reflective cold blue', icon: 'filter_hdr', colorClass: 'bg-gradient-to-br from-cyan-300 to-blue-500' },
        { id: 'desert', label: 'Desert', desc: 'Heat haze & dust', icon: 'landscape', colorClass: 'bg-gradient-to-br from-orange-400 to-amber-200' }
    ];

    weatherOptions: {id: WeatherType, label: string, icon: string}[] = [
        { id: 'clear', label: 'None', icon: 'block' },
        { id: 'rain', label: 'Rain', icon: 'rainy' },
        { id: 'snow', label: 'Snow', icon: 'cloudy_snowing' },
        { id: 'ash', label: 'Ash', icon: 'blur_on' }
    ];
}
