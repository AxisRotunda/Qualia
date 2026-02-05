import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilesystemService } from '../../services/ui/filesystem.service';
import { EngineService } from '../../services/engine.service';

@Component({
  selector: 'app-menu-system-tab',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col gap-10 animate-in slide-in-from-right-4 duration-500">
      <header class="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-white/8 pb-6 shrink-0 gap-3">
        <div>
          <h2 class="text-4xl sm:text-5xl font-black text-white tracking-[0.15em] uppercase leading-tight">Kernel Admin</h2>
          <div class="flex items-center gap-2 text-[9px] mt-3 text-slate-500 font-mono tracking-widest font-bold">
              <span class="px-2.5 py-1 bg-cyan-950/40 border border-cyan-900/50 rounded-lg text-cyan-500">SYSTEM_OPS</span>
              <span>STRUCTURE_MANAGEMENT_V1.1</span>
          </div>
        </div>
      </header>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-12 flex-1 min-h-0">
        <!-- Left Column: Transactions -->
        <section class="flex flex-col gap-8 overflow-hidden">
          <div class="space-y-4">
             <div class="flex items-center gap-3 mb-4 px-2">
                <span class="material-symbols-outlined text-amber-500 text-xl">rebase_edit</span>
                <h3 class="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Pending Transactions</h3>
             </div>

             <div class="flex-1 overflow-y-auto custom-scrollbar max-h-[35vh] space-y-3 pr-3">
                @for (op of fs.pendingOps(); track op.id) {
                  <div class="p-4 rounded-xl bg-slate-900/40 border border-white/8 flex flex-col gap-3 relative group overflow-hidden hover:border-amber-500/20 hover:bg-slate-900/60 transition-all">
                    <div class="absolute inset-y-0 left-0 w-1 bg-amber-500 shadow-[0_0_12px_rgba(217,119,6,0.5)] group-hover:shadow-[0_0_16px_rgba(217,119,6,0.8)] transition-shadow"></div>
                    
                    <div class="flex justify-between items-start gap-2">
                      <span class="text-[8px] font-mono text-slate-500 tracking-tighter">{{ op.id }}</span>
                      <span class="text-[8px] font-black px-2 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase font-bold">{{ op.action }}</span>
                    </div>

                    <div class="flex flex-col gap-2">
                      <div class="text-[9px] font-bold text-slate-300 truncate font-mono bg-black/40 p-2 rounded-lg border border-white/5">
                        SRC: {{ op.source }}
                      </div>
                      @if (op.destination) {
                        <div class="text-[9px] font-bold text-cyan-400 truncate font-mono bg-cyan-950/20 p-2 rounded-lg border border-cyan-900/30">
                          DST: {{ op.destination }}
                        </div>
                      }
                    </div>
                  </div>
                } @empty {
                  <div class="flex flex-col items-center justify-center py-16 opacity-40 text-slate-500 gap-3 border border-dashed border-white/10 rounded-2xl">
                    <span class="material-symbols-outlined text-5xl opacity-60">task_alt</span>
                    <span class="text-[9px] font-mono uppercase tracking-[0.2em] font-bold">All structural paths aligned</span>
                  </div>
                }
             </div>
          </div>

          <div class="space-y-4">
             <div class="flex items-center gap-3 mb-4 px-2">
                <span class="material-symbols-outlined text-slate-600 text-xl">history</span>
                <h3 class="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Operational History</h3>
             </div>
             <div class="flex-1 overflow-y-auto custom-scrollbar max-h-[28vh] space-y-1 pr-3 opacity-70">
                @for (op of fs.historyOps(); track op.id) {
                    <div class="flex items-center justify-between p-3 text-[9px] font-mono border-b border-white/5 hover:bg-white/5 rounded transition-colors">
                        <span class="text-slate-400 font-bold">{{ op.id }}</span>
                        <span class="text-emerald-500 font-bold uppercase tracking-widest">{{ op.status }}</span>
                    </div>
                }
             </div>
          </div>
        </section>

        <!-- Right Column: Tools & MCP -->
        <section class="flex flex-col gap-8">
           <div class="flex items-center gap-3 mb-2 px-2">
            <span class="material-symbols-outlined text-cyan-500 text-xl">hub</span>
            <h3 class="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Management Interface</h3>
          </div>

          <div class="space-y-6">
             <!-- MCP Info -->
             <div class="p-6 rounded-2xl bg-cyan-950/15 border border-cyan-500/30 backdrop-blur-lg hover:border-cyan-500/50 hover:bg-cyan-950/25 transition-all">
                <h4 class="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-sm">bolt</span>
                    MCP Automation
                </h4>
                <p class="text-[10px] text-slate-400 leading-relaxed mb-4 font-medium">
                   This project is optimized for the <span class="text-white font-bold">@modelcontextprotocol/server-filesystem</span>. 
                   If your AI host supports MCP, the agent can execute these file operations natively using the manifest as a transaction log.
                </p>
                <div class="flex items-center gap-2 text-[9px] font-mono text-cyan-600 bg-cyan-500/8 p-3 rounded-lg border border-cyan-500/20">
                    <span class="material-symbols-outlined text-sm">info</span>
                    <span class="font-bold">DIRECTORY_ACCESS_REQUIRED [PROJECT_ROOT]</span>
                </div>
             </div>

             <!-- Sync Script -->
             <div class="p-6 rounded-2xl bg-slate-950/70 border border-white/10 flex flex-col gap-4 shadow-[0_20px_40px_rgba(0,0,0,0.3)] relative overflow-hidden hover:border-white/20 transition-all">
                <div class="absolute top-0 right-0 p-2 opacity-8 pointer-events-none">
                    <span class="material-symbols-outlined text-8xl">javascript</span>
                </div>
                
                <div>
                   <h4 class="text-[10px] font-black text-slate-200 uppercase tracking-widest mb-1 font-bold">Atomic Sync Utility</h4>
                   <p class="text-[9px] text-slate-500 uppercase font-bold tracking-tight">Manual Fallback Pipeline</p>
                </div>

                <div class="relative group">
                   <pre class="bg-black/70 rounded-xl p-5 text-[8px] font-mono text-cyan-500 overflow-x-auto max-h-[260px] border border-white/8 custom-scrollbar leading-relaxed tracking-[0.05em]"><code>{{ fs.generateSyncScript() }}</code></pre>
                   
                   <button (click)="copyToClipboard()"
                           class="absolute top-3 right-3 p-2.5 rounded-lg bg-slate-800/80 border border-white/15 text-white opacity-0 group-hover:opacity-100 transition-opacity active:scale-90 hover:bg-slate-700 shadow-xl backdrop-blur-sm">
                     <span class="material-symbols-outlined text-lg">{{ copyIcon() }}</span>
                   </button>
                </div>

                <div class="bg-white/8 rounded-lg p-3 text-[9px] font-mono text-slate-400 border border-white/8 leading-relaxed font-bold">
                   <span class="text-slate-300">1. Copy script</span> • <span class="text-slate-300">2. Create sync-fs.js</span> • <span class="text-slate-300">3. Run node sync-fs.js</span>
                </div>
             </div>
          </div>
        </section>
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
export class SystemTabComponent {
  fs = inject(FilesystemService);
  copyIcon = signal('content_copy');

  copyToClipboard() {
    const text = this.fs.generateSyncScript();
    navigator.clipboard.writeText(text).then(() => {
      this.copyIcon.set('check');
      setTimeout(() => this.copyIcon.set('content_copy'), 2000);
    });
  }
}