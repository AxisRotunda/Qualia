
import { Component, inject, signal } from '@angular/core';
import { EngineService } from '../../services/engine.service';
import { CameraControlService } from '../../services/camera-control.service';
import { KeyboardService, MenuAction } from '../../services/keyboard.service';
import { MenuDropdownComponent } from './menu-dropdown.component';

@Component({
  selector: 'app-menu-bar',
  standalone: true,
  imports: [MenuDropdownComponent],
  template: `
    <nav class="flex items-center gap-1 px-2 py-1 bg-slate-950 border-b border-slate-700 select-none"
         role="menubar">
      <!-- Brand -->
      <div class="px-2 font-bold text-cyan-500 mr-2 text-sm tracking-wider">QUALIA</div>

      @for (menu of menus; track menu.id) {
        <app-menu-dropdown 
          [label]="menu.label"
          [actions]="menu.children!"
          [class.bg-slate-800]="activeMenu() === menu.id"
          (menuOpen)="activeMenu.set(menu.id)"
          (menuClose)="activeMenu.set(null)" />
      }
      
      <!-- Spacer -->
      <div class="flex-grow"></div>
      
      <!-- Right-aligned items -->
      <button class="px-3 py-1 text-xs text-slate-500 hover:text-cyan-400 transition-colors"
              (click)="showShortcuts()">
        Keyboard Shortcuts
      </button>
    </nav>
  `
})
export class MenuBarComponent {
  activeMenu = signal<string | null>(null);
  
  engine = inject(EngineService);
  camera = inject(CameraControlService);
  keyboard = inject(KeyboardService);

  menus: MenuAction[] = [
    {
      id: 'file',
      label: 'File',
      execute: () => {},
      children: [
        { id: 'new', label: 'New Scene', shortcut: 'Ctrl+N', execute: () => this.engine.reset() },
        { id: 'save', label: 'Save Scene', shortcut: 'Ctrl+S', execute: () => console.log('Save triggered') },
        { id: 'load', label: 'Load Scene', shortcut: 'Ctrl+O', execute: () => console.log('Load triggered') },
        { id: 'export', label: 'Export GLTF', execute: () => console.log('Export triggered') }
      ]
    },
    {
      id: 'edit',
      label: 'Edit',
      execute: () => {},
      children: [
        { id: 'undo', label: 'Undo', shortcut: 'Ctrl+Z', 
          isDisabled: () => !this.engine.canUndo(), execute: () => this.engine.undo() },
        { id: 'redo', label: 'Redo', shortcut: 'Ctrl+Shift+Z',
          isDisabled: () => !this.engine.canRedo(), execute: () => this.engine.redo() },
        { id: 'duplicate', label: 'Duplicate', shortcut: 'Ctrl+D',
          isDisabled: () => !this.engine.selectedEntity(),
          execute: () => {
              const e = this.engine.selectedEntity();
              if (e !== null) this.engine.duplicateEntity(e);
          } },
        { id: 'delete', label: 'Delete', shortcut: 'Delete',
          isDisabled: () => !this.engine.selectedEntity(), 
          execute: () => {
              const e = this.engine.selectedEntity();
              if (e !== null) this.engine.deleteEntity(e);
          } }
      ]
    },
    {
      id: 'simulation',
      label: 'Simulation',
      execute: () => {},
      children: [
          { id: 'pause', label: 'Toggle Pause', shortcut: 'Space', execute: () => this.engine.togglePause() }
      ]
    },
    {
      id: 'view',
      label: 'View',
      execute: () => {},
      children: [
        { id: 'camera-focus', label: 'Focus Selection', shortcut: 'F', execute: () => console.log('Focus') }
      ]
    }
  ];

  constructor() {
    this.keyboard.register(this.menus);
  }

  showShortcuts() {
      console.log('Show shortcuts dialog');
  }
}
