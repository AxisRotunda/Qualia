
import { Component, output, input, signal } from '@angular/core';

@Component({
  selector: 'app-ui-panel',
  standalone: true,
  template: `
    <div class="bg-slate-900 border-l border-slate-700 border-t p-4 text-slate-100 h-full flex flex-col gap-4">
      <div class="flex justify-between items-center pb-2 border-b border-slate-700">
        <h2 class="text-sm font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          CONTROLS
        </h2>
        <span class="text-xs font-mono text-cyan-400">{{ fps() }} FPS</span>
      </div>

      <!-- Stats -->
      <div class="flex justify-between text-xs text-slate-400">
        <span>Entities</span>
        <span class="font-mono text-white">{{ objectCount() }}</span>
      </div>

      <!-- Gravity Slider -->
      <div class="space-y-1">
        <div class="flex justify-between text-xs text-slate-400">
          <span>Gravity (Y)</span>
          <span>{{ gravityValue() }}</span>
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
      <div class="grid grid-cols-2 gap-2">
        <button 
          (click)="onSpawnBox.emit()"
          class="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-200 rounded text-xs transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          Box
        </button>
        
        <button 
          (click)="onSpawnSphere.emit()"
          class="px-3 py-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-purple-200 rounded text-xs transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          Sphere
        </button>
      </div>

      <button 
        (click)="onReset.emit()"
        class="w-full mt-auto px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 rounded text-xs transition-all"
      >
        Reset Simulation
      </button>
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
