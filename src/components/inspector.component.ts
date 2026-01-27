
import { Component, inject, computed, signal, effect } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { EngineService } from '../services/engine.service';
import { Transform, PhysicsProps } from '../engine/core';

@Component({
  selector: 'app-inspector',
  standalone: true,
  template: `
    <div class="h-full flex flex-col text-slate-300">
      <div class="h-10 flex items-center px-4 border-b border-slate-800 bg-slate-900 font-bold text-xs tracking-wider text-slate-400 uppercase select-none">
        Properties
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
      
      @if (engine.selectedEntity() !== null) {
          
          <!-- Header -->
          <div class="flex justify-between items-center pb-2 border-b border-slate-800">
             <div class="flex items-center gap-2">
                 <span class="material-symbols-outlined text-cyan-500 text-lg">data_object</span>
                 <span class="font-bold text-slate-200">Entity_{{ engine.selectedEntity() }}</span>
             </div>
             <button class="p-1 hover:bg-red-500/10 hover:text-red-400 rounded transition-colors text-slate-500" 
                     title="Delete"
                     (click)="deleteSelected()">
                <span class="material-symbols-outlined text-[18px]">delete</span>
             </button>
          </div>

          <!-- Position -->
          <div class="control-group">
            <h3 class="group-label">Position</h3>
            @if (transformSnapshot(); as t) {
              <div class="grid grid-cols-3 gap-2">
                <div class="input-wrapper">
                  <span class="axis-label text-red-500">X</span>
                  <input type="number" step="0.1" [value]="t.position.x | number:'1.2-2'" (change)="updatePos('x', $event)">
                </div>
                <div class="input-wrapper">
                  <span class="axis-label text-green-500">Y</span>
                  <input type="number" step="0.1" [value]="t.position.y | number:'1.2-2'" (change)="updatePos('y', $event)">
                </div>
                <div class="input-wrapper">
                  <span class="axis-label text-blue-500">Z</span>
                  <input type="number" step="0.1" [value]="t.position.z | number:'1.2-2'" (change)="updatePos('z', $event)">
                </div>
              </div>
            }
          </div>

          <!-- Rotation -->
          <div class="control-group">
            <h3 class="group-label">Rotation (Quaternion)</h3>
            @if (transformSnapshot(); as t) {
              <div class="grid grid-cols-4 gap-2">
                <div class="input-wrapper"><input type="number" step="0.1" [value]="t.rotation.x | number:'1.2-2'" (change)="updateRot('x', $event)"></div>
                <div class="input-wrapper"><input type="number" step="0.1" [value]="t.rotation.y | number:'1.2-2'" (change)="updateRot('y', $event)"></div>
                <div class="input-wrapper"><input type="number" step="0.1" [value]="t.rotation.z | number:'1.2-2'" (change)="updateRot('z', $event)"></div>
                <div class="input-wrapper"><input type="number" step="0.1" [value]="t.rotation.w | number:'1.2-2'" (change)="updateRot('w', $event)"></div>
              </div>
            }
          </div>

          <!-- Scale -->
          <div class="control-group">
            <h3 class="group-label">Scale</h3>
            @if (transformSnapshot(); as t) {
               <div class="flex items-center gap-3 bg-slate-950 p-2 rounded border border-slate-800">
                 <span class="material-symbols-outlined text-slate-500 text-sm">resize</span>
                 <input type="range" min="0.1" max="3.0" step="0.1" 
                        [value]="t.scale.x" (input)="updateScaleUniform($event)"
                        class="flex-grow h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500">
                 <span class="font-mono text-xs text-cyan-400 w-8 text-right">{{ t.scale.x | number:'1.1-1' }}</span>
               </div>
            }
          </div>

          <!-- Physics Material -->
          <div class="control-group">
            <h3 class="group-label">Physics Material</h3>
            @if (physicsPropsSnapshot(); as p) {
                <div class="space-y-3">
                    <div class="flex justify-between items-center">
                        <span class="text-xs text-slate-400">Restitution</span>
                        <div class="flex items-center gap-2">
                            <input type="range" min="0" max="1.5" step="0.1" [value]="p.restitution" (input)="updatePhysics('restitution', $event)" 
                                   class="w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500">
                            <span class="font-mono text-xs w-8 text-right">{{ p.restitution | number:'1.1-1' }}</span>
                        </div>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-xs text-slate-400">Friction</span>
                        <div class="flex items-center gap-2">
                             <input type="range" min="0" max="2.0" step="0.1" [value]="p.friction" (input)="updatePhysics('friction', $event)"
                                   class="w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500">
                             <span class="font-mono text-xs w-8 text-right">{{ p.friction | number:'1.1-1' }}</span>
                        </div>
                    </div>
                </div>
            }
          </div>

      } @else {
        <!-- Global Settings -->
        <div class="space-y-6">
            
            <!-- Gravity -->
            <div class="control-group">
             <h3 class="group-label flex items-center gap-2">
                <span class="material-symbols-outlined text-sm">public</span> World Gravity
             </h3>
             <div class="bg-slate-950 p-3 rounded border border-slate-800 space-y-2">
                <div class="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Y-Axis Force</span>
                    <span class="font-mono text-cyan-400">{{ engine.gravityY() | number:'1.1-1' }}</span>
                </div>
                <input type="range" min="-20" max="0" step="0.5" 
                    [value]="engine.gravityY()" (input)="updateGravity($event)"
                    class="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500">
             </div>
            </div>

            <!-- Lighting -->
            <div class="control-group">
                <h3 class="group-label flex items-center gap-2">
                    <span class="material-symbols-outlined text-sm">light_mode</span> Environment
                </h3>
                <div class="bg-slate-950 p-3 rounded border border-slate-800 space-y-4">
                    <div class="space-y-1">
                        <div class="flex justify-between text-xs text-slate-400">
                        <span>Ambient Light</span>
                        <span>{{ ambientIntensity() | number:'1.1-1' }}</span>
                        </div>
                        <input type="range" min="0" max="1" step="0.1" [value]="ambientIntensity()" (input)="updateLight('ambient', $event)"
                            class="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500">
                    </div>
                    
                    <div class="space-y-1">
                        <div class="flex justify-between text-xs text-slate-400">
                        <span>Sun Intensity</span>
                        <span>{{ dirIntensity() | number:'1.1-1' }}</span>
                        </div>
                        <input type="range" min="0" max="3" step="0.1" [value]="dirIntensity()" (input)="updateLight('dir', $event)"
                            class="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500">
                    </div>

                     <div class="flex justify-between items-center text-xs text-slate-400 pt-1">
                        <span>Sun Color</span>
                        <div class="relative w-6 h-6 rounded-full overflow-hidden ring-1 ring-slate-600">
                            <input type="color" [value]="dirColor()" (input)="updateLight('color', $event)" 
                                   class="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] p-0 cursor-pointer border-0">
                        </div>
                    </div>
                </div>
            </div>
        </div>
      }
      </div>
    </div>
  `,
  styles: [`
    .group-label { @apply text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2; }
    .control-group { @apply mb-2; }
    .input-wrapper { 
        @apply relative flex items-center bg-slate-950 rounded border border-slate-800 focus-within:border-cyan-500/50 transition-colors;
    }
    .axis-label {
        @apply absolute left-2 text-[10px] font-bold select-none pointer-events-none;
    }
    .input-wrapper input {
        @apply w-full bg-transparent border-none py-1.5 pl-5 pr-1 text-xs text-right font-mono text-slate-300 focus:outline-none focus:text-cyan-400;
    }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  `],
  imports: [DecimalPipe]
})
export class InspectorComponent {
  engine = inject(EngineService);
  
