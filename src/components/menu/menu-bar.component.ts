
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
    <nav class="flex items-center gap-1 px-3 py-1 bg-slate-950 border-b border-slate-800 select-none z-50 relative shrink-0"
         aria-label="Main Menu">
      <div class="flex items-center gap-2 mr-6">
         <span class="material-symbols-outlined text-cyan-500 text-[18px]">deployed_code_history</span>
         <span class="font-bold text-slate-200 text-xs tracking-wider">QUALIA<span class="text-cyan-500">3D</span></span>
      </div>

      <div class="hidden md:flex gap-1">
          @for (menu of menus; track menu.id) {
            <app-menu-dropdown 
              [label]="menu.label"
              [actions]="menu.children!"
              [class.bg-slate-800]="activeMenu() === menu.id"
              (menuOpen)="activeMenu.set(menu.id)"
              (menuClose)="activeMenu.set(null)" />
          }
      </div>
      
      <div class="flex-grow"></div>
      
      <a href="https://github.com/dimforge/rapier" target="_blank" class="hidden md:flex items-center gap-1 px-2 py-1 text-[10px] text-slate-500 hover:text-cyan-400 transition-colors">
        <span>Rapier & Three.js</span>
      </a>
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
      id: 'file', label: 'File', execute: () => {},
      children: [
        { id: 'new', label: 'New Empty', shortcut: 'Ctrl+N', execute: () => this.engine.reset() },
        { id: 'scene-city', label: 'Load City Slice', execute: () => this.engine.loadScene('city') },
        { id: 'scene-stacks', label: 'Load Stacks & Ramps', execute: () => this.engine.loadScene('stacks') },
        { id: 'scene-particles', label: 'Load Pillars & Particles', execute: () => this.engine.loadScene('particles') },
      ]
    },
    {
      id: 'edit', label: 'Edit', execute: () => {},
      children: [
        { id: 'undo', label: 'Undo', shortcut: 'Ctrl+Z', isDisabled: () => !this.engine.canUndo(), execute: () => this.engine.undo() },
        { id: 'redo', label: 'Redo', shortcut: 'Ctrl+Shift+Z', isDisabled: () => !this.engine.canRedo(), execute: () => this.engine.redo() },
        { id: 'duplicate', label: 'Duplicate', shortcut: 'Ctrl+D', isDisabled: () => this.engine.selectedEntity() === null, execute: () => { const e = this.engine.selectedEntity(); if (e !== null) this.engine.duplicateEntity(e); } },
        { id: 'delete', label: 'Delete', shortcut: 'Delete', isDisabled: () => this.engine.selectedEntity() === null, execute: () => { const e = this.engine.selectedEntity(); if (e !== null) this.engine.deleteEntity(e); } }
      ]
    },
    {
      id: 'simulation', label: 'Simulation', execute: () => {},
      children: [
        { id: 'sim-play',  label: 'Play',  shortcut: 'Space', isDisabled: () => !this.engine.isPaused(), execute: () => this.engine.setPaused(false) },
        { id: 'sim-pause', label: 'Pause', shortcut: 'Space', isDisabled: () => this.engine.isPaused(), execute: () => this.engine.setPaused(true) },
        { id: 'sim-reset', label: 'Reset Props', execute: () => {} },
      ]
    },
    {
      id: 'view', label: 'View', execute: () => {},
      children: [
        { id: 'camera-focus', label: 'Focus Selection', shortcut: 'F', execute: () => this.engine.focusSelectedEntity() },
        { id: 'camera-top', label: 'Top View', execute: () => this.engine.setCameraPreset('top') },
        { id: 'camera-front', label: 'Front View', execute: () => this.engine.setCameraPreset('front') }
      ]
    }
  ];

  constructor() {
    this.keyboard.register(this.menus);
  }
}
