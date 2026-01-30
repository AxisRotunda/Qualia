
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
    <div class="h-full flex flex-col gap-2 p-0 bg-transparent">
      
      <!-- Panel 1: Selection Inspector -->
      <div class="flex-1 min-h-0">
        <app-ui-panel [title]="selectionTitle()">
          
          @if (engine.selectedEntity() !== null) {
            <app-entity-inspector />
          } @else {
             <div class="h-full flex flex-col items-center justify-center text-slate-600 space-y-3 opacity-60">
                <div class="w-16 h-16 rounded-full border border-slate-700 flex items-center justify-center bg-slate-900/50">
                    <span class="material-symbols-outlined text-3xl text-slate-500">data_object</span>
                </div>
                <div class="text-center">
                    <div class="text-[10px] font-mono uppercase tracking-widest text-slate-500">No Target</div>
                    <div class="text-[9px] text-slate-600 mt-1">Select an entity to analyze</div>
                </div>
             </div>
          }
        </app-ui-panel>
      </div>

      <!-- Panel 2: World Settings -->
      <div class="shrink-0 h-auto">
        <app-ui-panel title="Environment Systems">
           <app-world-settings-panel 
              [gravity]="engine.gravityY()"
              [currentTime]="engine.timeOfDay()"
              [currentWeather]="engine.weather()"
              [currentAtmosphere]="engine.atmosphere()"
              (gravityChange)="engine.setGravity($event)"
              (timeChange)="engine.setTimeOfDay($event)"
              (weatherChange)="engine.setWeather($event)"
              (atmosphereChange)="engine.setAtmosphere($event)"
              (lightChange)="engine.setLightSettings($event)"
           />
        </app-ui-panel>
      </div>

    </div>
  `
})
export class InspectorComponent {
  engine = inject(EngineService);
  
  selectionTitle = computed(() => {
      const id = this.engine.selectedEntity();
      if (id === null) return 'Target Analysis';
      return 'Entity Properties';
  });
}
