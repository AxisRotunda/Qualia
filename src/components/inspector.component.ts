
import { Component, inject, computed, signal, effect, ElementRef } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { EngineService } from '../services/engine.service';

@Component({
  selector: 'app-inspector',
  standalone: true,
  template: `
    <div class="h-full flex flex-col bg-slate-900 border-l border-slate-700 text-slate-300">
      <div class="p-3 border-b border-slate-700 font-bold text-xs tracking-wide bg-slate-950 text-slate-400">
        INSPECTOR
      </div>

      @if (engine.selectedEntity() !== null) {
        <div class="p-4 space-y-6 overflow-y-auto">
          <div class="flex justify-between items-center">
             <div class="text-xs font-mono text-cyan-500">ID: {{ engine.selectedEntity() }}</div>
             <button class="text-[10px] text-red-400 hover:text-red-300" (click)="deleteSelected()">DELETE</button>
          </div>

          <!-- Transform -->
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
                    class="w-full bg-slate-950 border border-slate-700 rounded px-1 py-1 text-xs text-center focus:border-cyan-500 focus:text-cyan-400 outline-none transition-colors">
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[9px] text-green-400 text-center font-bold">Y</label>
                  <input type="number" step="0.1"
                    [value]="t.position.y | number:'1.2-2'" 
                    (change)="updatePos('y', $event)"
                    class="w-full bg-slate-950 border border-slate-700 rounded px-1 py-1 text-xs text-center focus:border-cyan-500 focus:text-cyan-400 outline-none transition-colors">
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[9px] text-blue-400 text-center font-bold">Z</label>
                  <input type="number" step="0.1"
                    [value]="t.position.z | number:'1.2-2'" 
                    (change)="updatePos('z', $event)"
                    class="w-full bg-slate-950 border border-slate-700 rounded px-1 py-1 text-xs text-center focus:border-cyan-500 focus:text-cyan-400 outline-none transition-colors">
                </div>
              </div>
            }
          </div>

          <div class="p-3 bg-slate-800/50 rounded border border-slate-700/50">
             <div class="text-[10px] text-slate-400 leading-relaxed">
               <span class="text-cyan-500">Info:</span> Values update in real-time at 60Hz. Modifying position teleports the physics body and resets momentum.
             </div>
          </div>
        </div>
      } @else {
        <div class="flex-1 flex flex-col items-center justify-center text-slate-600 gap-2">
          <span class="material-symbols-outlined text-4xl opacity-20">data_object</span>
          <span class="text-xs">No Entity Selected</span>
        </div>
      }
    </div>
  `,
  imports: [DecimalPipe]
})
export class InspectorComponent {
  engine = inject(EngineService);
  
  private frameCounter = signal(0);

  constructor() {
    // High-performance loop to drive the inspector values without triggering full app change detection
    const loop = () => {
      if (this.engine.selectedEntity() !== null) {
        this.frameCounter.update(v => v + 1);
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  // Reactive transform computed from ECS + Frame Signal
  transform = computed(() => {
    this.frameCounter(); // Dependency to force update
    const e = this.engine.selectedEntity();
    return e !== null ? this.engine.world.transforms.get(e) : null;
  });

  updatePos(axis: 'x' | 'y' | 'z', e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value);
    const id = this.engine.selectedEntity();
    if (id === null) return;

    const rb = this.engine.world.rigidBodies.get(id);
    if (!rb) return;

    const current = this.engine.world.transforms.get(id)?.position;
    if (!current) return;

    // Construct new position
    const newPos = { ...current };
    newPos[axis] = val;

    // Write-back to Physics
    this.engine.physicsService.updateBodyTransform(rb.handle, newPos);
  }

  deleteSelected() {
      const e = this.engine.selectedEntity();
      if (e !== null) this.engine.deleteEntity(e);
  }
}
