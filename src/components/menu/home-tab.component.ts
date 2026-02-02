
import { Component, input, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EngineService } from '../../services/engine.service';

@Component({
  selector: 'app-menu-home-tab',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500">
      
      <!-- Header -->
      <header class="flex justify-between items-end border-b border-white/10 pb-4 shrink-0">
         <div>
           <h1 class="text-4xl font-black tracking-[0.2em] text-white uppercase font-sans">Dashboard</h1>
           <div class="flex items-center gap-3 text-[10px] font-mono text-cyan-400 mt-2">
              <div class="flex items-center gap-1.5">
                  <span class="w-2 h-2 bg-cyan-500 rounded-sm animate-pulse shadow-[0_0_8px_cyan]"></span>
                  <span>SYSTEM_READY</span>
              </div>
              <span class="text-slate-700">//</span>
              <span class="text-slate-500 tracking-widest">KERNEL_RC_6.1_STABLE</span>
           </div>
         </div>
         <div class="text-right hidden sm:block">
            <div class="text-[9px] text-slate-500 uppercase tracking-[0.3em] font-black mb-1">Session Protocol</div>
            <div class="font-mono text-slate-300 text-sm tracking-tighter">0x{{ sessionId }}</div>
         </div>
      </header>

      <!-- Main Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
         
         <!-- Left: Primary Selection Core -->
         <div class="lg:col-span-2 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
            
            <!-- Resume High-Impact Tile -->
            <button (click)="resume.emit()" 
                    [disabled]="!canContinue()"
                    class="relative min-h-[220px] group overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-black p-8 text-left transition-all hover:border-cyan-500/50 hover:shadow-[0_0_40px_rgba(6,182,212,0.1)] disabled:opacity-50 disabled:cursor-not-allowed">
                
                <!-- Technical Background Decor -->
                <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay"></div>
                <div class="absolute top-0 right-0 p-32 bg-cyan-500/5 blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3 group-hover:bg-cyan-500/10 transition-colors duration-1000"></div>
                
                <!-- Corner Markers -->
                <div class="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-white/10 group-hover:border-cyan-500/40 transition-colors"></div>
                <div class="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-white/10 group-hover:border-cyan-500/40 transition-colors"></div>

                <div class="relative z-10 h-full flex flex-col justify-between">
                   <div class="flex justify-between items-start">
                      <span class="px-2.5 py-1 rounded bg-cyan-950/40 text-cyan-400 text-[10px] font-black border border-cyan-500/20 tracking-[0.2em] font-mono">
                        {{ canContinue() ? 'SNAPSHOT_DETECTION' : 'EMPTY_BUFFER' }}
                      </span>
                      <span class="material-symbols-outlined text-slate-800 group-hover:text-cyan-500/60 transition-all duration-500 text-6xl">history_edu</span>
                   </div>
                   
                   <div>
                      <h2 class="text-3xl font-black text-white mb-2 group-hover:text-cyan-50 transition-colors tracking-tight uppercase">
                        {{ continueLabel() }}
                      </h2>
                      <div class="flex items-center gap-4 text-[10px] text-slate-500 font-mono tracking-widest">
                         <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-xs">database</span> LOCAL_CACHE_01</span>
                         <span class="text-slate-800">|</span>
                         <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-xs">schedule</span> {{ timestamp }}</span>
                      </div>
                   </div>
                </div>
            </button>

            <!-- Actions Row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <!-- New Sandbox -->
                <button (click)="newSandbox.emit()" 
                        class="group relative h-36 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 p-6 text-left hover:bg-slate-800/80 transition-all hover:border-emerald-500/40 active:scale-[0.98] backdrop-blur-sm">
                   <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                   
                   <div class="flex justify-between items-start h-full flex-col">
                       <div class="w-10 h-10 rounded-lg bg-emerald-950/30 border border-emerald-900/50 flex items-center justify-center text-emerald-500 group-hover:text-emerald-300 transition-colors">
                           <span class="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">add_box</span>
                       </div>
                       <div>
                          <div class="text-xl font-black text-slate-100 group-hover:text-white uppercase tracking-wider">Initialize Void</div>
                          <div class="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-bold group-hover:text-emerald-400/70 transition-colors mt-1">NEW_SANDBOX_INSTANCE</div>
                       </div>
                   </div>
                </button>

                <!-- Network Interface (Disabled) -->
                <button disabled class="group relative h-36 overflow-hidden rounded-2xl border border-white/5 bg-slate-950 p-6 text-left opacity-40 cursor-not-allowed">
                   <div class="flex justify-between items-start h-full flex-col">
                       <div class="w-10 h-10 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-slate-600">
                           <span class="material-symbols-outlined text-2xl">cloud_sync</span>
                       </div>
                       <div>
                          <div class="text-xl font-black text-slate-600 uppercase tracking-wider">Cloud Link</div>
                          <div class="text-[9px] text-slate-700 uppercase tracking-[0.2em] font-bold mt-1">DEDICATED_SERVER_OFFLINE</div>
                       </div>
                   </div>
                </button>
            </div>
         </div>

         <!-- Right: Core System Telemetry -->
         <div class="hidden lg:flex col-span-1 bg-slate-950/40 rounded-2xl border border-white/5 p-8 flex-col gap-8 h-full font-mono text-xs backdrop-blur-sm">
            
            <section>
                <div class="text-[10px] uppercase font-black text-slate-600 tracking-[0.25em] mb-5 border-b border-white/5 pb-3">Subsystems</div>
                <div class="space-y-4">
                    <div class="flex justify-between items-center group">
                       <span class="text-slate-500 group-hover:text-slate-300 transition-colors">PHYSICS_ENGINE</span>
                       <span class="text-[10px] text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800 font-bold">RAPIER_3D</span>
                    </div>
                    <div class="flex justify-between items-center group">
                       <span class="text-slate-500 group-hover:text-slate-300 transition-colors">RENDER_MATRIX</span>
                       <span class="text-[10px] text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800 font-bold">WEBGL_2.0</span>
                    </div>
                    <div class="flex justify-between items-center group">
                       <span class="text-slate-500 group-hover:text-slate-300 transition-colors">THREAD_POOL</span>
                       <span class="text-[10px] text-emerald-400 font-bold flex items-center gap-1.5">
                           <span class="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></span>
                           ACTIVE (3)
                       </span>
                    </div>
                </div>
            </section>

            <section>
                <div class="text-[10px] uppercase font-black text-slate-600 tracking-[0.25em] mb-5 border-b border-white/5 pb-3">Metrics</div>
                <div class="space-y-6">
                    <div class="space-y-2">
                        <div class="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                            <span>Entities</span>
                            <span class="text-white">{{ engine.objectCount() }}</span>
                        </div>
                        <div class="h-1 bg-slate-900 rounded-full overflow-hidden p-[1px] border border-white/5">
                            <div class="h-full bg-cyan-500 shadow-[0_0_10px_cyan] transition-all duration-1000" [style.width.%]="(engine.objectCount() / 2000) * 100"></div>
                        </div>
                    </div>
                    <div class="space-y-2">
                        <div class="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                            <span>VRAM EST.</span>
                            <span class="text-white">{{ (engine.objectCount() * 0.45).toFixed(1) }} MB</span>
                        </div>
                        <div class="h-1 bg-slate-900 rounded-full overflow-hidden p-[1px] border border-white/5">
                            <div class="h-full bg-blue-600 shadow-[0_0_10px_blue] transition-all duration-1000" [style.width.%]="(engine.objectCount() / 1000) * 100"></div>
                        </div>
                    </div>
                </div>
            </section>

            <div class="mt-auto p-4 bg-black/40 rounded-xl border border-white/5 text-[10px] text-slate-600 leading-relaxed font-mono">
                <span class="text-cyan-800">></span> KERNEL_STABILIZED<br>
                <span class="text-cyan-800">></span> THREAD_COUNT_VALIDATED<br>
                <span class="text-cyan-800">></span> AWAITING_COMMAND...
            </div>
         </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
  `]
})
export class MenuHomeTabComponent {
  engine = inject(EngineService);
  
  canContinue = input.required<boolean>();
  continueLabel = input.required<string>();
  
  resume = output<void>();
  newSandbox = output<void>();

  sessionId = Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0');
  timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
