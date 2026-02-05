import { Component, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilesystemService } from '../../services/ui/filesystem.service';

export type MenuTab = 'home' | 'worlds' | 'settings' | 'system';

@Component({
  selector: 'app-menu-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="sm:w-80 bg-slate-950/80 border-b sm:border-b-0 sm:border-r border-slate-800/60 px-4 py-6 sm:p-8 flex sm:flex-col justify-between sm:justify-start shrink-0 z-20 h-auto sm:h-full backdrop-blur-lg">
        <!-- Branding -->
        <div class="flex items-center gap-3 sm:flex-col sm:items-start mb-0 sm:mb-12 group cursor-default">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-white/10 group-hover:border-cyan-400/60 group-hover:shadow-cyan-500/40 transition-all duration-300">
                <span class="material-symbols-outlined text-white text-3xl font-bold">deployed_code_history</span>
            </div>
            <div class="hidden sm:block">
                <h1 class="text-2xl font-black text-white tracking-[0.15em] leading-tight">QUALIA<span class="text-cyan-500">3D</span></h1>
                <div class="flex items-center gap-2 mt-2">
                    <span class="text-[8px] font-mono text-cyan-400/70 tracking-widest uppercase font-bold">Phys.Sim.Engine</span>
                </div>
            </div>
            <!-- Mobile Brand Text -->
            <div class="sm:hidden">
                 <h1 class="text-lg font-black text-white tracking-wider">Q3D</h1>
            </div>
        </div>

        <!-- Tabs -->
        <div class="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-visible no-scrollbar flex-1 sm:flex-grow min-w-0">
            <button (click)="switchTab.emit('home')" 
                    [class.active-nav]="activeTab() === 'home'"
                    class="nav-btn group">
                <span class="material-symbols-outlined icon">home</span>
                <span class="label">Dashboard</span>
            </button>
            
            <button (click)="switchTab.emit('worlds')" 
                    [class.active-nav]="activeTab() === 'worlds'"
                    class="nav-btn group">
                <span class="material-symbols-outlined icon">grid_view</span>
                <span class="label">Simulations</span>
            </button>

            <button (click)="switchTab.emit('settings')" 
                    [class.active-nav]="activeTab() === 'settings'"
                    class="nav-btn group">
                <span class="material-symbols-outlined icon">tune</span>
                <span class="label">Configuration</span>
            </button>

            <div class="h-px w-full bg-white/5 my-3 hidden sm:block"></div>

            <button (click)="switchTab.emit('system')" 
                    [class.active-nav]="activeTab() === 'system'"
                    class="nav-btn group relative">
                <span class="material-symbols-outlined icon">settings_system_daydream</span>
                <span class="label">System Ops</span>
                
                @if (fs.hasPending()) {
                  <div class="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_12px_orange] animate-pulse sm:relative sm:top-0 sm:right-0 ml-auto"></div>
                }
            </button>
        </div>

        <!-- Footer (Desktop) -->
        <div class="hidden sm:block mt-auto pt-8 border-t border-white/5">
           <div class="text-[9px] text-slate-500 font-mono space-y-2.5 opacity-85">
              <div class="flex justify-between items-center group hover:text-slate-300 transition-colors"><span>CORE</span> <span class="text-slate-300 font-bold text-[8px] tracking-wider">RAPIER_0.12</span></div>
              <div class="flex justify-between items-center group hover:text-slate-300 transition-colors"><span>RENDER</span> <span class="text-slate-300 font-bold text-[8px] tracking-wider">THREE_R160</span></div>
              <div class="flex justify-between items-center group hover:text-slate-300 transition-colors"><span>BUILD</span> <span class="text-cyan-600 font-bold text-[8px] tracking-wider">RC_0.5.0</span></div>
           </div>
        </div>
    </nav>
  `,
  styles: [`
    .nav-btn {
        @apply relative flex flex-col sm:flex-row items-center sm:gap-3.5 px-3 py-3 sm:px-4 sm:py-3.5 rounded-lg text-slate-500 hover:text-slate-100 transition-all border border-transparent w-full whitespace-nowrap;
        @apply sm:hover:bg-slate-800/60 sm:active:bg-slate-700/60 duration-200;
    }
    .active-nav {
        @apply text-cyan-300 bg-slate-800/50 border-cyan-500/40 shadow-inner;
    }
    .active-nav::before {
        content: '';
        @apply absolute left-0 top-2 bottom-2 w-0.5 bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-r shadow-[0_0_16px_cyan] sm:shadow-[0_0_12px_cyan];
    }
    .nav-btn .icon {
        @apply text-2xl sm:text-lg transition-all duration-300 group-hover:scale-125 sm:group-hover:scale-110;
    }
    .nav-btn .label {
        @apply text-[10px] sm:text-xs font-bold uppercase tracking-widest sm:flex-1 sm:text-left transition-colors duration-200;
    }
    .no-scrollbar::-webkit-scrollbar { display: none; }
  `]
})
export class MenuSidebarComponent {
  activeTab = input.required<MenuTab>();
  switchTab = output<MenuTab>();

  fs = inject(FilesystemService);
}