
import { Component, inject, computed, signal, effect } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { EngineService } from '../services/engine.service';
import { Transform, PhysicsProps } from '../engine/core';

@Component({
  selector: 'app-inspector',
  standalone: true,
  template: `
    <div class="h-full flex flex-col text-slate-300">
      <div class="h-9 flex items-center justify-between px-3 border-b border-slate-800 bg-slate-950/50">
        <span class="text-[11px] tracking-wide text-slate-500 font-bold uppercase">Properties</span>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar">
      
      @if (engine.selectedEntity() !== null) {
          
          <!-- Header / Identity -->
          <div class="px-4 py-3 border-b border-slate-800 bg-slate-900/30">
             <div class="flex justify-between items-start mb-2">
                 <div class="text-[10px] text-slate-500 font-bold uppercase">SELECTED ENTITY</div>
                 <button class="p-1.5 hover:bg-rose-950/30 hover:text-rose-400 rounded transition-colors text-slate-500" 
                         title="Delete Entity"
                         (click)="deleteSelected()">
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                 </button>
             </div>
             
             <!-- Name Input -->
             <div class="flex items-center bg-slate-950 rounded border border-slate-800 focus-within:border-cyan-500/50 transition-colors">
                <span class="material-symbols-outlined text-cyan-500 text-sm pl-2">data_object</span>
                <input type="text" 
                       [value]="entityName()" 
                       (change)="updateName($event)"
                       class="w-full bg-transparent border-none py-1.5 px-2 text-sm font-mono text-slate-200 focus:outline-none">
             </div>
          </div>

          <!-- Transform Section (READ ONLY) -->
          <section class="p-4 border-b border-slate-800/50">
            <h3 class="section-title flex justify-between">
                <span>Transform</span>
                <span class="text-[9px] text-slate-600 bg-slate-900 px-1 rounded border border-slate-800">READ ONLY</span>
            </h3>
            
            @if (transformSnapshot(); as t) {
              <!-- Position -->
              <div class="control-row">
                <label class="control-label">Position</label>
                <div class="grid grid-cols-3 gap-1">
                  <div class="input-group disabled">
                    <span class="axis-tag text-rose-500">X</span>
                    <input type="number" [value]="t.position.x | number:'1.2-2'" disabled readonly>
                  </div>
                  <div class="input-group disabled">
                    <span class="axis-tag text-emerald-500">Y</span>
                    <input type="number" [value]="t.position.y | number:'1.2-2'" disabled readonly>
                  </div>
                  <div class="input-group disabled">
                    <span class="axis-tag text-blue-500">Z</span>
                    <input type="number" [value]="t.position.z | number:'1.2-2'" disabled readonly>
                  </div>
                </div>
              </div>

              <!-- Scale -->
               <div class="control-row mt-3">
                 <label class="control-label">Scale (Uniform)</label>
                 <div class="flex items-center gap-2 bg-slate-950 p-1.5 rounded border border-slate-800 opacity-60">
                    <span class="material-symbols-outlined text-slate-600 text-xs">open_in_full</span>
                    <input type="range" min="0.1" max="5.0" step="0.1" 
                           [value]="t.scale.x" disabled
                           class="range-slider cursor-not-allowed">
                    <span class="font-mono text-[10px] text-slate-500 w-6 text-right">{{ t.scale.x | number:'1.1-1' }}</span>
                 </div>
               </div>

               <!-- Rotation -->
               <div class="control-row mt-3">
                  <label class="control-label">Rotation (Quaternion)</label>
                  <div class="grid grid-cols-4 gap-1 opacity-60">
                    <div class="input-group disabled"><input type="number" [value]="t.rotation.x | number:'1.2-2'" disabled readonly></div>
                    <div class="input-group disabled"><input type="number" [value]="t.rotation.y | number:'1.2-2'" disabled readonly></div>
                    <div class="input-group disabled"><input type="number" [value]="t.rotation.z | number:'1.2-2'" disabled readonly></div>
                    <div class="input-group disabled"><input type="number" [value]="t.rotation.w | number:'1.2-2'" disabled readonly></div>
                  </div>
               </div>
            }
          </section>

          <!-- Physics Section (EDITABLE) -->
          <section class="p-4">
            <h3 class="section-title">Physics Material</h3>
            @if (physicsPropsSnapshot(); as p) {
                <div class="space-y-4">
                    <div class="flex flex-col gap-1">
                        <div class="flex justify-between text-[10px] text-slate-400">
                           <span>Restitution (Bounciness)</span>
                           <span class="font-mono text-slate-300">{{ p.restitution | number:'1.1-1' }}</span>
                        </div>
                        <input type="range" min="0" max="1.5" step="0.1" [value]="p.restitution" (input)="updatePhysics('restitution', $event)" 
                               class="range-slider w-full">
                    </div>
                    
                    <div class="flex flex-col gap-1">
                        <div class="flex justify-between text-[10px] text-slate-400">
                           <span>Friction</span>
                           <span class="font-mono text-slate-300">{{ p.friction | number:'1.1-1' }}</span>
                        </div>
                        <input type="range" min="0" max="2.0" step="0.1" [value]="p.friction" (input)="updatePhysics('friction', $event)"
                               class="range-slider w-full">
                    </div>
                </div>
            }
          </section>

      } @else {
        <!-- Global Settings -->
        <div class="p-4 space-y-6">
            
            <!-- Gravity -->
            <section>
             <h3 class="section-title flex items-center gap-2">
                <span class="material-symbols-outlined text-sm">public</span> World Settings
             </h3>
             <div class="bg-slate-900/50 p-3 rounded border border-slate-800 space-y-3 mt-2">
                <div class="flex flex-col gap-1">
                    <div class="flex justify-between text-[10px] text-slate-400">
                        <span>Gravity Y</span>
                        <span class="font-mono text-cyan-400">{{ engine.gravityY() | number:'1.1-1' }}</span>
                    </div>
                    <input type="range" min="-20" max="0" step="0.5" 
                        [value]="engine.gravityY()" (input)="updateGravity($event)"
                        class="range-slider w-full">
                </div>
             </div>
            </section>

            <!-- Lighting -->
            <section>
                <h3 class="section-title flex items-center gap-2">
                    <span class="material-symbols-outlined text-sm">light_mode</span> Environment
                </h3>
                <div class="bg-slate-900/50 p-3 rounded border border-slate-800 space-y-4 mt-2">
                    <div class="space-y-1">
                        <div class="flex justify-between text-[10px] text-slate-400">
                        <span>Ambient Intensity</span>
                        <span>{{ ambientIntensity() | number:'1.1-1' }}</span>
                        </div>
                        <input type="range" min="0" max="1" step="0.1" [value]="ambientIntensity()" (input)="updateLight('ambient', $event)"
                            class="range-slider w-full">
                    </div>
                    
                    <div class="space-y-1">
                        <div class="flex justify-between text-[10px] text-slate-400">
                        <span>Sun Intensity</span>
                        <span>{{ dirIntensity() | number:'1.1-1' }}</span>
                        </div>
                        <input type="range" min="0" max="3" step="0.1" [value]="dirIntensity()" (input)="updateLight('dir', $event)"
                            class="range-slider w-full">
                    </div>

                     <div class="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                        <span>Sun Color</span>
                        <div class="relative w-12 h-6 rounded overflow-hidden ring-1 ring-slate-700">
                            <input type="color" [value]="dirColor()" (input)="updateLight('color', $event)" 
                                   class="absolute -top-2 -left-2 w-[200%] h-[200%] p-0 cursor-pointer border-0">
                        </div>
                    </div>
                </div>
            </section>
        </div>
      }
      </div>
    </div>
  `,
  styles: [`
    .section-title { @apply text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2; }
    .control-label { @apply block text-[10px] text-slate-400 mb-1; }
    .control-row { @apply mb-2; }
    
    .input-group { 
        @apply relative flex items-center bg-slate-950 rounded border border-slate-800 transition-colors overflow-hidden;
    }
    .input-group:not(.disabled) { @apply focus-within:border-cyan-500/50; }
    .input-group.disabled { @apply bg-slate-900/50 opacity-70 cursor-not-allowed border-slate-800; }

    .axis-tag {
        @apply absolute left-1.5 text-[9px] font-bold select-none pointer-events-none opacity-80;
    }
    .input-group input {
        @apply w-full bg-transparent border-none py-1.5 pl-4 pr-1 text-[11px] text-center font-mono text-slate-300 focus:outline-none focus:text-cyan-400;
        -moz-appearance: textfield;
    }
    .input-group.disabled input { @apply text-slate-500 cursor-not-allowed; }
    
    .input-group input::-webkit-outer-spin-button,
    .input-group input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

    .range-slider {
        @apply flex-grow h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500;
    }
    
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  `],
  imports: [DecimalPipe]
})
export class InspectorComponent {
  engine = inject(EngineService);
  
  transformSnapshot = signal<Transform | null>(null);
  physicsPropsSnapshot = signal<PhysicsProps | null>(null);
  entityName = signal('');
  
  ambientIntensity = signal(0.4);
  dirIntensity = signal(0.8);
  dirColor = signal('#ffffff');

  constructor() {
    effect(() => {
       const id = this.engine.selectedEntity();
       if (id === null) {
         this.transformSnapshot.set(null);
         this.physicsPropsSnapshot.set(null);
         this.entityName.set('');
         return;
       }
       // We can subscribe to the transform directly or poll it. 
       // Since the engine loop updates transforms, this effect might not trigger on every frame unless we use a signal updated by the loop.
       // However, for the inspector, just reading the store when selection changes or strictly when signal updates is fine.
       // NOTE: Real-time inspector updates during physics would require a signal-based store or polling. 
       // Given the constraints, we update snapshot on selection.
       this.refreshSnapshot(id);
    });
  }
  
  // Helper to refresh data (could be called on loop if we wanted live updates, but keeping it simple)
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
      }
  }

  // NOTE: Transform updates removed as per guidelines (Read-only)

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
