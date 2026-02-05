
import { Component, inject, signal, HostListener, ElementRef, OnInit } from '@angular/core';
import { EngineService } from '../../services/engine.service';
import { KeyboardService, MenuAction } from '../../services/keyboard.service';
import { MenuDropdownComponent } from './menu-dropdown.component';
import { MenuManagerService } from '../../services/ui/menu-manager.service';
import { LayoutService } from '../../services/ui/layout.service';

@Component({
    selector: 'app-menu-bar',
    standalone: true,
    imports: [MenuDropdownComponent],
    template: `
    <nav class="flex items-center gap-1 px-4 h-9 bg-slate-950/95 border-b border-slate-800 select-none z-[100] relative shrink-0 backdrop-blur-md"
         aria-label="System Menu">

      <!-- Decorative Top Signal Line -->
      <div class="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent pointer-events-none"></div>

      <!-- Mobile Menu Trigger -->
      @if (layout.isMobile()) {
        <button class="mr-3 p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-900 rounded transition-all active:scale-90"
                (click)="toggleMobileMenu()"
                aria-label="Navigation Hub">
           <span class="material-symbols-outlined text-[24px]">{{ mobileMenuOpen() ? 'close' : 'menu' }}</span>
        </button>
      }

      <!-- SYSTEM_OPS Branding / Command Launcher -->
      <div class="flex items-center gap-3 mr-8 cursor-pointer group px-2 py-1 rounded hover:bg-white/5 transition-colors"
           (click)="layout.toggleLauncher()"
           title="Open Kernel Hub [Ctrl+K]">
         <div class="w-6 h-6 bg-cyan-950/40 border border-cyan-500/40 rounded flex items-center justify-center group-hover:border-cyan-400 group-hover:shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all"
              [class.bg-cyan-500]="layout.launcherOpen()"
              [class.border-cyan-400]="layout.launcherOpen()">
            <span class="material-symbols-outlined text-cyan-400 text-[16px] transition-colors"
                  [class.text-slate-950]="layout.launcherOpen()">terminal</span>
         </div>
         <div class="flex flex-col">
             <span class="font-black text-slate-200 text-[10px] tracking-[0.25em] font-sans group-hover:text-white transition-colors">SYSTEM<span class="text-cyan-500">_OPS</span></span>
             <span class="text-[7px] font-mono text-slate-600 tracking-widest mt-[-2px] uppercase">RC_CORE_6.1</span>
         </div>
      </div>

      <!-- Desktop Dropdown Array -->
      @if (!layout.isMobile()) {
        <div class="flex gap-0.5 h-full items-center">
            @for (menu of menus; track menu.id) {
              <app-menu-dropdown
                [label]="menu.label"
                [actions]="menu.children!"
                [class.bg-slate-900]="openMenuId() === menu.id"
                [isOpen]="openMenuId() === menu.id"
                (menuOpen)="setOpen(menu.id)"
                (menuClose)="setOpen(null)" />
            }
        </div>
      }

      <div class="flex-grow"></div>

      <!-- Right Side Meta/Telemetry -->
      @if (!layout.isMobile()) {
        <div class="flex items-center gap-5 px-3 border-l border-slate-900 pl-6 h-full opacity-60 hover:opacity-100 transition-opacity">
           <div class="flex items-center gap-2 cursor-help" title="Engine Clock Synchronized">
              <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)] animate-pulse"></div>
              <span class="text-[9px] font-mono text-slate-400 tracking-[0.2em] font-bold">NODE_STABLE</span>
           </div>
           <a href="https://github.com/dimforge/rapier" target="_blank" class="text-[10px] text-slate-600 hover:text-cyan-400 transition-colors font-mono flex items-center gap-1.5">
              RAPIER <span class="text-slate-700 font-bold">V0.12.0</span>
           </a>
        </div>
      }

      <!-- Mobile Hub Overlay -->
      @if (layout.isMobile() && mobileMenuOpen()) {
         <div class="absolute top-full left-0 w-full bg-slate-950 border-b border-slate-800 shadow-2xl overflow-hidden flex flex-col z-[110] animate-in slide-in-from-top-2 duration-300 backdrop-blur-2xl">
            <div class="max-h-[85vh] overflow-y-auto custom-scrollbar">
                @for (menu of menus; track menu.id) {
                   <div class="border-b border-white/5 last:border-0">
                       <div class="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] px-6 py-4 bg-slate-900/40">{{ menu.label }}</div>
                       <div class="flex flex-col">
                           @for (child of menu.children; track child.id) {
                              <button class="text-left px-8 py-4 text-sm font-medium text-slate-300 hover:bg-slate-900 active:bg-cyan-900/30 flex items-center justify-between group transition-colors"
                                      [disabled]="child.isDisabled?.()"
                                      [class.opacity-30]="child.isDisabled?.()"
                                      (click)="executeMobile(child)">
                                 <span class="group-hover:text-cyan-300 tracking-wide">{{ child.label }}</span>
                                 @if(child.icon) { <span class="material-symbols-outlined text-lg opacity-40 group-hover:opacity-100 transition-opacity">{{ child.icon }}</span> }
                              </button>
                           }
                       </div>
                   </div>
                }
            </div>
         </div>

         <div class="fixed inset-0 top-9 z-[105] bg-black/60 backdrop-blur-sm animate-in fade-in" (click)="mobileMenuOpen.set(false)"></div>
      }
    </nav>
  `,
    styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 3px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
  `]
})
export class MenuBarComponent implements OnInit {
    openMenuId = signal<string | null>(null);
    mobileMenuOpen = signal(false);

    engine = inject(EngineService);
    keyboard = inject(KeyboardService);
    menuManager = inject(MenuManagerService);
    layout = inject(LayoutService);
    private el = inject(ElementRef);

    menus: MenuAction[] = [];

    ngOnInit() {
        this.menus = this.menuManager.getMenuConfig();
        this.keyboard.register(this.menus);
    }

    setOpen(id: string | null) {
        this.openMenuId.set(id);
    }

    toggleMobileMenu() {
        this.mobileMenuOpen.update(v => !v);
    }

    executeMobile(action: MenuAction) {
        if (!action.isDisabled?.()) {
            action.execute();
            this.mobileMenuOpen.set(false);
        }
    }

  @HostListener('document:click', ['$event'])
    onClick(event: MouseEvent) {
        if (!this.el.nativeElement.contains(event.target)) {
            this.setOpen(null);
        }
    }
}
