
import { Component, inject, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { EngineService } from '../services/engine.service';

@Component({
  selector: 'app-inspector',
  standalone: true,
  template: `
    <div class="h-full flex flex-col bg-slate-900 border-l border-slate-700 text-slate-300" style="contain: layout style;">
      <div class="p-3 border-b border-slate-700 font-bold text-xs tracking-wide bg-slate-950 text-slate-400 flex justify-between items-center">
        <span>INSPECTOR</span>
        @if (engine.isPaused()) {
          <span class="text-[10px] text-amber-500 font-mono px-1 border border-amber-900 bg-amber-900/20 rounded">PAUSED</span>
        }
      </div>

      @if (engine.selectedEntity() !== null) {
        <div class="p-4 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          <div class="flex justify-between items-center">
             <div class="text-xs font-mono text-cyan-500">ID: {{ engine.selectedEntity() }}</div>
             <button class="text-[10px] text-red-400 hover:text-red-300" (click)="deleteSelected()">DELETE</button>
          </div>

          <!-- Position -->
          <div class="space-y-3">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <span>Position</span>
              <div class="h-px bg-slate-700 flex-grow"></div>
            </div>
            @if (transform(); as t) {
              <div class="grid grid-cols-3 gap-2">
                <div class="flex flex-col gap-1">
                  <label class="text-[9px] text-red-400 text-center font-bold">X</label>
                  <input type="number" step="0.1"
                    [value]="t.position.x | number:'1.2-2'" 
                    (change)="updatePos('x', $event)"
                    class="input-field">
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[9px] text-green-400 text-center font-bold">Y</label>
                  <input type="number" step="0.1"
                    [value]="t.position.y | number:'1.2-2'" 
                    (change)="updatePos('y', $event)"
                    class="input-field">
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[9px] text-blue-400 text-center font-bold">Z</label>
                  <input type="number" step="0.1"
                    [value]="t.position.z | number:'1.2-2'" 
                    (change)="updatePos('z', $event)"
                    class="input-field">
                </div>
              </div>
            }
          </div>

          <!-- Rotation (Quaternion) -->
          <div class="space-y-3">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <span>Rotation (Quat)</span>
              <div class="h-px bg-slate-700 flex-grow"></div>
            </div>
            @if (transform(); as t) {
              <div class="grid grid-cols-4 gap-1">
                <input type="number" step="0.1" [value]="t.rotation.x | number:'1.2-2'" (change)="updateRot('x', $event)" class="input-field text-[10px]">
                <input type="number" step="0.1" [value]="t.rotation.y | number:'1.2-2'" (change)="updateRot('y', $event)" class="input-field text-[10px]">
                <input type="number" step="0.1" [value]="t.rotation.z | number:'1.2-2'" (change)="updateRot('z', $event)" class="input-field text-[10px]">
                <input type="number" step="0.1" [value]="t.rotation.w | number:'1.2-2'" (change)="updateRot('w', $event)" class="input-field text-[10px]">
              </div>
            }
          </div>

          <!-- Scale -->
          <div class="space-y-3">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <span>Scale</span>
              <div class="h-px bg-slate-700 flex-grow"></div>
            </div>
            @if (transform(); as t) {
               <!-- Uniform Scale slider for simplicity in this version -->
               <div class="flex items-center gap-2">
                 <span class="text-[10px] text-slate-400 w-8">Unif</span>
                 <input type="range" min="0.1" max="5.0" step="0.1" 
                        [value]="t.scale.x" (input)="updateScaleUniform($event)"
                        class="flex-grow h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500">
                 <span class="text-[10px] font-mono text-cyan-400 w-8 text-right">{{ t.scale.x | number:'1.1-1' }}</span>
               </div>
            }
          </div>

          <!-- Physics Material -->
          <div class="space-y-3">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <span>Physics Material</span>
              <div class="h-px bg-slate-700 flex-grow"></div>
            </div>
            @if (physicsProps(); as p) {
                <div class="space-y-2">
                    <div class="flex justify-between items-center text-[10px]">
                        <span class="text-slate-400">Restitution (Bounce)</span>
                        <input type="number" min="0" max="1.5" step="0.1" [value]="p.restitution" (change)="updatePhysics('restitution', $event)"
                               class="w-16 bg-slate-800 border border-slate-700 rounded px-1 text-right focus:border-cyan-500 outline-none">
                    </div>
                    <div class="flex justify-between items-center text-[10px]">
                        <span class="text-slate-400">Friction</span>
                         <input type="number" min="0" max="2.0" step="0.1" [value]="p.friction" (change)="updatePhysics('friction', $event)"
                               class="w-16 bg-slate-800 border border-slate-700 rounded px-1 text-right focus:border-cyan-500 outline-none">
                    </div>
                </div>
            }
          </div>

        </div>
      } @else {
        <!-- Global Settings -->
        <div class="p-4 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          <div class="space-y-3">
             <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <span>World Settings</span>
              <div class="h-px bg-slate-700 flex-grow"></div>
            </div>

            <!-- Gravity -->
            <div class="space-y-2">
              <div class="flex justify-between text-xs text-slate-400">
                <span>Gravity Y</span>
                <span class="font-mono text-cyan-400">{{ engine.gravityY() | number:'1.1-1' }}</span>
              </div>
              <input 
                type="range" 
                min="-20" 
                max="0" 
                step="0.1" 
                [value]="engine.gravityY()"
                (input)="updateGravity($event)"
                class="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
              >
            </div>
            
            <!-- Lights -->
            <div class="space-y-4 pt-4 border-t border-slate-800">
                <div class="flex justify-between text-xs text-slate-400">
                   <span>Ambient Intensity</span>
                   <span class="font-mono text-cyan-400">{{ ambientIntensity() | number:'1.1-1' }}</span>
                </div>
                <input type="range" min="0" max="1" step="0.05" [value]="ambientIntensity()" (input)="updateLight('ambient', $event)"
                       class="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500">
                
                <div class="flex justify-between text-xs text-slate-400">
                   <span>Sun Intensity</span>
                   <span class="font-mono text-cyan-400">{{ dirIntensity() | number:'1.1-1' }}</span>
                </div>
                <input type="range" min="0" max="3" step="0.1" [value]="dirIntensity()" (input)="updateLight('dir', $event)"
                       class="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500">

                <div class="flex justify-between items-center text-xs text-slate-400">
                   <span>Sun Color</span>
                   <input type="color" [value]="dirColor()" (input)="updateLight('color', $event)" class="bg-transparent border-0 w-6 h-6 p-0 cursor-pointer">
                </div>
            </div>

          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .input-field {
        @apply w-full bg-slate-950 border border-slate-700 rounded px-1 py-1 text-xs text-center focus:border-cyan-500 focus:text-cyan-400 outline-none transition-colors;
    }
  `],
  imports: [DecimalPipe]
})
export class InspectorComponent {
  engine = inject(EngineService);
  
