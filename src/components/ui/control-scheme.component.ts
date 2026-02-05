import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputMapperService } from '../../engine/input/input-mapper.service';
import { InputAction, INPUT_CATEGORIES, INPUT_DESCRIPTIONS } from '../../engine/input/input-actions';
import { LayoutService } from '../../services/ui/layout.service';

/**
 * ControlSchemeComponent: UI for viewing and customizing control schemes.
 * Displays current bindings organized by category with editing capabilities.
 */
@Component({
  selector: 'app-control-scheme',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-80 max-w-full bg-slate-900/95 border border-slate-800 rounded-lg shadow-xl overflow-hidden backdrop-blur-md">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
        <h3 class="text-sm font-bold text-slate-200 tracking-wide font-mono">CONTROL SCHEME</h3>
        <div class="flex gap-1">
          <select 
            [ngModel]="inputMapper.currentProfile()" 
            (ngModelChange)="inputMapper.setProfile($event)"
            class="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-cyan-500/50">
            @for (profile of availableProfiles(); track profile) {
              <option [value]="profile">{{ profile | titlecase }}</option>
            }
          </select>
          <button 
            (click)="showCreateProfile = true"
            class="w-7 h-7 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Create New Profile">
            <span class="material-symbols-outlined text-sm">add</span>
          </button>
        </div>
      </div>

      <!-- Category Tabs -->
      <div class="flex overflow-x-auto no-scrollbar border-b border-slate-800 bg-slate-950/50">
        @for (category of categories; track category.key) {
          <button 
            (click)="activeCategory.set(category.key)"
            [class.bg-slate-800]="activeCategory() === category.key"
            [class.text-cyan-400]="activeCategory() === category.key"
            [class.text-slate-400]="activeCategory() !== category.key"
            class="flex-shrink-0 px-3 py-2 text-xs font-medium hover:text-slate-200 transition-colors border-r border-slate-800/50">
            {{ category.label }}
          </button>
        }
      </div>

      <!-- Bindings List -->
      <div class="max-h-64 overflow-y-auto p-2 space-y-1">
        @for (action of currentCategoryActions(); track action) {
          <div class="group flex items-center justify-between p-2 rounded bg-slate-900/50 hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50 transition-all">
            <div class="flex-1 min-w-0">
              <div class="text-xs font-medium text-slate-300">{{ getActionDescription(action) }}</div>
              <div class="text-[10px] text-slate-500 font-mono">{{ action }}</div>
            </div>
            
            <div class="flex items-center gap-1 ml-2">
              @if (editingAction() === action) {
                <div class="flex items-center gap-1">
                  <button 
                    (click)="cancelEdit()"
                    class="w-6 h-6 flex items-center justify-center rounded bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-400 transition-colors">
                    <span class="material-symbols-outlined text-xs">close</span>
                  </button>
                  <div class="px-2 py-1 bg-cyan-900/30 border border-cyan-500/30 rounded text-xs text-cyan-300 animate-pulse">
                    Press key...
                  </div>
                </div>
              } @else {
                <div class="flex items-center gap-1">
                  @for (binding of getBindings(action); track binding) {
                    <kbd class="px-1.5 py-0.5 bg-slate-800 text-slate-300 text-[10px] rounded border border-slate-700 font-mono">
                      {{ formatBinding(binding) }}
                    </kbd>
                  }
                  <button 
                    (click)="startEdit(action)"
                    class="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded hover:bg-slate-700 text-slate-500 hover:text-slate-300 transition-all"
                    title="Edit Binding">
                    <span class="material-symbols-outlined text-xs">edit</span>
                  </button>
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Footer Actions -->
      <div class="flex items-center justify-between px-3 py-2 bg-slate-950 border-t border-slate-800">
        <button 
          (click)="inputMapper.resetToDefault()"
          class="text-xs text-slate-500 hover:text-slate-300 transition-colors">
          Reset to Default
        </button>
        <div class="flex gap-2">
          <button 
            (click)="exportProfile()"
            class="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors">
            Export
          </button>
          <button 
            (click)="importProfile()"
            class="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors">
            Import
          </button>
        </div>
      </div>

      <!-- Create Profile Modal -->
      @if (showCreateProfile) {
        <div class="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div class="w-64 p-4 bg-slate-900 border border-slate-700 rounded-lg shadow-xl">
            <h4 class="text-sm font-bold text-slate-200 mb-3">New Profile</h4>
            <input 
              type="text" 
              [(ngModel)]="newProfileName"
              placeholder="Profile name..."
              class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 mb-3">
            <div class="flex justify-end gap-2">
              <button 
                (click)="showCreateProfile = false"
                class="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors">
                Cancel
              </button>
              <button 
                (click)="createProfile()"
                [disabled]="!newProfileName.trim()"
                class="px-3 py-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded transition-colors">
                Create
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Key Capture Overlay -->
      @if (editingAction()) {
        <div 
          class="absolute inset-0 z-40 bg-black/20"
          tabindex="0"
          (keydown)="onKeyCapture($event)">
        </div>
      }
    </div>
  `,
  styles: [`
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    
    kbd {
      box-shadow: 0 1px 0 rgba(0,0,0,0.3);
    }
  `]
})
export class ControlSchemeComponent {
  inputMapper = inject(InputMapperService);
  layout = inject(LayoutService);

  // State
  activeCategory = signal<string>('MOVEMENT');
  editingAction = signal<InputAction | null>(null);
  showCreateProfile = false;
  newProfileName = '';

  // Categories for tabs
  categories = [
    { key: 'MOVEMENT', label: 'Movement' },
    { key: 'COMBAT', label: 'Combat' },
    { key: 'CAMERA', label: 'Camera' },
    { key: 'DESKTOP', label: 'Desktop' },
    { key: 'UI', label: 'UI' },
    { key: 'TRANSFORM', label: 'Transform' },
    { key: 'SYSTEM', label: 'System' }
  ] as const;

  // Computed values
  availableProfiles = computed(() => this.inputMapper.getAvailableProfiles());
  
  currentCategoryActions = computed(() => {
    const category = this.activeCategory();
    return INPUT_CATEGORIES[category as keyof typeof INPUT_CATEGORIES] || [];
  });

  getActionDescription(action: InputAction): string {
    return INPUT_DESCRIPTIONS[action] || action;
  }

  getBindings(action: InputAction): string[] {
    const map = this.inputMapper.getCurrentMap();
    return map[action] || [];
  }

  formatBinding(binding: string): string {
    return binding
      .replace('Key', '')
      .replace('Mouse0', 'LMB')
      .replace('Mouse1', 'MMB')
      .replace('Mouse2', 'RMB')
      .replace('ArrowUp', '↑')
      .replace('ArrowDown', '↓')
      .replace('ArrowLeft', '←')
      .replace('ArrowRight', '→')
      .replace('ShiftLeft', 'Shift')
      .replace('ShiftRight', 'Shift')
      .replace('ControlLeft', 'Ctrl')
      .replace('ControlRight', 'Ctrl')
      .replace('AltLeft', 'Alt')
      .replace('AltRight', 'Alt');
  }

  startEdit(action: InputAction) {
    if (!this.layout.isMobile()) {
      this.editingAction.set(action);
    }
  }

  cancelEdit() {
    this.editingAction.set(null);
  }

  onKeyCapture(event: KeyboardEvent) {
    event.preventDefault();
    
    const action = this.editingAction();
    if (!action) return;

    // Build binding string
    let binding = '';
    if (event.ctrlKey) binding += 'Ctrl+';
    if (event.altKey) binding += 'Alt+';
    if (event.shiftKey) binding += 'Shift+';
    
    if (event.code.startsWith('Key')) {
      binding += event.code;
    } else if (event.code.startsWith('Digit')) {
      binding += event.code;
    } else if (event.code.startsWith('Arrow')) {
      binding += event.code;
    } else if (['Space', 'Enter', 'Escape', 'Tab', 'Backspace', 'Delete'].includes(event.code)) {
      binding += event.code;
    }

    if (binding) {
      this.inputMapper.updateBinding(action, [binding]);
    }

    this.editingAction.set(null);
  }

  createProfile() {
    if (this.newProfileName.trim()) {
      this.inputMapper.createProfile(this.newProfileName.trim());
      this.inputMapper.setProfile(this.newProfileName.trim());
      this.newProfileName = '';
      this.showCreateProfile = false;
    }
  }

  exportProfile() {
    const profile = this.inputMapper.currentProfile();
    const data = this.inputMapper.exportProfile(profile);
    if (data) {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `control-scheme-${profile}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  importProfile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = e.target?.result as string;
          if (data && this.inputMapper.importProfile(data)) {
            // Success - could show toast notification
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }
}