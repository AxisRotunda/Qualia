
import { Component, inject, signal, effect } from '@angular/core';
import { EngineService } from '../services/engine.service';
import { Transform, PhysicsProps } from '../engine/core';
import { UiPanelComponent } from './ui-panel.component';
import { TransformPanelComponent } from './inspector/transform-panel.component';
import { PhysicsPanelComponent } from './inspector/physics-panel.component';
import { WorldSettingsPanelComponent } from './inspector/world-settings-panel.component';

@Component({
  selector: 'app-inspector',
  standalone: true,
  imports: [
      UiPanelComponent, 
      TransformPanelComponent, 
      PhysicsPanelComponent, 
      WorldSettingsPanelComponent
  ],
  template: `
    <div class="h-full flex flex-col gap-2 p-2 bg-slate-950/50">
      
      <!-- Panel 1: Selection Inspector -->
      <div class="flex-1 min-h-0">
        <app-ui-panel [title]="selectionTitle()">
          
          @if (engine.selectedEntity() !== null) {
            
            <div class="space-y-4">
              <!-- Identity -->
              <div class="flex gap-2">
                 <div class="relative flex-1">
                    <span class="absolute left-2 top-1.5 material-symbols-outlined text-cyan-500 text-sm">data_object</span>
                    <input type="text" 
                           [value]="entityName()" 
                           (change)="updateName($event)"
                           class="w-full bg-slate-950 border border-slate-800 rounded py-1 pl-7 pr-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors">
                 </div>
                 <button class="px-2 bg-rose-950/30 border border-rose-900/50 hover:bg-rose-900/50 text-rose-400 rounded transition-colors" 
                         title="Delete Entity"
                         (click)="deleteSelected()">
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                 </button>
              </div>

              <!-- Transform Sub-Component -->
              <app-transform-panel [data]="transformSnapshot()" />

              <hr class="border-slate-800/50">

              <!-- Physics Sub-Component -->
              <app-physics-panel 
                [data]="physicsPropsSnapshot()"
                (update)="updatePhysics($event)"
              />
            </div>

          } @else {
             <div class="h-full flex flex-col items-center justify-center text-slate-600 space-y-2 opacity-60">
                <span class="material-symbols-outlined text-4xl">ads_click</span>
                <span class="text-xs text-center px-4">Select an entity to inspect properties</span>
             </div>
          }
        </app-ui-panel>
      </div>

      <!-- Panel 2: World Settings -->
      <div class="shrink-0 h-auto">
        <app-ui-panel title="World Settings">
           <app-world-settings-panel 
              [gravity]="engine.gravityY()"
              (gravityChange)="engine.setGravity($event)"
              (lightChange)="engine.setLightSettings($event)"
           />
        </app-ui-panel>
      </div>

    </div>
  `
})
export class InspectorComponent {
  engine = inject(EngineService);
  
  transformSnapshot = signal<Transform | null>(null);
  physicsPropsSnapshot = signal<PhysicsProps | null>(null);
  entityName = signal('');
  selectionTitle = signal('No Selection');

  constructor() {
    effect(() => {
       const id = this.engine.selectedEntity();
       if (id === null) {
         this.selectionTitle.set('No Selection');
         this.transformSnapshot.set(null);
         this.physicsPropsSnapshot.set(null);
         this.entityName.set('');
         return;
       }
       
       this.refreshSnapshot(id);
       this.selectionTitle.set(this.engine.getEntityName(id) || `Entity ${id}`);
    });
  }
  
  refreshSnapshot(id: number) {
       const t = this.engine.world.transforms.get(id);
       const p = this.engine.world.physicsProps.get(id);

       if (t) {
         this.transformSnapshot.set({
             position: { ...t.position },
             rotation: { ...t.rotation },
             scale: { ...t.scale }
         });
       }
       if (p) {
         this.physicsPropsSnapshot.set({ ...p });
       }
       this.entityName.set(this.engine.getEntityName(id));
  }

  updateName(e: Event) {
      const val = (e.target as HTMLInputElement).value;
      const id = this.engine.selectedEntity();
      if (id !== null) {
          this.engine.setEntityName(id, val);
          this.selectionTitle.set(val);
      }
  }

  updatePhysics(event: {prop: 'friction' | 'restitution', value: number}) {
      const id = this.engine.selectedEntity();
      if(id===null) return;
      
      const props = this.engine.world.physicsProps.get(id);
      if(!props) return;
      
      const newProps = { ...props, [event.prop]: event.value };
      this.engine.updateEntityPhysics(id, newProps);

      this.physicsPropsSnapshot.update(curr => curr ? ({ ...curr, [event.prop]: event.value }) : null);
  }

  deleteSelected() {
      const e = this.engine.selectedEntity();
      if (e !== null) this.engine.deleteEntity(e);
  }
}
