
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EngineService } from '../../services/engine.service';

@Component({
    selector: 'app-loading-screen',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="fixed inset-0 z-[200] flex flex-col items-center justify-center font-mono select-none cursor-wait overflow-hidden transition-colors duration-700"
         [class.bg-slate-950]="!isPanic()"
         [class.bg-rose-950]="isPanic()">

        <!-- Background Tech Layer -->
        <div class="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] bg-repeat opacity-20 pointer-events-none"></div>
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#020617_95%)] pointer-events-none"></div>

        <!-- Panic Glitch Overlay -->
        @if (isPanic()) {
            <div class="absolute inset-0 bg-rose-500/5 animate-pulse pointer-events-none"></div>
            <div class="absolute top-0 left-0 w-full h-1 bg-white/20 animate-[glitch_0.2s_infinite]"></div>
        }

        <!-- Decorative Border -->
        <div class="absolute top-4 left-4 right-4 bottom-4 border pointer-events-none transition-colors duration-500"
             [class.border-white_5]="!isPanic()"
             [class.border-rose-500_30]="isPanic()"></div>

        <div class="relative w-[32rem] flex flex-col gap-1 z-10">
            <!-- Animated Logo -->
            <div class="flex items-center justify-center gap-4 mb-10">
                <div class="w-12 h-12 rounded border-2 flex items-center justify-center relative transition-colors duration-500"
                     [class.border-cyan-500_20]="!isPanic()"
                     [class.border-rose-500]="isPanic()">
                    <div class="absolute inset-1 border animate-pulse"
                         [class.border-cyan-500_40]="!isPanic()"
                         [class.border-white_50]="isPanic()"></div>
                    <span class="material-symbols-outlined text-3xl transition-colors duration-500"
                          [class.text-cyan-400]="!isPanic()"
                          [class.text-white]="isPanic()">
                        {{ isPanic() ? 'report' : 'deployed_code' }}
                    </span>
                </div>
                <h1 class="text-3xl font-black tracking-[0.4em] text-slate-100 uppercase">
                    QUALIA<span [class.text-cyan-500]="!isPanic()" [class.text-rose-500]="isPanic()">3D</span>
                </h1>
            </div>

            <!-- Phased Stage Header -->
            <div class="flex justify-between items-end mb-1">
                <span class="text-[10px] font-black tracking-[0.3em] uppercase transition-colors"
                      [class.text-cyan-700]="!isPanic()"
                      [class.text-rose-400]="isPanic()">
                    {{ isPanic() ? 'CRITICAL_HALT' : 'Phase Execution' }}
                </span>
                <span class="text-[10px] text-slate-500 tabular-nums">CORE_ID: 0x{{ sessionId }}</span>
            </div>

            <div class="text-xl font-bold text-white mb-6 border-b pb-2 flex justify-between items-center transition-colors"
                 [class.border-white_10]="!isPanic()"
                 [class.border-rose-500]="isPanic()">
                <span [class.text-rose-200]="isPanic()">{{ engine.state.loadingStage() }}</span>
                <span class="animate-pulse" [class.text-cyan-500]="!isPanic()" [class.text-white]="isPanic()">_</span>
            </div>

            @if (isPanic()) {
                <!-- Diagnostic Dump -->
                <div class="bg-black/60 p-4 rounded border border-rose-500/50 mb-6 font-mono text-[11px] leading-relaxed animate-in zoom-in-95 duration-200">
                    <div class="text-rose-500 font-black mb-2">>> FATAL EXCEPTION DETECTED</div>
                    <div class="text-rose-300 break-words font-bold uppercase">{{ engine.state.loadError() }}</div>
                    <div class="mt-4 pt-2 border-t border-rose-900/50 text-slate-500 text-[9px]">
                        STREAMS: RESET | MEMORY: FLUSHED | RECOVERY: ACTIVE<br>
                        INITIATING FALLBACK TO SAFE_ZONE...
                    </div>
                </div>
            } @else {
                <!-- Sub-Detail (Real granular updates) -->
                <div class="text-[11px] text-cyan-400/80 mb-4 h-4 overflow-hidden truncate font-mono">
                    > {{ engine.state.loadingDetail() || 'Awaiting task queue...' }}
                </div>
            }

            <!-- Terminal Telemetry Grid -->
            <div class="grid grid-cols-2 gap-2 mb-8 p-3 bg-white/5 border border-white/5 rounded-lg text-[9px] text-slate-400 font-mono">
                <div class="flex justify-between border-r border-white/5 pr-3">
                    <span>ENTITIES</span>
                    <span class="text-white">{{ tel().entityCount }}</span>
                </div>
                <div class="flex justify-between pl-1">
                    <span>ELAPSED</span>
                    <span class="text-white">{{ (tel().elapsedTime / 1000).toFixed(2) }}s</span>
                </div>
                <div class="flex justify-between border-r border-white/5 pr-3">
                    <span>ASSETS</span>
                    <span class="text-white">{{ tel().completedAssets }} / {{ tel().totalAssets }}</span>
                </div>
                <div class="flex justify-between pl-1">
                    <span>MEMORY</span>
                    <span class="text-white">{{ (tel().entityCount * 0.45 + tel().completedAssets * 1.2).toFixed(1) }}MB</span>
                </div>
            </div>

            <!-- Industrial Progress Bar -->
            <div class="space-y-1.5">
                <div class="flex justify-between text-[10px] font-bold">
                    <span class="text-slate-500 uppercase tracking-widest">Saturation</span>
                    <span [class.text-cyan-500]="!isPanic()" [class.text-rose-500]="isPanic()" class="tabular-nums">
                        {{ engine.state.loadingProgress() | number:'1.0-0' }}%
                    </span>
                </div>
                <div class="w-full h-2 bg-slate-900 rounded-sm overflow-hidden relative border border-white/5 p-0.5">
                    <div class="h-full transition-all duration-300 ease-out relative"
                         [class.bg-gradient-to-r]="!isPanic()"
                         [class.from-cyan-600]="!isPanic()"
                         [class.to-cyan-400]="!isPanic()"
                         [class.bg-rose-600]="isPanic()"
                         [style.width.%]="engine.state.loadingProgress()">
                        <div class="absolute inset-0 bg-white/20 animate-[shimmer_1.5s_infinite] skew-x-[-20deg] w-8"></div>
                    </div>
                </div>
            </div>

            <!-- Bottom Legal/Version -->
            <div class="mt-12 flex justify-between items-center opacity-30 text-[8px] tracking-widest text-slate-500 uppercase">
                <span>Kernel v6.1 // {{ isPanic() ? 'UNSTABLE' : 'STABILIZED' }}</span>
                <span>(c) 2025 Qualia_Systems</span>
            </div>
        </div>
    </div>
  `,
    styles: [`
    @keyframes shimmer { 0% { left: -100%; } 100% { left: 200%; } }
    @keyframes glitch { 0% { transform: translateX(0); } 50% { transform: translateX(-5px); } 100% { transform: translateX(5px); } }
    .border-white_5 { border-color: rgba(255, 255, 255, 0.05); }
    .border-white_10 { border-color: rgba(255, 255, 255, 0.1); }
    .border-rose-500_30 { border-color: rgba(244, 63, 94, 0.3); }
  `]
})
export class LoadingScreenComponent {
    engine = inject(EngineService);
    tel = this.engine.state.loadingTelemetry;
    isPanic = this.engine.state.isCriticalFailure;
    sessionId = Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase();
}
