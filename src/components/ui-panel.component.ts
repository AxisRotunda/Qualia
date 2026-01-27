
import { Component, output, input, signal } from '@angular/core';

@Component({
  selector: 'app-ui-panel',
  standalone: true,
  template: `
    <div class="fixed top-4 right-4 w-72 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-xl p-5 shadow-2xl text-slate-100 z-50">
      <div class="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
        <h2 class="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          Control Panel
        </h2>
        <span class="text-xs font-mono text-slate-400">{{ fps() }} FPS</span>
      </div>

      <div class="space-y-4">
        <!-- Stats -->
        <div class="flex justify-between text-sm text-slate-300">
          <span>Objects</span>
          <span class="font-mono text-cyan-400">{{ objectCount() }}</span>
        </div>

        <!-- Gravity Slider -->
        <div class="space-y-1">
          <div class="flex justify-between text-xs text-slate-400">
            <span>Gravity (Y)</span>
            <span>{{ gravityValue() }} m/s²</span>
          </div>
          <input 
            type="range" 
            min="-20" 
            max="10" 
            step="0.5" 
            [value]="gravityValue()"
            (input)="updateGravity($event)"
            class="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
          >
        </div>

        <!-- Spawn Controls -->
        <div class="grid grid-cols-2 gap-2 pt-2">
          <button 
            (click)="onSpawnBox.emit()"
            class="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-200 rounded-lg text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span class="w-3 h-3 bg-blue-400 rounded-sm"></span> Box
          </button>
          
          <button 
            (click)="onSpawnSphere.emit()"
            class="px-3 py-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-purple-200 rounded-lg text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span class="w-3 h-3 bg-purple-400 rounded-full"></span> Sphere
          </button>
        </div>

        <button 
          (click)="onReset.emit()"
          class="w-full mt-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg text-sm transition-all"
        >
          Reset Simulation
        </button>

        <!-- Instructions -->
        <div class="text-[10px] text-slate-500 pt-2 border-t border-slate-700/50 mt-4 text-center">
          Rapier WASM + Three.js + Angular
        </div>
      </div>
    </div>
  `
})
export class UiPanelComponent {
  objectCount = input.required<number>();
  fps = input.required<number>();
  
  onSpawnBox = output<void>();
  onSpawnSphere = output<void>();
  onReset = output<void>();
  onGravityChange = output<number>();

  gravityValue = signal(-9.81);

  updateGravity(e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value);
    this.gravityValue.set(val);
    this.onGravityChange.emit(val);
  }
}
