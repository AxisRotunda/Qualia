
import { Component, inject, signal, HostListener, ElementRef, OnInit } from '@angular/core';
import { EngineService } from '../../services/engine.service';
import { KeyboardService, MenuAction } from '../../services/keyboard.service';
import { MenuDropdownComponent } from './menu-dropdown.component';
import { createMenuConfig } from '../../config/menu.config';

@Component({
  selector: 'app-menu-bar',
  standalone: true,
  imports: [MenuDropdownComponent],
  template: `
    <nav class="flex items-center gap-1 px-3 h-8 bg-slate-950/95 border-b border-slate-800 select-none z-50 relative shrink-0 backdrop-blur-md"
         aria-label="Main Menu">
         
      <!-- Decorative Top Line -->
      <div class="absolute top-0 left-0 w-full h-[1px] bg-white/5 pointer-events-none"></div>

      <!-- Mobile Menu Trigger -->
      <button class="md:hidden mr-2 p-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-sm transition-colors" 
              (click)="toggleMobileMenu()"
              aria-label="Toggle Menu">
         <span class="material-symbols-outlined text-[20px]">{{ mobileMenuOpen() ? 'close' : 'menu' }}</span>
      </button>

      <!-- Branding -->
      <div class="flex items-center gap-2 mr-6 cursor-pointer group" (click)="engine.mainMenuVisible.set(true)">
         <div class="w-5 h-5 bg-cyan-950/30 border border-cyan-500/30 rounded-sm flex items-center justify-center group-hover:border-cyan-400 transition-colors shadow-sm">
            <span class="material-symbols-outlined text-cyan-500 text-[14px] drop-shadow-[0_0_3px_rgba(6,182,212,0.5)]">deployed_code_history</span>
         </div>
         <span class="font-bold text-slate-200 text-[10px] tracking-[0.2em] font-mono group-hover:text-white transition-colors">QUALIA<span class="text-cyan-500">3D</span></span>
      </div>

      <!-- Desktop Menus -->
      <div class="hidden md:flex gap-0.5">
          @for (menu of menus; track menu.id) {
            <app-menu-dropdown 
              [label]="menu.label"
              [actions]="menu.children!"
              [class.bg-slate-800]="openMenuId() === menu.id"
              [isOpen]="openMenuId() === menu.id"
              (menuOpen)="setOpen(menu.id)"
              (menuClose)="setOpen(null)" />
          }
      </div>
      
      <div class="flex-grow"></div>
      
      <!-- Right Side Meta -->
      <div class="hidden md:flex items-center gap-4 px-2 border-l border-slate-800 pl-4 h-full">
         <div class="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity cursor-help" title="System Online">
            <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)] animate-pulse"></div>
            <span class="text-[9px] font-mono text-slate-400 tracking-widest">NET.OK</span>
         </div>
         <a href="https://github.com/dimforge/rapier" target="_blank" class="text-[10px] text-slate-500 hover:text-cyan-400 transition-colors font-mono flex items-center gap-1">
            RAPIER <span class="text-slate-600">v0.12</span>
         </a>
      </div>

      <!-- Mobile Menu Dropdown Overlay -->
      @if (mobileMenuOpen()) {
         <div class="absolute top-full left-0 w-64 bg-slate-950 border-r border-b border-slate-800 shadow-2xl overflow-hidden flex flex-col z-50 animate-in slide-in-from-top-2 duration-150 backdrop-blur-xl">
            <div class="max-h-[80vh] overflow-y-auto custom-scrollbar">
                @for (menu of menus; track menu.id) {
                   <div class="border-b border-slate-900 last:border-0 pb-1">
                       <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-4 py-2 bg-slate-900/50">{{ menu.label }}</div>
                       <div class="flex flex-col">
                           @for (child of menu.children; track child.id) {
                              <button class="text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 active:bg-cyan-900/30 flex items-center justify-between group transition-colors"
                                      [disabled]="child.isDisabled?.()"
                                      [class.opacity-50]="child.isDisabled?.()"
                                      (click)="executeMobile(child)">
                                 <span class="group-hover:text-cyan-200">{{ child.label }}</span>
                                 @if(child.icon) { <span class="material-symbols-outlined text-sm opacity-50">{{ child.icon }}</span> }
                              </button>
                           }
                       </div>
                   </div>
                }
            </div>
         </div>
         
         <div class="fixed inset-0 top-[32px] z-40 bg-black/50 backdrop-blur-sm md:hidden" (click)="mobileMenuOpen.set(false)"></div>
      }
    </nav>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
  `]
})
export class MenuBarComponent implements OnInit {
  openMenuId = signal<string | null>(null);
  mobileMenuOpen = signal(false);
  
  engine = inject(EngineService);
  keyboard = inject(KeyboardService);
  private el = inject(ElementRef);

  menus: MenuAction[] = [];

  ngOnInit() {
      this.menus = createMenuConfig(this.engine);
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