  private frameCounter = signal(0);
  
  // Local state for lights (simple approach)
  ambientIntensity = signal(0.4);
  dirIntensity = signal(0.8);
  dirColor = signal('#ffffff');

  constructor() {
    const loop = () => {
      // Always loop to update stats if visible
      this.frameCounter.update(v => v + 1);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  transform = computed(() => {
    this.frameCounter(); 
    const e = this.engine.selectedEntity();
    return e !== null ? this.engine.world.transforms.get(e) : null;
  });

  physicsProps = computed(() => {
      const e = this.engine.selectedEntity();
      return e !== null ? this.engine.world.physicsProps.get(e) : null;
  });

  updatePos(axis: 'x' | 'y' | 'z', e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value);
    if (isNaN(val)) return;
    const id = this.engine.selectedEntity();
    if (id === null) return;
    
    const t = this.engine.world.transforms.get(id);
    if (!t) return;
    
    // Create new pos object
    const newPos = { ...t.position };
    newPos[axis] = val;
    
    // Accessing handle via service wrapper is cleaner
    const rb = this.engine.world.rigidBodies.get(id);
    if(rb) this.engine.physicsService.updateBodyTransform(rb.handle, newPos);
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
      
      // We don't normalize here immediately to allow user to type, 
      // but physics engine usually expects normalized quat.
      this.engine.physicsService.updateBodyTransform(rb.handle, t.position, newRot);
  }

  updateScaleUniform(e: Event) {
      const val = parseFloat((e.target as HTMLInputElement).value);
      const id = this.engine.selectedEntity();
      if(id===null) return;
      this.engine.updateEntityScale(id, {x: val, y: val, z: val});
  }

  updatePhysics(prop: 'friction' | 'restitution', e: Event) {
      const val = parseFloat((e.target as HTMLInputElement).value);
      const id = this.engine.selectedEntity();
      if(id===null) return;
      
      const props = this.engine.world.physicsProps.get(id);
      if(!props) return;
      
      const newProps = { ...props, [prop]: val };
      this.engine.updateEntityPhysics(id, newProps);
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
