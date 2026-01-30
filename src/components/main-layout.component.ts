
import { Component, ElementRef, ViewChild, AfterViewInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EngineService } from '../services/engine.service';
import { InteractionService } from '../engine/interaction.service';
import { LayoutService } from '../services/ui/layout.service';
import { SceneTreeComponent } from './scene-tree.component';
import { InspectorComponent } from './inspector.component';
import { MenuBarComponent } from './menu/menu-bar.component';
import { ToolbarComponent } from './toolbar.component';
import { StatusBarComponent } from './status-bar.component';
import { DebugOverlayComponent } from './debug-overlay.component';
import { MainMenuComponent } from './main-menu.component';
import { ContextMenuComponent } from './ui/context-menu.component';
import { TouchControlsComponent } from './ui/touch-controls.component';
import { MobileDrawersComponent } from './ui/mobile-drawers.component';
import { SpawnMenuComponent } from './spawn-menu.component';

@Component({
  selector: 'app-main-layout',
  imports: [
      CommonModule, 
      SceneTreeComponent, 
      InspectorComponent, 
      MenuBarComponent, 
      ToolbarComponent, 
      StatusBarComponent,
      DebugOverlayComponent,
      MainMenuComponent,
      ContextMenuComponent,
      TouchControlsComponent,
      MobileDrawersComponent,
      SpawnMenuComponent
  ],
  template: `
    <div class="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      <!-- Header Area -->
      @if (engine.hudVisible()) {
        <app-menu-bar />
        <app-toolbar />
      }

      <!-- Main Layout Area -->
      <div class="flex flex-1 overflow-hidden relative">
        
        <!-- Main Menu Overlay -->
        @if (engine.mainMenuVisible()) {
           <app-main-menu />
        }

        <!-- Spawn Menu Overlay -->
        @if (layout.spawnMenuVisible()) {
            <app-spawn-menu (close)="layout.closeSpawnMenu()" />
        }

        <!-- Desktop Left Panel -->
        @if (layout.leftPanelOpen() && !layout.isMobile() && engine.hudVisible()) {
          <aside class="flex flex-col w-64 bg-slate-950/95 border-r border-slate-800 z-10" aria-label="Outliner">
            <app-scene-tree />
          </aside>
        }

        <!-- Viewport -->
        <main class="relative flex-1 bg-slate-950 overflow-hidden select-none isolate"
             aria-label="3D Viewport">
             
          @if (engine.loading()) {
            <div class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-cyan-400">
              <div class="w-12 h-12 border-4 border-cyan-900 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
              <p class="font-mono text-sm tracking-widest animate-pulse opacity-70">INITIALIZING ENGINE</p>
            </div>
          }
          
          @if (engine.hudVisible()) {
            <app-debug-overlay />
          }

          <canvas #renderCanvas 
                  class="block w-full h-full outline-none touch-none"></canvas>
          
          <!-- Mobile Controls -->
          @if (layout.isMobile() && !engine.mainMenuVisible()) {
              <app-touch-controls (toggleInspector)="layout.toggleRight()" />
          }

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
        @if (layout.rightPanelOpen() && !layout.isMobile() && engine.hudVisible()) {
          <aside class="flex flex-col w-80 bg-slate-950/95 border-l border-slate-800 z-10" aria-label="Inspector">
            <app-inspector />
          </aside>
        }

        <!-- Mobile Drawers (Overlay) -->
        @if (layout.isMobile() && engine.hudVisible()) {
          <app-mobile-drawers />
        }

      </div>
      
      <!-- Bottom Bar -->
      @if (engine.hudVisible()) {
        <app-status-bar />
      }
    </div>
  `,
  styles: []
})
export class MainLayoutComponent implements AfterViewInit {
  @ViewChild('renderCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  engine = inject(EngineService);
  interaction = inject(InteractionService);
  layout = inject(LayoutService);

  // Expose context menu state from interaction service
  contextMenu = this.interaction.contextMenuRequest;

  ngAfterViewInit() {
    this.engine.init(this.canvasRef.nativeElement);
    this.checkResponsive();
  }

  @HostListener('window:resize')
  onResize() {
    this.engine.resize(window.innerWidth, window.innerHeight);
    this.checkResponsive();
  }
  
  @HostListener('window:keydown.h', ['$event'])
  onToggleHud(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      this.engine.toggleHud();
  }

  private checkResponsive() {
    if (this.layout.isMobile()) {
       this.engine.setGizmoConfig({ size: 1.5 });
    } else {
       this.engine.setGizmoConfig({ size: 1.0 });
    }
  }

  closeContextMenu() {
      if (this.contextMenu) {
          this.contextMenu.set(null);
      }
  }

  selectEntity(e: number) {
      if (this.engine.selectedEntity) {
        this.engine.selectedEntity.set(e);
      }
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
