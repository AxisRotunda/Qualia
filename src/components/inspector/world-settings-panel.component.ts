
import { Component, input, output, signal, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { WeatherType } from '../../services/particle.service';
import { EnvironmentControlService } from '../../engine/features/environment-control.service';
import { EngineService } from '../../services/engine.service';

export interface LightSettings {
    ambient: number;
    directional: number;
    color: string;
}

type Tab = 'atmos' | 'light' | 'phys';

@Component({
  selector: 'app-world-settings-panel',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  template: `
     <div class="flex flex-col gap-6 select-none pb-4">
        
        <!-- Clean Tab Navigation -->
        <div class="flex items-center border-b border-white/10 px-1 relative">
            <button (click)="activeTab.set('atmos')" class="tab-btn flex-1" [class.active]="activeTab() === 'atmos'">
                <span class="material-symbols-outlined text-[16px]">public</span><span>World</span>
                @if (activeTab() === 'atmos') { <div class="active-line"></div> }
            </button>
            <button (click)="activeTab.set('light')" class="tab-btn flex-1" [class.active]="activeTab() === 'light'">
                <span class="material-symbols-outlined text-[16px]">wb_sunny</span><span>Cycle</span>
                @if (activeTab() === 'light') { <div class="active-line"></div> }
            </button>
            <button (click)="activeTab.set('phys')" class="tab-btn flex-1" [class.active]="activeTab() === 'phys'">
                <span class="material-symbols-outlined text-[16px]">science</span><span>Physics</span>
                @if (activeTab() === 'phys') { <div class="active-line"></div> }
            </button>
        </div>

        <!-- Content Area -->
        <div class="animate-in fade-in slide-in-from-bottom-2 duration-300 min-h-[200px]">
            
            <!-- 1. ATMOSPHERE & WEATHER -->
            @if (activeTab() === 'atmos') {
                <div class="space-y-6">
                    <div class="space-y-2">
                       <label class="section-title">Conditions</label>
                       <div class="grid grid-cols-4 gap-2">
                          @for (w of weatherOptions; track w.id) {
                             <button (click)="emitWeather(w.id)"
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
                           <button (click)="emitAtmosphere(opt.id)" 
                                   [class.border-cyan-500_50]="currentAtmosphere() === opt.id"
                                   [class.bg-slate-800_80]="currentAtmosphere() === opt.id"
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
            }

            <!-- 2. LIGHTING & TIME (CYCLE) -->
            @if (activeTab() === 'light') {
                <div class="space-y-6">
                    <!-- Cycle Control -->
                    <div class="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                        <div class="flex justify-between items-center mb-3">
                            <label class="section-title">Day/Night Cycle</label>
                            <button (click)="toggleCycle()" 
                                    class="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                                    [class.bg-cyan-600]="engine.state.dayNightActive()"
                                    [class.text-white]="engine.state.dayNightActive()"
                                    [class.bg-slate-700]="!engine.state.dayNightActive()"
                                    [class.text-slate-400]="!engine.state.dayNightActive()">
                                <span class="material-symbols-outlined text-lg">{{ engine.state.dayNightActive() ? 'pause' : 'play_arrow' }}</span>
                            </button>
                        </div>
                        
                        <!-- Cycle Speed -->
                        <div class="space-y-2 opacity-80" [class.opacity-40]="!engine.state.dayNightActive()">
                           <div class="flex justify-between text-[10px] uppercase font-bold text-slate-500">
                               <span>Static</span>
                               <span>Realtime</span>
                               <span>Hyper</span>
                           </div>
                           <input type="range" min="0" max="1.0" step="0.01" 
                                  [value]="engine.state.dayNightSpeed()" (input)="updateCycleSpeed($event)"
                                  class="modern-range accent-cyan-500">
                           <div class="text-center text-[10px] font-mono text-cyan-400">{{ engine.state.dayNightSpeed() * 60 | number:'1.0-0' }} min/sec</div>
                        </div>
                    </div>

                    <!-- Time Scrub -->
                    <div class="space-y-3">
                       <div class="flex justify-between items-end">
                         <label class="section-title">Current Time</label>
                         <span class="text-lg font-mono font-bold text-cyan-400">{{ formatTime(currentTime()) }}</span>
                       </div>
                       
                       <div class="relative h-12 bg-slate-900 rounded-xl border border-white/5 overflow-hidden group shadow-inner">
                           <div class="absolute inset-0 opacity-50 bg-gradient-to-r from-slate-900 via-sky-600 to-slate-900"></div>
                           <input type="range" min="0" max="24" step="0.1" 
                                  [value]="currentTime()" (input)="emitTime($event)"
                                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20">
                           <div class="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_white] pointer-events-none z-10 transition-all"
                                [style.left.%]="(currentTime() / 24) * 100"></div>
                           <div class="absolute inset-0 flex justify-between items-center px-3 pointer-events-none opacity-50">
                               <span class="text-[10px]">00:00</span>
                               <span class="text-[10px]">12:00</span>
                               <span class="text-[10px]">24:00</span>
                           </div>
                       </div>
                    </div>

                    <div class="h-px bg-white/5 my-2"></div>

                    <!-- Manual Overrides -->
                    <div class="space-y-4 opacity-50 hover:opacity-100 transition-opacity">
                        <label class="section-title text-[9px] block mb-2">Manual Overrides (Disables Auto)</label>
                        <div class="space-y-2">
                           <div class="flex justify-between">
                               <span class="text-xs font-medium text-slate-400">Sun Intensity</span>
                               <span class="text-xs font-mono text-slate-300">{{ lights().directional | number:'1.1-1' }}</span>
                           </div>
                           <input type="range" min="0" max="5" step="0.1" 
                                  [value]="lights().directional" (input)="emitLight('dir', $event)"
                                  class="modern-range">
                        </div>
                    </div>
                </div>
            }

            <!-- 3. PHYSICS -->
            @if (activeTab() === 'phys') {
                <div class="space-y-6">
                    <div class="p-4 rounded-xl bg-gradient-to-br from-rose-950/30 to-slate-900 border border-rose-500/20 space-y-4 shadow-lg">
                        <div class="flex justify-between items-center">
                            <label class="section-title text-rose-400">Gravity</label>
                            <span class="text-xs font-mono font-bold text-rose-300 bg-rose-950/50 px-2 py-1 rounded border border-rose-500/20">{{ gravity() | number:'1.2-2' }} G</span>
                        </div>
                        <input type="range" min="-20" max="0" step="0.1" 
                               [value]="gravity()" (input)="emitGravity($event)"
                               class="modern-range accent-rose-500">
                    </div>
                    <div class="p-4 rounded-xl bg-gradient-to-br from-emerald-950/30 to-slate-900 border border-emerald-500/20 space-y-4 shadow-lg">
                        <div class="flex justify-between items-center">
                            <label class="section-title text-emerald-400">Simulation Speed</label>
                            <span class="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/50 px-2 py-1 rounded border border-emerald-500/20">{{ timeScale() | number:'1.1-1' }}x</span>
                        </div>
                        <input type="range" min="0.1" max="2.0" step="0.1" 
                               [value]="timeScale()" (input)="emitTimeScale($event)"
                               class="modern-range accent-emerald-500">
                    </div>
                </div>
            }
        </div>
     </div>
  `,
  styles: [`
    .section-title { @apply text-xs font-bold text-slate-400 uppercase tracking-wider; }
    .tab-btn { @apply relative pb-3 pt-2 flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-wider; }
    .tab-btn.active { @apply text-cyan-400; }
    .active-line { @apply absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_10px_cyan]; animation: expand 0.2s ease-out; }
    @keyframes expand { from { transform: scaleX(0); } to { transform: scaleX(1); } }
    .weather-tile { @apply flex flex-col items-center justify-center py-3 rounded-xl bg-slate-800/40 border border-white/5 text-slate-400 hover:bg-slate-800 hover:text-white transition-all active:scale-95; }
    .active-weather { @apply bg-cyan-600 text-white border-cyan-400 shadow-lg shadow-cyan-900/20; }
    .border-cyan-500_50 { border-color: rgba(6,182,212,0.5); }
    .bg-slate-800_80 { background-color: rgba(30,41,59,0.8); }
    .modern-range { @apply w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer border border-white/5 relative; }
    .modern-range::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; background: white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.5); margin-top: -7px; transition: transform 0.1s; border: 2px solid #1e293b; }
    .modern-range::-webkit-slider-runnable-track { height: 6px; border-radius: 3px; }
    .modern-range::-webkit-slider-thumb:active { transform: scale(1.2); border-color: #06b6d4; }
  `]
})
export class WorldSettingsPanelComponent {
  engine = inject(EngineService);
  envControl = inject(EnvironmentControlService);

  gravity = input.required<number>();
  timeScale = input<number>(1.0);
  currentTime = input.required<number>();
  currentWeather = input.required<WeatherType>();
  currentAtmosphere = input.required<string>();
  
  activeTab = signal<Tab>('atmos');
  lights = signal<LightSettings>({ ambient: 0.4, directional: 0.8, color: '#ffffff' });

  gravityChange = output<number>();
  timeScaleChange = output<number>();
  lightChange = output<LightSettings>();
  weatherChange = output<WeatherType>();
  timeChange = output<number>();
  atmosphereChange = output<any>();

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

  formatTime(val: number): string {
      const h = Math.floor(val) % 24;
      const m = Math.floor((val % 1) * 60);
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  toggleCycle() {
      this.envControl.toggleDayNightCycle(!this.engine.state.dayNightActive());
  }

  updateCycleSpeed(e: Event) {
      const val = parseFloat((e.target as HTMLInputElement).value);
      this.envControl.setCycleSpeed(val);
  }

  emitGravity(e: Event) { this.gravityChange.emit(parseFloat((e.target as HTMLInputElement).value)); }
  emitTimeScale(e: Event) { this.timeScaleChange.emit(parseFloat((e.target as HTMLInputElement).value)); }
  emitTime(e: Event) { this.timeChange.emit(parseFloat((e.target as HTMLInputElement).value)); }
  emitWeather(w: WeatherType) { this.weatherChange.emit(w); }
  emitAtmosphere(id: string) { this.atmosphereChange.emit(id); }

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
