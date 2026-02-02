
import { Component, inject, HostListener, signal, ChangeDetectionStrategy, OnDestroy, AfterViewInit, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EngineService } from '../../services/engine.service';
import { LayoutService } from '../../services/ui/layout.service';
import { MenuManagerService } from '../../services/ui/menu-manager.service';
import { MenuAction } from '../../services/keyboard.service';

@Component({
  selector: 'app-system-launcher',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (layout.launcherOpen()) {
      <div class="fixed inset-0 z-[400] flex pointer-events-none isolate"
           role="dialog" 
           aria-modal="true" 
           aria-labelledby="kernel-title"
           (keydown.escape)="layout.setLauncher(false)">
        
        <!-- Backdrop Blur -->
        <div class="absolute inset-0 bg-slate-950/20 backdrop-blur-md pointer-events-auto animate-in fade-in duration-300"
             (click)="layout.setLauncher(false)"></div>

        <!-- Monolith Panel -->
        <aside #panel 
               class="relative w-80 h-full bg-slate-950/95 border-r border-white/10 shadow-[40px_0_100px_rgba(0,0,0,0.8)] flex flex-col pointer-events-auto animate-in slide-in-from-left duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none"
               tabindex="-1">
          
          <!-- Tech Accent Signal Beam -->
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-transparent shadow-[0_0_15px_cyan]"></div>

          <!-- Header Matrix -->
          <div class="p-10 pb-6 shrink-0">
             <div class="flex items-center gap-4 mb-3">
                <div class="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]">
                   <span class="material-symbols-outlined text-[24px]">terminal</span>
                </div>
                <div class="flex flex-col">
                  <h1 id="kernel-title" class="text-[10px] font-black text-slate-500 tracking-[0.4em] uppercase leading-none mb-1">System Terminal</h1>
                  <h2 class="text-xl font-black text-white tracking-tight uppercase">Kernel Hub</h2>
                </div>
             </div>
             <div class="h-px w-full bg-gradient-to-r from-white/10 to-transparent"></div>
          </div>

          <!-- Command Tree -->
          <div class="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar flex flex-col gap-10" role="menu">
              @for (category of menuConfig; track category.id) {
                  <section role="group" [attr.aria-label]="category.label">
                      <div class="flex items-center gap-3 mb-5 px-4">
                          <div class="w-1.5 h-1.5 rounded-sm bg-cyan-500 shadow-[0_0_6px_cyan]"></div>
                          <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                              {{ category.label }}
                          </h3>
                      </div>
                      
                      <div class="flex flex-col gap-1.5">
                          @for (action of category.children; track action.id) {
                              <button 
                                  role="menuitem"
                                  class="w-full group flex items-center justify-between p-3 rounded-xl border border-transparent transition-all hover:bg-white/5 hover:border-white/10 text-left disabled:opacity-20 disabled:pointer-events-none focus:bg-white/10 focus:outline-none"
                                  [disabled]="action.isDisabled?.()"
                                  [class.hidden]="action.isVisible?.() === false"
                                  (click)="execute(action)">
                                  
                                  <div class="flex items-center gap-4">
                                      <span class="material-symbols-outlined text-[20px] text-slate-600 group-hover:text-cyan-400 transition-colors">
                                          {{ getIcon(action.id) }}
                                      </span>
                                      <span class="text-xs font-bold text-slate-300 group-hover:text-white tracking-wide">{{ action.label }}</span>
                                  </div>

                                  @if (action.shortcut) {
                                      <kbd class="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[8px] font-mono text-slate-600 group-hover:text-cyan-600 group-hover:border-cyan-900/40 transition-colors uppercase font-black">
                                          {{ action.shortcut }}
                                      </kbd>
                                  }
                              </button>
                          }
                      </div>
                  </section>
              }
          </div>

          <!-- Diagnostic Footer -->
          <div class="p-8 bg-black/50 border-t border-white/5 font-mono text-[9px] tracking-widest">
             <div class="grid grid-cols-2 gap-x-4 gap-y-2.5 text-slate-500 font-bold uppercase">
                <span class="flex items-center gap-2"><div class="w-1 h-1 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_4px_emerald]"></div> Uptime</span>
                <span class="text-slate-300 text-right">{{ uptime() }}s</span>
                
                <span>Core.Freq</span>
                <span class="text-cyan-600 text-right">60.0_Hz</span>
                
                <span>Buffer_Heap</span>
                <span class="text-slate-300 text-right">{{ (engine.objectCount() * 0.45).toFixed(1) }} MB</span>
                
                <span>Instance_ID</span>
                <span class="text-slate-500 text-right text-[8px]">QX_{{ sessionId }}</span>
             </div>
          </div>

          <!-- Side Banner Branding -->
          <div class="absolute right-0 top-0 bottom-0 w-10 border-l border-white/5 flex flex-col items-center justify-center pointer-events-none bg-slate-950/20">
              <span class="rotate-90 text-[10px] font-black tracking-[1em] text-slate-800 uppercase whitespace-nowrap opacity-50">
                  INTERFACE_LAYER_V2.5 // RC_6
              </span>
          </div>
        </aside>
      </div>
    }
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 3px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }
  `]
})
export class SystemLauncherComponent implements OnDestroy, AfterViewInit {
  panelRef = viewChild<ElementRef>('panel');
  
  engine = inject(EngineService);
  layout = inject(LayoutService);
  menuManager = inject(MenuManagerService);

  menuConfig: MenuAction[] = [];
  sessionId = Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase();
  uptime = signal(0);
  private intervalId: any;

  constructor() {
      this.menuConfig = this.menuManager.getMenuConfig();
      this.intervalId = setInterval(() => {
          this.uptime.update(v => v + 1);
      }, 1000);
  }

  ngAfterViewInit() {
      if (this.layout.launcherOpen()) {
          this.panelRef()?.nativeElement.focus();
      }
  }

  ngOnDestroy() {
      if (this.intervalId) {
          clearInterval(this.intervalId);
      }
  }

  execute(action: MenuAction) {
      action.execute();
      this.layout.setLauncher(false);
  }

  getIcon(id: string): string {
      switch(id) {
          case 'new': return 'restart_alt';
          case 'qsave': return 'save_as';
          case 'qload': return 'history';
          case 'main-menu': return 'power_settings_new';
          case 'undo': return 'undo';
          case 'redo': return 'redo';
          case 'duplicate': return 'content_copy';
          case 'delete': return 'delete_forever';
          case 'sim-play': return 'play_circle';
          case 'sim-pause': return 'pause_circle';
          case 'sim-grav-moon': return 'brightness_3';
          case 'sim-grav-earth': return 'public';
          case 'sim-grav-zero': return 'vaping_rooms';
          case 'view-ui': return 'layers';
          case 'view-textures': return 'texture';
          case 'view-debug': return 'bug_report';
          case 'camera-focus': return 'center_focus_strong';
          case 'camera-top': return 'grid_view';
          case 'camera-front': return 'view_quilt';
          default: return 'radio_button_checked';
      }
  }
}
