
import { Injectable, DestroyRef, inject } from '@angular/core';
import { fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface MenuAction {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  isDisabled?: () => boolean;
  isVisible?: () => boolean;
  execute: () => void | Promise<void>;
  children?: MenuAction[];
}

@Injectable({ providedIn: 'root' })
export class KeyboardService {
  private shortcuts = new Map<string, MenuAction>();
  private destroyRef = inject(DestroyRef);
  
  constructor() {
    fromEvent<KeyboardEvent>(window, 'keydown')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => this.onKeyDown(event));
  }
  
  register(shortcuts: MenuAction[]) {
    shortcuts.forEach(action => {
      if (action.shortcut) {
        this.shortcuts.set(this.normalizeShortcut(action.shortcut), action);
      }
      if (action.children) {
        this.register(action.children);
      }
    });
  }
  
  private onKeyDown(event: KeyboardEvent) {
    // Ignore input fields
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
    }

    const key = this.getKeyCombo(event);
    const action = this.shortcuts.get(key);
    
    if (action && !action.isDisabled?.()) {
      event.preventDefault();
      action.execute();
    }
  }
  
  private getKeyCombo(event: KeyboardEvent): string {
    const parts: string[] = [];
    if (event.ctrlKey) parts.push('Ctrl');
    if (event.shiftKey) parts.push('Shift');
    if (event.altKey) parts.push('Alt');
    
    let key = event.key;
    if (key === ' ') key = 'Space';
    if (key.length === 1) key = key.toUpperCase();
    
    parts.push(key);
    return parts.join('+');
  }

  private normalizeShortcut(shortcut: string): string {
      return shortcut.replace('Space', ' ').split('+').map(p => p.trim()).join('+');
  }
}
