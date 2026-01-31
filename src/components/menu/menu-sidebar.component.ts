
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type MenuTab = 'home' | 'worlds' | 'settings';

@Component({
  selector: 'app-menu-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="lg:w-72 bg-slate-950/50 border-b lg:border-b-0 lg:border-r border-slate-800 p-4 lg:p-8 flex lg:flex-col justify-between shrink-0 z-20 h-full">
        <!-- Branding -->
        <div class="flex items-center gap-3 lg:block mb-4 lg:mb-12">
            <div class="w-10 h-10 rounded bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-900/20">
                <span class="material-symbols-outlined text-white text-2xl">deployed_code_history</span>
            </div>
            <div>
                <h1 class="text-xl lg:text-2xl font-black text-white tracking-widest">QUALIA<span class="text-cyan-500">3D</span></h1>
                <div class="flex items-center gap-2">
                    <span class="text-[9px] font-mono text-cyan-400/80 tracking-widest uppercase">Phys.Sim.Engine</span>
                </div>
            </div>
        </div>

        <!-- Tabs -->
        <div class="flex lg:flex-col gap-1 lg:gap-2 overflow-x-auto lg:overflow-visible no-scrollbar">
            <button (click)="switchTab.emit('home')" 
                    [class.active-nav]="activeTab() === 'home'"
                    class="nav-btn group">
                <span class="material-symbols-outlined icon transition-transform group-hover:scale-110">home</span>
                <span class="label">Dashboard</span>
                @if (activeTab() === 'home') { <div class="active-indicator"></div> }
            </button>
            
            <button (click)="switchTab.emit('worlds')" 
                    [class.active-nav]="activeTab() === 'worlds'"
                    class="nav-btn group">
                <span class="material-symbols-outlined icon transition-transform group-hover:scale-110">grid_view</span>
                <span class="label">Simulations</span>
                @if (activeTab() === 'worlds') { <div class="active-indicator"></div> }
            </button>

            <button (click)="switchTab.emit('settings')" 
                    [class.active-nav]="activeTab() === 'settings'"
                    class="nav-btn group">
                <span class="material-symbols-outlined icon transition-transform group-hover:scale-110">tune</span>
                <span class="label">Configuration</span>
                @if (activeTab() === 'settings') { <div class="active-indicator"></div> }
            </button>
        </div>

        <!-- Footer (Desktop) -->
        <div class="hidden lg:block mt-auto pt-8 border-t border-slate-800/50">
           <div class="text-[10px] text-slate-600 font-mono flex flex-col gap-1">
              <div class="flex justify-between"><span>CORE</span> <span class="text-slate-500">RAPIER.WASM</span></div>
              <div class="flex justify-between"><span>RENDER</span> <span class="text-slate-500">THREE.R160</span></div>
              <div class="flex justify-between"><span>VER</span> <span class="text-cyan-700">0.5.0-RC</span></div>
           </div>
        </div>
    </nav>
  `,
  styles: [`
    .nav-btn {
        @apply relative flex flex-col lg:flex-row items-center lg:gap-4 p-3 lg:px-5 lg:py-4 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-slate-800/50 transition-all border border-transparent;
    }
    .active-nav {
        @apply text-white bg-slate-800 border-slate-700/50 shadow-lg shadow-black/20;
    }
    .nav-btn .icon {
        @apply text-2xl lg:text-xl mb-1 lg:mb-0;
    }
    .nav-btn .label {
        @apply text-[10px] lg:text-xs font-bold uppercase tracking-widest;
    }
    .active-indicator {
        @apply absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-500 rounded-r shadow-[0_0_10px_cyan] hidden lg:block;
    }
    .no-scrollbar::-webkit-scrollbar { display: none; }
  `]
})
export class MenuSidebarComponent {
  activeTab = input.required<MenuTab>();
  switchTab = output<MenuTab>();
}
