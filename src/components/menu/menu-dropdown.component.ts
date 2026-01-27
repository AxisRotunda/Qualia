
import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { MenuAction } from '../../services/keyboard.service';

@Component({
  selector: 'app-menu-dropdown',
  standalone: true,
  template: `
    <div class="relative group" (mouseenter)="onHover()" (mouseleave)="onLeave()">
      <button 
        class="px-3 py-1 text-sm text-slate-200 hover:bg-slate-800 rounded transition-colors"
        [attr.aria-haspopup]="true"
        [attr.aria-expanded]="isOpen()"
        (click)="toggle()"
        (keydown)="onKeyDown($event)"
        #trigger>
        {{ label }}
      </button>
      
      @if (isOpen()) {
        <div class="absolute top-full left-0 mt-1 min-w-[200px] bg-slate-800 
                    rounded-lg shadow-xl border border-slate-700 py-1 z-50"
             role="menu"
             (keydown)="onMenuKeyDown($event)">
          @for (action of actions; track action.id) {
            @if (action.children) {
              <!-- Submenu Support (MVP: Flat for now or simple nesting if needed, sticking to flat for main menus) -->
            } @else {
              <button
                class="w-full px-4 py-2 text-left text-sm text-slate-200 
                       hover:bg-cyan-900/40 hover:text-cyan-200 focus:bg-cyan-900/40 focus:outline-none
                       disabled:text-slate-500 disabled:cursor-not-allowed
                       flex items-center justify-between group/item"
                [disabled]="action.isDisabled?.()"
                [class.hidden]="action.isVisible?.() === false"
                (click)="execute(action)"
                role="menuitem"
                tabindex="0">
                <span>{{ action.label }}</span>
                @if (action.shortcut) {
                  <kbd class="text-[10px] text-slate-500 font-mono group-hover/item:text-cyan-300">{{ action.shortcut }}</kbd>
                }
              </button>
            }
          }
        </div>
      }
    </div>
  `
})
export class MenuDropdownComponent {
  @Input() label!: string;
  @Input() actions!: MenuAction[];
  @Output() menuOpen = new EventEmitter<void>();
  @Output() menuClose = new EventEmitter<void>();
  
  isOpen = signal(false);
  private focusedIndex = 0;
  
  toggle() {
      this.isOpen.update(v => !v);
      if (this.isOpen()) this.menuOpen.emit();
      else this.menuClose.emit();
  }

  open() {
      if (!this.isOpen()) {
          this.isOpen.set(true);
          this.menuOpen.emit();
      }
  }

  close() {
      this.isOpen.set(false);
      this.menuClose.emit();
  }

  onHover() {
      // Optional: Auto open on hover if another menu is open (Mac style)
      // For now, simpler click-to-open
  }

  onLeave() {
      // Optional: Auto close logic could go here
  }
  
  execute(action: MenuAction) {
      if (!action.isDisabled?.()) {
          action.execute();
          this.close();
      }
  }

  onKeyDown(event: KeyboardEvent) {
    switch(event.key) {
      case 'Enter':
      case ' ':
      case 'ArrowDown':
        event.preventDefault();
        this.open();
        // logic to focus first item would go here using ViewChildren
        break;
      case 'Escape':
        this.close();
        break;
    }
  }
  
  onMenuKeyDown(event: KeyboardEvent) {
    // Basic navigation implementation
    if (event.key === 'Escape') {
        this.close();
    }
  }
}
