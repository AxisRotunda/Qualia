
import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EngineService } from '../../services/engine.service';

@Component({
  selector: 'app-loading-screen',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center font-mono text-cyan-500 select-none cursor-wait">
        <!-- Background Grid -->
        <div class="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] bg-repeat opacity-20 pointer-events-none"></div>
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#020617_90%)] pointer-events-none"></div>

        <div class="relative w-80 flex flex-col gap-1">
            <!-- Glitch Title -->
            <h1 class="text-2xl font-black tracking-[0.3em] text-slate-100 mb-8 text-center animate-pulse">
                QUALIA<span class="text-cyan-500">3D</span>
            </h1>

            <!-- Terminal Output -->
            <div class="h-24 overflow-hidden text-[10px] text-slate-500 border-l-2 border-slate-800 pl-3 mb-4 flex flex-col justify-end">
                @for (line of logs(); track $index) {
                    <div class="opacity-70">>> {{ line }}</div>
                }
                <div class="text-cyan-400 font-bold">>> {{ engine.state.loadingStage() }}...</div>
            </div>

            <!-- Progress Bar -->
            <div class="w-full h-1 bg-slate-900 rounded-full overflow-hidden relative">
                <div class="absolute inset-0 bg-cyan-500 shadow-[0_0_10px_cyan] transition-all duration-300 ease-out"
                     [style.width.%]="engine.state.loadingProgress()"></div>
            </div>
            
            <div class="flex justify-between mt-2 text-[9px] text-cyan-600 font-bold">
                <span>MEM: {{ (engine.objectCount() * 0.45).toFixed(1) }} MB</span>
                <span>{{ engine.state.loadingProgress() | number:'1.0-0' }}%</span>
            </div>
        </div>
    </div>
  `
})
export class LoadingScreenComponent {
  engine = inject(EngineService);
  
  // Dummy logs for visual flavor
  logs = computed(() => {
      const p = this.engine.state.loadingProgress();
      const l = [
          "System Integrity Check... OK",
          "Allocating Physics Buffers... OK",
          "Compiling Shaders... OK"
      ];
      if (p > 30) l.push("Generating Mesh Topology...");
      if (p > 60) l.push("Calculating Light Maps...");
      if (p > 80) l.push("Finalizing World State...");
      return l.slice(-4);
  });
}
