
import { Component, ElementRef, ViewChild, AfterViewInit, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EngineService } from '../services/engine.service';
import { InteractionService } from '../engine/interaction.service';
import { SceneTreeComponent } from './scene-tree.component';
import { InspectorComponent } from './inspector.component';
import { MenuBarComponent } from './menu/menu-bar.component';
import { ToolbarComponent } from './toolbar.component';
import { StatusBarComponent } from './status-bar.component';
import { DebugOverlayComponent } from './debug-overlay.component';
import { MainMenuComponent } from './main-menu.component';
import { ContextMenuComponent } from './ui/context-menu.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
      CommonModule, 
      SceneTreeComponent, 
      InspectorComponent, 
      MenuBarComponent, 
      ToolbarComponent, 
      StatusBarComponent,
      DebugOverlayComponent,
      MainMenuComponent,
      ContextMenuComponent
  ],
  template: `
    <div class="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      <!-- Header Area -->
      <app-menu-bar />
      <app-toolbar 
        (spawnBox)="engine.spawnBox()"
        (spawnSphere)="engine.spawnSphere()"
        (toggleLeftPanel)="toggleLeft()"
        (toggleRightPanel)="toggleRight()"
        [leftPanelOpen]="leftPanelOpen()"
        [rightPanelOpen]="rightPanelOpen()"
      />

      <!-- Main Layout Area -->
      <div class="flex flex-1 overflow-hidden relative">
        
        <!-- Main Menu Overlay -->
        @if (engine.mainMenuVisible()) {
           <app-main-menu />
        }

        <!-- Desktop Left Panel -->
        @if (leftPanelOpen() && !isMobile()) {
          <aside class="flex flex-col w-64 bg-slate-950/95 border-r border-slate-800 z-10" aria-label="Outliner">
            <app-scene-tree />
          </aside>
        }

        <!-- Viewport -->
        <main class="relative flex-1 bg-slate-950 overflow-hidden select-none isolate"
             aria-label="3D Viewport"
             (contextmenu)="onCanvasContextMenu($event)">
             
          @if (engine.loading()) {
            <div class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-cyan-400">
              <div class="w-12 h-12 border-4 border-cyan-900 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
              <p class="font-mono text-sm tracking-widest animate-pulse opacity-70">INITIALIZING ENGINE</p>
            </div>
          }

          <app-debug-overlay />

          <canvas #renderCanvas 
                  class="block w-full h-full outline-none touch-none"
                  (pointerdown)="onPointerDown($event)"
                  (pointerup)="onPointerUp($event)"></canvas>
          
          <!-- Context Menu -->
          @if (contextMenu(); as cm) {
             <app-context-menu 
                [x]="cm.x" 
                [y]="cm.y" 
                [entityId]="cm.entity"
                (select)="selectEntity($event)"
                (duplicate)="duplicateEntity($event)"
                (delete)="deleteEntity($event)"
                (close)="closeContextMenu()"
             />
          }
        </main>

        <!-- Desktop Right Panel -->
        @if (rightPanelOpen() && !isMobile()) {
          <aside class="flex flex-col w-80 bg-slate-950/95 border-l border-slate-800 z-10" aria-label="Inspector">
            <app-inspector />
          </aside>
        }

        <!-- Mobile Drawers (Overlay) -->
        @if (isMobile()) {
          <!-- Left Drawer -->
          @if (leftPanelOpen()) {
            <div class="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm" (click)="leftPanelOpen.set(false)">
              <aside class="absolute left-0 top-0 bottom-0 w-72 bg-slate-900 border-r border-slate-800 shadow-2xl" (click)="$event.stopPropagation()">
                <app-scene-tree />
              </aside>
            </div>
          }

          <!-- Right Drawer -->
          @if (rightPanelOpen()) {
            <div class="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm" (click)="rightPanelOpen.set(false)">
              <aside class="absolute right-0 top-0 bottom-0 w-80 bg-slate-900 border-l border-slate-800 shadow-2xl" (click)="$event.stopPropagation()">
                <app-inspector />
              </aside>
            </div>
          }
        }

      </div>
      
      <!-- Bottom Bar -->
      <app-status-bar />
    </div>
  `,
  styles: []
})
export class MainLayoutComponent implements AfterViewInit {
  @ViewChild('renderCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  engine = inject(EngineService);
  interaction = inject(InteractionService);

  // Layout State
  leftPanelOpen = signal(true);
  rightPanelOpen = signal(true);
  isMobile = signal(window.innerWidth < 1024);

  // Expose context menu state from interaction service
  contextMenu = this.interaction.contextMenuRequest;

  ngAfterViewInit() {
    this.engine.init(this.canvasRef.nativeElement);
    this.checkResponsive();
  }

  @HostListener('window:resize')
  onResize() {
    this.isMobile.set(window.innerWidth < 1024);
    this.engine.resize(window.innerWidth, window.innerHeight);
    this.checkResponsive();
  }

  toggleLeft() { this.leftPanelOpen.update(v => !v); }
  toggleRight() { this.rightPanelOpen.update(v => !v); }

  private checkResponsive() {
    if (this.isMobile()) {
       this.leftPanelOpen.set(false);
       this.rightPanelOpen.set(false);
    }
  }

  // --- Interaction Delegates ---

  onPointerDown(event: PointerEvent) {
      if (this.engine.mainMenuVisible()) return;
      this.interaction.handlePointerDown(event);
  }

  onPointerUp(event: PointerEvent) {
      if (this.engine.mainMenuVisible()) return;
      this.interaction.handlePointerUp(event);
  }

  onCanvasContextMenu(event: MouseEvent) {
      if (this.engine.mainMenuVisible()) return;
      this.interaction.handleContextMenu(event);
  }

  closeContextMenu() {
      this.contextMenu.set(null);
  }

  selectEntity(e: number) {
      this.engine.selectedEntity.set(e);
      this.closeContextMenu();
  }

  duplicateEntity(e: number) {
      this.engine.duplicateEntity(e);
      this.closeContextMenu();
  }

  deleteEntity(e: number) {
      this.engine.deleteEntity(e);
      this.closeContextMenu();
  }
}
