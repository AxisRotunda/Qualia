
import { Component, input, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EngineService } from '../../services/engine.service';

@Component({
  selector: 'app-menu-home-tab',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-500">
      
      <!-- Header -->
      <header class="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-white/8 pb-6 shrink-0 gap-4">
         <div>
           <h1 class="text-4xl sm:text-5xl font-black tracking-[0.15em] text-white uppercase font-sans leading-tight">Dashboard</h1>
           <div class="flex items-center gap-3 text-[9px] font-mono text-cyan-400/80 mt-3">
              <div class="flex items-center gap-1.5">
                  <span class="w-2 h-2 bg-cyan-500 rounded-sm animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.6)]"></span>
                  <span class="font-bold tracking-wider">SYSTEM_READY</span>
              </div>
              <span class="text-slate-700">//</span>
              <span class="text-slate-500 tracking-widest font-mono">KERNEL_RC_6.1_STABLE</span>
           </div>
         </div>
         <div class="text-right hidden sm:block opacity-85">
            <div class="text-[8px] text-slate-500 uppercase tracking-[0.3em] font-black mb-1.5">Session Protocol</div>
            <div class="font-mono text-slate-300 text-sm tracking-tighter">0x{{ sessionId }}</div>
         </div>
      </header>

      <!-- Main Layout -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8 flex-1 min-h-0">
         
         <!-- Left: Primary Selection Core -->
         <div class="xl:col-span-2 flex flex-col gap-8 overflow-y-auto custom-scrollbar pr-2">
            
            <!-- Resume High-Impact Tile -->
            <button (click)="resume.emit()" 
                    [disabled]="!canContinue()"
                    class="relative min-h-[240px] group overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-black p-8 sm:p-10 text-left transition-all hover:border-cyan-500/40 hover:shadow-[0_0_50px_rgba(6,182,212,0.15)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
                
                <!-- Technical Background Decor -->
                <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay"></div>
                <div class="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-cyan-500/8 blur-[100px] rounded-full group-hover:bg-cyan-500/12 transition-colors duration-1000"></div>
                
                <!-- Corner Markers -->
                <div class="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-white/10 group-hover:border-cyan-500/50 transition-colors duration-300"></div>
                <div class="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-white/10 group-hover:border-cyan-500/50 transition-colors duration-300"></div>

                <div class="relative z-10 h-full flex flex-col justify-between">
                   <div class="flex justify-between items-start gap-4">
                      <span class="px-3 py-1.5 rounded-lg bg-cyan-950/40 text-cyan-400 text-[9px] font-black border border-cyan-500/30 tracking-[0.2em] font-mono whitespace-nowrap">
                        {{ canContinue() ? 'SNAPSHOT_DETECTED' : 'EMPTY_BUFFER' }}
                      </span>
                      <span class="material-symbols-outlined text-slate-800 group-hover:text-cyan-500/70 transition-all duration-500 text-7xl sm:text-8xl">history_edu</span>
                   </div>
                   
                   <div>
                      <h2 class="text-3xl sm:text-4xl font-black text-white mb-3 group-hover:text-cyan-100 transition-colors tracking-tight uppercase leading-tight">
                        {{ continueLabel() }}
                      </h2>
                      <div class="flex flex-wrap items-center gap-4 text-[9px] text-slate-500 font-mono tracking-widest">
                         <span class="flex items-center gap-1.5 hover:text-slate-400 transition-colors"><span class="material-symbols-outlined text-xs">database</span> LOCAL_CACHE_01</span>
                         <span class="text-slate-800">|</span>
                         <span class="flex items-center gap-1.5 hover:text-slate-400 transition-colors"><span class="material-symbols-outlined text-xs">schedule</span> {{ timestamp }}</span>
                      </div>
                   </div>
                </div>
            </button>

            <!-- Actions Row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <!-- New Sandbox -->
                <button (click)="newSandbox.emit()" 
                        class="group relative h-40 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 p-8 text-left hover:bg-slate-800/70 transition-all hover:border-emerald-500/50 active:scale-95 backdrop-blur-sm">
                   <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                   <div class="absolute -bottom-1/3 -right-1/3 w-1/2 h-1/2 bg-emerald-500/10 blur-[80px] group-hover:bg-emerald-500/15 transition-colors duration-1000"></div>
                   
                   <div class="flex justify-between items-start h-full flex-col relative z-10">
                       <div class="w-11 h-11 rounded-lg bg-emerald-950/40 border border-emerald-900/60 flex items-center justify-center text-emerald-500 group-hover:text-emerald-300 transition-colors">
                           <span class="material-symbols-outlined text-2xl group-hover:scale-125 transition-transform">add_box</span>
                       </div>
                       <div>
                          <div class="text-xl sm:text-2xl font-black text-slate-100 group-hover:text-white uppercase tracking-wider">Initialize Void</div>
                          <div class="text-[8px] text-slate-500 uppercase tracking-[0.2em] font-bold group-hover:text-emerald-400/70 transition-colors mt-2">NEW_SANDBOX_INSTANCE</div>
                       </div>
                   </div>
                </button>

                <!-- Network Interface (Disabled) -->
                <button disabled class="group relative h-40 overflow-hidden rounded-2xl border border-white/5 bg-slate-950/80 p-8 text-left opacity-50 cursor-not-allowed">
                   <div class="flex justify-between items-start h-full flex-col relative z-10">
                       <div class="w-11 h-11 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-slate-600">
                           <span class="material-symbols-outlined text-2xl">cloud_sync</span>
                       </div>
                       <div>
                          <div class="text-xl sm:text-2xl font-black text-slate-700 uppercase tracking-wider">Cloud Link</div>
                          <div class="text-[8px] text-slate-700 uppercase tracking-[0.2em] font-bold mt-2">DEDICATED_SERVER_OFFLINE</div>
                       </div>
                   </div>
                </button>
            </div>
         </div>

         <!-- Right: Core System Telemetry -->
         <div class="hidden xl:flex col-span-1 bg-slate-950/60 rounded-2xl border border-white/8 p-8 flex-col gap-8 h-fit max-h-full font-mono text-xs backdrop-blur-sm sticky top-8">
            
            <section>
                <div class="text-[9px] uppercase font-black text-slate-600 tracking-[0.25em] mb-5 border-b border-white/8 pb-3">Subsystems</div>
                <div class="space-y-4">
                    <div class="flex justify-between items-center group hover:text-slate-200 transition-colors cursor-default">
                       <span class="text-slate-500">PHYSICS_ENGINE</span>
                       <span class="text-[9px] text-cyan-400 bg-cyan-950/50 px-2.5 py-1 rounded-md border border-cyan-800/40 font-bold">RAPIER_3D</span>
                    </div>
                    <div class="flex justify-between items-center group hover:text-slate-200 transition-colors cursor-default">
                       <span class="text-slate-500">RENDER_MATRIX</span>
                       <span class="text-[9px] text-purple-400 bg-purple-950/50 px-2.5 py-1 rounded-md border border-purple-800/40 font-bold">WEBGL_2.0</span>
                    </div>
                    <div class="flex justify-between items-center group hover:text-slate-200 transition-colors cursor-default">
                       <span class="text-slate-500">THREAD_POOL</span>
                       <span class="text-[9px] text-emerald-400 font-bold flex items-center gap-1.5">
                           <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                           ACTIVE (3)
                       </span>
                    </div>
                </div>
            </section>

            <section>
                <div class="text-[9px] uppercase font-black text-slate-600 tracking-[0.25em] mb-5 border-b border-white/8 pb-3">Metrics</div>
                <div class="space-y-6">
                    <div class="space-y-2.5">
                        <div class="flex justify-between text-[9px] text-slate-400 uppercase font-bold tracking-widest">
                            <span>Entities</span>
                            <span class="text-white font-mono">{{ engine.objectCount() }}</span>
                        </div>
                        <div class="h-1.5 bg-slate-900 rounded-full overflow-hidden p-[1px] border border-white/5">
                            <div class="h-full bg-gradient-to-r from-cyan-500 to-cyan-600 shadow-[0_0_12px_rgba(6,182,212,0.5)] transition-all duration-1000" [style.width.%]="(engine.objectCount() / 2000) * 100"></div>
                        </div>
                    </div>
                    <div class="space-y-2.5">
                        <div class="flex justify-between text-[9px] text-slate-400 uppercase font-bold tracking-widest">
                            <span>VRAM EST.</span>
                            <span class="text-white font-mono">{{ (engine.objectCount() * 0.45).toFixed(1) }} MB</span>
                        </div>
                        <div class="h-1.5 bg-slate-900 rounded-full overflow-hidden p-[1px] border border-white/5">
                            <div class="h-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-[0_0_12px_rgba(59,130,246,0.5)] transition-all duration-1000" [style.width.%]="(engine.objectCount() / 1000) * 100"></div>
                        </div>
                    </div>
                </div>
            </section>

            <div class="mt-auto p-4 bg-black/50 rounded-xl border border-white/8 text-[9px] text-slate-600 leading-relaxed font-mono space-y-1">
                <div><span class="text-cyan-800">></span> <span class="text-slate-400">KERNEL_STABILIZED</span></div>
                <div><span class="text-cyan-800">></span> <span class="text-slate-400">THREAD_COUNT_VALIDATED</span></div>
                <div><span class="text-cyan-800">></span> <span class="text-emerald-700">AWAITING_COMMAND...</span></div>
            </div>
         </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 3px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
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
