
import { Component, inject, signal, effect } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { EngineService } from '../services/engine.service';
import { Transform, PhysicsProps } from '../engine/core';
import { UiPanelComponent } from './ui-panel.component';

@Component({
  selector: 'app-inspector',
  standalone: true,
  imports: [DecimalPipe, UiPanelComponent],
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

              <!-- Transform (Read Only) -->
              <section>
                 <h3 class="control-label mb-2">Transform <span class="text-[9px] opacity-50 ml-1">(READ ONLY)</span></h3>
                 @if (transformSnapshot(); as t) {
                    <div class="grid grid-cols-1 gap-2">
                       <!-- Position -->
                       <div class="grid grid-cols-3 gap-1">
                          <div class="prop-readout"><span class="text-rose-500">X</span> {{ t.position.x | number:'1.2-2' }}</div>
                          <div class="prop-readout"><span class="text-emerald-500">Y</span> {{ t.position.y | number:'1.2-2' }}</div>
                          <div class="prop-readout"><span class="text-blue-500">Z</span> {{ t.position.z | number:'1.2-2' }}</div>
                       </div>
                       <!-- Rot/Scale Compact -->
                       <div class="grid grid-cols-2 gap-2">
                           <div class="bg-slate-950/50 p-1.5 rounded border border-slate-800/50 text-[10px] text-slate-400 flex justify-between">
                              <span>Scale</span> <span class="font-mono text-slate-200">{{ t.scale.x | number:'1.1-1' }}</span>
                           </div>
                           <div class="bg-slate-950/50 p-1.5 rounded border border-slate-800/50 text-[10px] text-slate-400 flex justify-between">
                              <span>Rot Y</span> <span class="font-mono text-slate-200">{{ t.rotation.y | number:'1.2-2' }}</span>
                           </div>
                       </div>
                    </div>
                 }
              </section>

              <hr class="border-slate-800/50">

              <!-- Physics (Editable) -->
              <section>
                 <h3 class="control-label mb-2">Physics Properties</h3>
                 @if (physicsPropsSnapshot(); as p) {
                    <div class="space-y-3">
                        <div class="control-group">
                           <div class="flex justify-between text-[10px] mb-1">
                              <span class="text-slate-400">Restitution</span>
                              <span class="font-mono text-cyan-300">{{ p.restitution | number:'1.1-1' }}</span>
                           </div>
                           <input type="range" min="0" max="1.5" step="0.1" [value]="p.restitution" (input)="updatePhysics('restitution', $event)" 
                                  class="range-slider">
                        </div>
                        
                        <div class="control-group">
                           <div class="flex justify-between text-[10px] mb-1">
                              <span class="text-slate-400">Friction</span>
                              <span class="font-mono text-cyan-300">{{ p.friction | number:'1.1-1' }}</span>
                           </div>
                           <input type="range" min="0" max="2.0" step="0.1" [value]="p.friction" (input)="updatePhysics('friction', $event)"
                                  class="range-slider">
                        </div>
                    </div>
                 }
              </section>
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
           <div class="space-y-4">
              
              <!-- Gravity -->
              <div>
                <div class="flex justify-between text-[10px] text-slate-400 mb-1">
                   <span>Gravity Y</span>
                   <span class="font-mono text-cyan-400">{{ engine.gravityY() | number:'1.1-1' }}</span>
                </div>
                <input type="range" min="-20" max="0" step="0.5" 
                       [value]="engine.gravityY()" (input)="updateGravity($event)"
                       class="range-slider">
              </div>

              <!-- Lighting -->
              <div class="space-y-2">
                 <div class="text-[10px] font-bold text-slate-500 uppercase">Atmosphere</div>
                 
                 <div class="grid grid-cols-2 gap-2">
                    <div class="space-y-1">
                       <label class="text-[9px] text-slate-500">Sun Intensity</label>
                       <input type="range" min="0" max="3" step="0.1" [value]="dirIntensity()" (input)="updateLight('dir', $event)"
                              class="range-slider-sm">
                    </div>
                    <div class="space-y-1">
                       <label class="text-[9px] text-slate-500">Ambient</label>
                       <input type="range" min="0" max="1" step="0.1" [value]="ambientIntensity()" (input)="updateLight('ambient', $event)"
                              class="range-slider-sm">
                    </div>
                 </div>
              </div>

           </div>
        </app-ui-panel>
      </div>

    </div>
  `,
  styles: [`
    .control-label { @apply text-[10px] font-bold text-slate-500 uppercase tracking-wide; }
    .prop-readout { @apply bg-slate-950 rounded border border-slate-800 py-1.5 px-2 text-[10px] font-mono text-slate-300 flex items-center gap-2; }
    .range-slider { @apply w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500; }
    .range-slider-sm { @apply w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 block; }
  `]
})
export class InspectorComponent {
  engine = inject(EngineService);
  
  transformSnapshot = signal<Transform | null>(null);
  physicsPropsSnapshot = signal<PhysicsProps | null>(null);
  entityName = signal('');
  
  ambientIntensity = signal(0.4);
  dirIntensity = signal(0.8);
  dirColor = signal('#ffffff');

  // Computed title
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

  updatePhysics(prop: 'friction' | 'restitution', e: Event) {
      const val = parseFloat((e.target as HTMLInputElement).value);
      const id = this.engine.selectedEntity();
      if(id===null) return;
      
      const props = this.engine.world.physicsProps.get(id);
      if(!props) return;
      
      const newProps = { ...props, [prop]: val };
      this.engine.updateEntityPhysics(id, newProps);

      this.physicsPropsSnapshot.update(curr => curr ? ({ ...curr, [prop]: val }) : null);
  }

  updateGravity(e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value);
    this.engine.setGravity(val);
  }
  
  updateLight(type: 'ambient' | 'dir' | 'color', e: Event) {
      const val = (e.target as HTMLInputElement).value;
      if (type === 'ambient') this.ambientIntensity.set(parseFloat(val));
      if (type === 'dir') this.dirIntensity.set(parseFloat(val));
      if (type === 'color') this.dirColor.set(val);
      
      this.engine.setLightSettings({
          ambient: this.ambientIntensity(),
          directional: this.dirIntensity(),
          color: this.dirColor()
      });
  }

  deleteSelected() {
      const e = this.engine.selectedEntity();
      if (e !== null) this.engine.deleteEntity(e);
  }
}