  // Snapshots for stable UI values
  transformSnapshot = signal<Transform | null>(null);
  physicsPropsSnapshot = signal<PhysicsProps | null>(null);
  
  // Local state for lights (simple approach)
  ambientIntensity = signal(0.4);
  dirIntensity = signal(0.8);
  dirColor = signal('#ffffff');

  constructor() {
    // Update snapshots only when selection changes
    effect(() => {
       const id = this.engine.selectedEntity();
       if (id === null) {
         this.transformSnapshot.set(null);
         this.physicsPropsSnapshot.set(null);
         return;
       }
       // Clone data to avoid reference mutations by engine loop
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
    });
  }

  updatePos(axis: 'x' | 'y' | 'z', e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value);
    if (isNaN(val)) return;
    const id = this.engine.selectedEntity();
    if (id === null) return;
    
    const t = this.engine.world.transforms.get(id);
    if (!t) return;
    
    // Create new pos object for physics
    const newPos = { ...t.position };
    newPos[axis] = val;
    
    // Update engine
    const rb = this.engine.world.rigidBodies.get(id);
    if(rb) this.engine.physicsService.updateBodyTransform(rb.handle, newPos, t.rotation);

    // Update snapshot manually
    this.transformSnapshot.update(curr => {
        if (!curr) return null;
        return { ...curr, position: newPos };
    });
  }
  
  updateRot(axis: 'x'|'y'|'z'|'w', e: Event) {
      const val = parseFloat((e.target as HTMLInputElement).value);
      if(isNaN(val)) return;
      const id = this.engine.selectedEntity();
      if(id===null) return;
      
      const t = this.engine.world.transforms.get(id);
      const rb = this.engine.world.rigidBodies.get(id);
      if(!t || !rb) return;
      
      const newRot = { ...t.rotation };
      newRot[axis] = val;
      
      this.engine.physicsService.updateBodyTransform(rb.handle, t.position, newRot);

      // Update snapshot manually
      this.transformSnapshot.update(curr => {
          if (!curr) return null;
          return { ...curr, rotation: newRot };
      });
  }

  updateScaleUniform(e: Event) {
      const val = parseFloat((e.target as HTMLInputElement).value);
      const id = this.engine.selectedEntity();
      if(id===null) return;
      
      this.engine.updateEntityScale(id, {x: val, y: val, z: val});

      // Update snapshot manually
      this.transformSnapshot.update(curr => {
          if (!curr) return null;
          return { ...curr, scale: {x: val, y: val, z: val} };
      });
  }

  updatePhysics(prop: 'friction' | 'restitution', e: Event) {
      const val = parseFloat((e.target as HTMLInputElement).value);
      const id = this.engine.selectedEntity();
      if(id===null) return;
      
      const props = this.engine.world.physicsProps.get(id);
      if(!props) return;
      
      const newProps = { ...props, [prop]: val };
      this.engine.updateEntityPhysics(id, newProps);

      // Update snapshot manually
      this.physicsPropsSnapshot.update(curr => {
          if (!curr) return null;
          return { ...curr, [prop]: val };
      });
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
