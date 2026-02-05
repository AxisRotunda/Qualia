
import { Component, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherType } from '../../services/particle.service';

import { EngineService } from '../../services/engine.service';
import { WorldAtmosTabComponent } from './tabs/world-atmos-tab.component';
import { WorldLightTabComponent } from './tabs/world-light-tab.component';
import { WorldFxTabComponent } from './tabs/world-fx-tab.component';
import { WorldPhysTabComponent } from './tabs/world-phys-tab.component';

type Tab = 'atmos' | 'light' | 'phys' | 'fx';

@Component({
    selector: 'app-world-settings-panel',
    standalone: true,
    imports: [
        CommonModule,
        WorldAtmosTabComponent,
        WorldLightTabComponent,
        WorldFxTabComponent,
        WorldPhysTabComponent
    ],
    template: `
     <div class="flex flex-col gap-6 select-none pb-4">

        <!-- Tab Navigation -->
        <div class="flex items-center border-b border-white/10 px-1 relative h-10">
            <button (click)="activeTab.set('atmos')" class="tab-btn flex-1" [class.active]="activeTab() === 'atmos'" title="Atmosphere">
                <span class="material-symbols-outlined text-[18px]">public</span>
                @if (activeTab() === 'atmos') { <div class="active-line"></div> }
            </button>
            <button (click)="activeTab.set('light')" class="tab-btn flex-1" [class.active]="activeTab() === 'light'" title="Lighting">
                <span class="material-symbols-outlined text-[18px]">wb_sunny</span>
                @if (activeTab() === 'light') { <div class="active-line"></div> }
            </button>
            <button (click)="activeTab.set('fx')" class="tab-btn flex-1" [class.active]="activeTab() === 'fx'" title="Cinematics">
                <span class="material-symbols-outlined text-[18px]">auto_fix_high</span>
                @if (activeTab() === 'fx') { <div class="active-line"></div> }
            </button>
            <button (click)="activeTab.set('phys')" class="tab-btn flex-1" [class.active]="activeTab() === 'phys'" title="Physics">
                <span class="material-symbols-outlined text-[18px]">science</span>
                @if (activeTab() === 'phys') { <div class="active-line"></div> }
            </button>
        </div>

        <!-- Tab Content -->
        <div class="min-h-[300px]">
            @switch (activeTab()) {
                @case ('atmos') {
                    <app-world-atmos-tab
                        [currentWeather]="currentWeather()"
                        [currentAtmosphere]="currentAtmosphere()"
                        (weatherChange)="weatherChange.emit($event)"
                        (atmosphereChange)="atmosphereChange.emit($event)"
                    />
                }
                @case ('light') {
                    <app-world-light-tab
                        [currentTime]="currentTime()"
                        (timeChange)="timeChange.emit($event)"
                    />
                }
                @case ('fx') {
                    <app-world-fx-tab />
                }
                @case ('phys') {
                    <app-world-phys-tab
                        [gravity]="gravity()"
                        [timeScale]="timeScale()"
                        (gravityChange)="gravityChange.emit($event)"
                        (timeScaleChange)="timeScaleChange.emit($event)"
                    />
                }
            }
        </div>
     </div>
  `,
    styles: [`
    .tab-btn { @apply relative h-full flex flex-col items-center justify-center text-slate-500 hover:text-slate-300 transition-colors; }
    .tab-btn.active { @apply text-cyan-400; }
    .active-line { @apply absolute bottom-0 left-2 right-2 h-0.5 bg-cyan-400 shadow-[0_0_8px_cyan]; }
  `]
})
export class WorldSettingsPanelComponent {
    engine = inject(EngineService);

    gravity = input.required<number>();
    timeScale = input<number>(1.0);
    currentTime = input.required<number>();
    currentWeather = input.required<WeatherType>();
    currentAtmosphere = input.required<string>();

    activeTab = signal<Tab>('atmos');

    gravityChange = output<number>();
    timeScaleChange = output<number>();
    weatherChange = output<WeatherType>();
    timeChange = output<number>();
    atmosphereChange = output<any>();
}
