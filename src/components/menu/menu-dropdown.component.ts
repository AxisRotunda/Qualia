
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MenuAction } from '../../services/keyboard.service';

@Component({
  selector: 'app-menu-dropdown',
  standalone: true,
  host: {
    'class': 'relative group block'
  },
  template: `
    <button 
      class="px-3 py-1 text-sm text-slate-200 hover:bg-slate-800 rounded transition-colors"
      [class.bg-slate-800]="isOpen"
      [attr.aria-haspopup]="true"
      [attr.aria-expanded]="isOpen"
      (click)="toggle($event)"
      (mouseenter)="onHover()"
      (keydown)="onKeyDown($event)">
      {{ label }}
    </button>
    
    @if (isOpen) {
      <div class="absolute top-full left-0 mt-1 min-w-[200px] bg-slate-800 
                  rounded-lg shadow-xl border border-slate-700 py-1 z-50 animate-in fade-in zoom-in-95 duration-75"
           role="menu">
        @for (action of actions; track action.id) {
          <button
            class="w-full px-4 py-2 text-left text-sm text-slate-200 
                   hover:bg-cyan-900/40 hover:text-cyan-200 focus:bg-cyan-900/40 focus:outline-none
                   disabled:text-slate-500 disabled:cursor-not-allowed
                   flex items-center justify-between group/item"
            [disabled]="action.isDisabled?.()"
            [class.hidden]="action.isVisible?.() === false"
            (click)="execute(action)"
            role="menuitem">
            <span>{{ action.label }}</span>
            @if (action.shortcut) {
              <kbd class="text-[10px] text-slate-500 font-mono group-hover/item:text-cyan-300">{{ action.shortcut }}</kbd>
            }
          </button>
        }
      </div>
    }
  `
})
export class MenuDropdownComponent {
  @Input() label!: string;
  @Input() actions!: MenuAction[];
  @Input() isOpen = false;
  
  @Output() menuOpen = new EventEmitter<void>();
  @Output() menuClose = new EventEmitter<void>();
  
  toggle(e: Event) {
      e.stopPropagation();
      if (this.isOpen) this.menuClose.emit();
      else this.menuOpen.emit();
  }

  onHover() {
  }
  
  execute(action: MenuAction) {
      if (!action.isDisabled?.()) {
          action.execute();
          this.menuClose.emit();
      }
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault();
        this.menuOpen.emit();
    }
  }
}
