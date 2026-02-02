import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilesystemService } from '../../services/ui/filesystem.service';
import { EngineService } from '../../services/engine.service';

@Component({
  selector: 'app-menu-system-tab',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col gap-8 animate-in slide-in-from-right-4 duration-500">
      <header class="flex justify-between items-end border-b border-white/10 pb-4 shrink-0">
        <div>
          <h2 class="text-3xl font-black text-white tracking-[0.2em] uppercase">Kernel Admin</h2>
          <div class="flex items-center gap-2 text-xs mt-2 text-slate-500 font-mono tracking-widest">
              <span class="px-1.5 py-0.5 bg-cyan-950/30 border border-cyan-900/50 rounded text-cyan-500 font-bold">SYSTEM_OPS</span>
              <span>STRUCTURE_MANAGEMENT_V1.1</span>
          </div>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 flex-1 min-h-0">
        <!-- Left Column: Transactions -->
        <section class="flex flex-col gap-6 overflow-hidden">
          <div class="space-y-4">
             <div class="flex items-center gap-3 mb-2 px-2">
                <span class="material-symbols-outlined text-amber-500 text-lg">rebase_edit</span>
                <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Pending Transactions</h3>
             </div>

             <div class="flex-1 overflow-y-auto custom-scrollbar max-h-[35vh] space-y-2 pr-2">
                @for (op of fs.pendingOps(); track op.id) {
                  <div class="p-3 rounded-xl bg-slate-900/50 border border-white/5 flex flex-col gap-2 relative group overflow-hidden">
                    <div class="absolute inset-y-0 left-0 w-1 bg-amber-500 shadow-[0_0_8px_orange]"></div>
                    
                    <div class="flex justify-between items-start">
                      <span class="text-[9px] font-mono text-slate-500">{{ op.id }}</span>
                      <span class="text-[8px] font-black px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">{{ op.action }}</span>
                    </div>

                    <div class="flex flex-col gap-1">
                      <div class="text-[10px] font-bold text-slate-300 truncate font-mono bg-black/30 p-1 rounded border border-white/5">
                        SRC: {{ op.source }}
                      </div>
                      @if (op.destination) {
                        <div class="text-[10px] font-bold text-cyan-400 truncate font-mono bg-cyan-950/20 p-1 rounded border border-cyan-900/30">
                          DST: {{ op.destination }}
                        </div>
                      }
                    </div>
                  </div>
                } @empty {
                  <div class="flex flex-col items-center justify-center py-12 opacity-30 text-slate-500 gap-3 border border-dashed border-white/10 rounded-xl">
                    <span class="material-symbols-outlined text-3xl">task_alt</span>
                    <span class="text-[9px] font-mono uppercase tracking-[0.2em]">All structural paths aligned</span>
                  </div>
                }
             </div>
          </div>

          <div class="space-y-4">
             <div class="flex items-center gap-3 mb-2 px-2">
                <span class="material-symbols-outlined text-slate-600 text-lg">history</span>
                <h3 class="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Operational History</h3>
             </div>
             <div class="flex-1 overflow-y-auto custom-scrollbar max-h-[25vh] space-y-2 pr-2 opacity-60">
                @for (op of fs.historyOps(); track op.id) {
                    <div class="flex items-center justify-between p-2 text-[9px] font-mono border-b border-white/5">
                        <span class="text-slate-400">{{ op.id }}</span>
                        <span class="text-emerald-500 font-bold uppercase">{{ op.status }}</span>
                    </div>
                }
             </div>
          </div>
        </section>

        <!-- Right Column: Tools & MCP -->
        <section class="flex flex-col gap-6">
           <div class="flex items-center gap-3 mb-2 px-2">
            <span class="material-symbols-outlined text-cyan-500 text-lg">hub</span>
            <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Management Interface</h3>
          </div>

          <div class="space-y-6">
             <!-- MCP Info -->
             <div class="p-5 rounded-2xl bg-cyan-950/10 border border-cyan-500/20 backdrop-blur-xl">
                <h4 class="text-xs font-black text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span class="material-symbols-outlined text-sm">bolt</span>
                    MCP Automation
                </h4>
                <p class="text-[10px] text-slate-400 leading-relaxed mb-4">
                   This project is optimized for the <span class="text-white font-bold">@modelcontextprotocol/server-filesystem</span>. 
                   If your AI host supports MCP, the agent can execute these file operations natively using the manifest as a transaction log.
                </p>
                <div class="flex items-center gap-2 text-[8px] font-mono text-cyan-600 bg-cyan-500/5 p-2 rounded border border-cyan-500/10">
                    <span class="material-symbols-outlined text-xs">info</span>
                    HINT: DIRECTORY_ACCESS_REQUIRED [PROJECT_ROOT]
                </div>
             </div>

             <!-- Sync Script -->
             <div class="p-5 rounded-2xl bg-slate-950 border border-white/10 flex flex-col gap-4 shadow-2xl relative overflow-hidden">
                <div class="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                    <span class="material-symbols-outlined text-6xl">javascript</span>
                </div>
                
                <div>
                   <h4 class="text-xs font-black text-slate-200 uppercase tracking-widest mb-1">Atomic Sync Utility</h4>
                   <p class="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Manual Fallback Pipeline</p>
                </div>

                <div class="relative group">
                   <pre class="bg-black/60 rounded-xl p-4 text-[9px] font-mono text-cyan-500 overflow-x-auto max-h-[220px] border border-white/5 custom-scrollbar"><code>{{ fs.generateSyncScript() }}</code></pre>
                   
                   <button (click)="copyToClipboard()"
                           class="absolute top-2 right-2 p-2 rounded-lg bg-slate-800 border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity active:scale-90 hover:bg-slate-700 shadow-xl">
                     <span class="material-symbols-outlined text-sm">{{ copyIcon() }}</span>
                   </button>
                </div>

                <div class="bg-white/5 rounded-lg p-3 text-[9px] font-mono text-slate-500 border border-white/5 leading-relaxed">
                   1. Copy script &bull; 2. Create <span class="text-slate-300">sync-fs.js</span> &bull; 3. Run <span class="text-cyan-600">node sync-fs.js</span>
                </div>
             </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }
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