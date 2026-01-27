
import { Component, inject, signal, HostListener, ElementRef } from '@angular/core';
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
      <div class="flex items-center gap-2 mr-6 cursor-pointer hover:opacity-80 transition-opacity" (click)="engine.mainMenuVisible.set(true)">
         <span class="material-symbols-outlined text-cyan-500 text-[18px]">deployed_code_history</span>
         <span class="font-bold text-slate-200 text-xs tracking-wider">QUALIA<span class="text-cyan-500">3D</span></span>
      </div>

      <div class="hidden md:flex gap-1">
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
      
      <div class="hidden md:flex items-center gap-3 px-2">
         <a href="#" class="text-[10px] text-slate-500 hover:text-cyan-400 transition-colors">Documentation</a>
         <a href="https://github.com/dimforge/rapier" target="_blank" class="flex items-center gap-1 text-[10px] text-slate-500 hover:text-cyan-400 transition-colors">
            <span>Rapier Physics</span>
         </a>
      </div>
    </nav>
  `
})
export class MenuBarComponent {
  openMenuId = signal<string | null>(null);
  
  engine = inject(EngineService);
  camera = inject(CameraControlService);
  keyboard = inject(KeyboardService);
  
  private el = inject(ElementRef);

  menus: MenuAction[] = [
    {
      id: 'file', label: 'File', execute: () => {},
      children: [
        { id: 'new', label: 'New Empty', shortcut: 'Ctrl+N', execute: () => this.engine.reset() },
        { id: 'qsave', label: 'Quick Save', shortcut: 'Ctrl+S', execute: () => this.engine.quickSave() },
        { id: 'qload', label: 'Quick Load', shortcut: 'Ctrl+L', execute: () => this.engine.quickLoad() },
        { id: 'main-menu', label: 'Exit to Main Menu', execute: () => this.engine.mainMenuVisible.set(true) },
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
        { id: 'sim-grav-moon', label: 'Gravity: Moon', execute: () => this.engine.setGravity(-1.62) },
        { id: 'sim-grav-earth', label: 'Gravity: Earth', execute: () => this.engine.setGravity(-9.81) },
        { id: 'sim-grav-zero', label: 'Gravity: Zero', execute: () => this.engine.setGravity(0) },
      ]
    },
    {
      id: 'view', label: 'View', execute: () => {},
      children: [
        { id: 'view-textures', label: 'Toggle Textures', execute: () => this.engine.toggleTextures() },
        { id: 'view-debug', label: 'Toggle Debug Overlay', execute: () => this.engine.setDebugOverlayVisible(!this.engine.showDebugOverlay()) },
        { id: 'camera-focus', label: 'Focus Selection', shortcut: 'F', execute: () => this.engine.focusSelectedEntity() },
        { id: 'camera-top', label: 'Top View', execute: () => this.engine.setCameraPreset('top') },
        { id: 'camera-front', label: 'Front View', execute: () => this.engine.setCameraPreset('front') }
      ]
    }
  ];

  constructor() {
    this.keyboard.register(this.menus);
  }

  setOpen(id: string | null) {
      this.openMenuId.set(id);
  }

  // Close menus when clicking outside
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
      if (!this.el.nativeElement.contains(event.target)) {
          this.setOpen(null);
      }
  }
}
