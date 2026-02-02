
import { Injectable, DestroyRef, inject } from '@angular/core';
import { fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NullShield } from '../engine/utils/string.utils';

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
    if (!shortcuts || !Array.isArray(shortcuts)) return;
    
    shortcuts.forEach(action => {
      if (!action) return;

      if (action.shortcut) {
        // RUN_REPAIR: Shield input before normalization
        const normalized = this.normalizeShortcut(action.shortcut);
        if (normalized) {
          this.shortcuts.set(normalized, action);
        }
      }
      
      if (action.children && Array.isArray(action.children)) {
        this.register(action.children);
      }
    });
  }
  
  private onKeyDown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    if (!target) return;

    const isInput = target.tagName === 'INPUT' || 
                    target.tagName === 'TEXTAREA' || 
                    target.isContentEditable;
                    
    if (isInput) return;

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
    
    const key = NullShield.safeKey(event.key);
    if (key.length === 1) {
        parts.push(key.toUpperCase());
    } else {
        // Multi-char keys like "Enter", "Space", "Delete"
        parts.push(key);
    }
    
    return parts.join('+');
  }

  private normalizeShortcut(shortcut: unknown): string {
      const raw = NullShield.trim(shortcut);
      if (!raw) return '';
      
      return raw
          .split('+')
          .map(part => {
              const str = NullShield.trim(part);
              if (!str) return '';

              const low = NullShield.sanitize(str); // Use safe lowercase
              if (low === 'spacebar' || low === ' ' || low === 'space') return 'Space';
              if (low === 'ctrl' || low === 'control') return 'Ctrl';
              if (low === 'shift') return 'Shift';
              if (low === 'alt') return 'Alt';
              if (low === 'del' || low === 'delete') return 'Delete';
              
              return str.length === 1 ? str.toUpperCase() : str;
          })
          .filter(part => part.length > 0)
          .join('+');
  }
}
