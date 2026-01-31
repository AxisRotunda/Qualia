
import { Component, inject, computed } from '@angular/core';
import { EngineService } from '../services/engine.service';
import { UiPanelComponent } from './ui-panel.component';
import { EntityInspectorComponent } from './inspector/entity-inspector.component';
import { WorldSettingsPanelComponent } from './inspector/world-settings-panel.component';

@Component({
  selector: 'app-inspector',
  standalone: true,
  imports: [
      UiPanelComponent, 
      EntityInspectorComponent, 
      WorldSettingsPanelComponent
  ],
  template: `
    <!-- 
      Layout Change: 
      Instead of flex-1 (which tries to fit content into exactly 100% height),
      we use a simple scrollable container. This allows the panels to expand naturally.
      On mobile, this ensures the bottom of the world settings is reachable.
    -->
    <div class="h-full flex flex-col gap-3 p-1 overflow-y-auto custom-scrollbar">
      
      <!-- Panel 1: Selection Inspector (Only shows when selected) -->
      @if (engine.selectedEntity() !== null) {
        <div class="shrink-0 animate-in slide-in-from-left-2 duration-300">
          <app-ui-panel [title]="selectionTitle()">
             <app-entity-inspector />
          </app-ui-panel>
        </div>
      }

      <!-- Panel 2: World Settings -->
      <!-- shrink-0 ensures it doesn't get crushed if selection is huge -->
      <div class="shrink-0">
        <app-ui-panel title="Environment">
           <app-world-settings-panel 
              [gravity]="engine.gravityY()"
              [timeScale]="engine.timeScale()"
              [currentTime]="engine.timeOfDay()"
              [currentWeather]="engine.weather()"
              [currentAtmosphere]="engine.atmosphere()"
              (gravityChange)="engine.sim.setGravity($event)"
              (timeScaleChange)="engine.sim.setTimeScale($event)"
              (timeChange)="engine.env.setTimeOfDay($event)"
              (weatherChange)="engine.env.setWeather($event)"
              (atmosphereChange)="engine.env.setAtmosphere($event)"
              (lightChange)="engine.env.setLightSettings($event)"
           />
        </app-ui-panel>
      </div>

      <!-- Spacer for mobile bottom safe area -->
      <div class="h-8 shrink-0"></div>

    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
  `]
})
export class InspectorComponent {
  engine = inject(EngineService);
  
  selectionTitle = computed(() => {
      const id = this.engine.selectedEntity();
      if (id === null) return 'Target Analysis';
      return 'Entity Properties';
  });
}
