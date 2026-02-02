
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type MenuTab = 'home' | 'worlds' | 'settings';

@Component({
  selector: 'app-menu-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="lg:w-72 bg-slate-950/80 border-b lg:border-b-0 lg:border-r border-slate-800 p-4 lg:p-6 flex lg:flex-col justify-between shrink-0 z-20 h-full backdrop-blur-md">
        <!-- Branding -->
        <div class="flex items-center gap-3 lg:block mb-4 lg:mb-10 group cursor-default">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-white/10 group-hover:border-cyan-400/50 transition-colors">
                <span class="material-symbols-outlined text-white text-2xl">deployed_code_history</span>
            </div>
            <div class="mt-2 hidden lg:block">
                <h1 class="text-2xl font-black text-white tracking-[0.2em] leading-none">QUALIA<span class="text-cyan-500">3D</span></h1>
                <div class="flex items-center gap-2 mt-1">
                    <span class="text-[9px] font-mono text-cyan-400/60 tracking-widest uppercase">Phys.Sim.Engine</span>
                </div>
            </div>
            <!-- Mobile Brand Text -->
            <div class="lg:hidden">
                 <h1 class="text-lg font-black text-white tracking-widest">QUALIA<span class="text-cyan-500">3D</span></h1>
            </div>
        </div>

        <!-- Tabs -->
        <div class="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible no-scrollbar flex-1">
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
        </div>

        <!-- Footer (Desktop) -->
        <div class="hidden lg:block mt-auto pt-6 border-t border-white/5">
           <div class="text-[10px] text-slate-500 font-mono flex flex-col gap-1.5 opacity-80">
              <div class="flex justify-between"><span>CORE</span> <span class="text-slate-400 font-bold">RAPIER_0.12</span></div>
              <div class="flex justify-between"><span>RENDER</span> <span class="text-slate-400 font-bold">THREE_R160</span></div>
              <div class="flex justify-between"><span>BUILD</span> <span class="text-cyan-600 font-bold">RC_0.5.0</span></div>
           </div>
        </div>
    </nav>
  `,
  styles: [`
    .nav-btn {
        @apply relative flex flex-col lg:flex-row items-center lg:gap-4 p-3 lg:px-4 lg:py-3.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all border border-transparent w-full;
    }
    /* Active State: Glow Left Border + Background */
    .active-nav {
        @apply text-cyan-400 bg-slate-900 border-white/5 shadow-inner;
    }
    /* Left Glow Strip for Active */
    .active-nav::before {
        content: '';
        @apply absolute left-0 top-2 bottom-2 w-1 bg-cyan-500 rounded-r shadow-[0_0_8px_cyan];
    }
    
    .nav-btn .icon {
        @apply text-2xl lg:text-xl mb-1 lg:mb-0 transition-transform group-hover:scale-110 duration-200;
    }
    .nav-btn .label {
        @apply text-[10px] lg:text-xs font-bold uppercase tracking-widest lg:flex-1 text-left;
    }
    .no-scrollbar::-webkit-scrollbar { display: none; }
  `]
})
export class MenuSidebarComponent {
  activeTab = input.required<MenuTab>();
  switchTab = output<MenuTab>();
}
