
import { Component, ElementRef, ViewChild, AfterViewInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EngineService } from '../services/engine.service';
import { InteractionService } from '../engine/interaction.service';
import { LayoutService } from '../services/ui/layout.service';
import { MainMenuComponent } from './main-menu.component';
import { ContextMenuComponent } from './ui/context-menu.component';
import { TouchControlsComponent } from './ui/touch-controls.component';
import { SpawnMenuComponent } from './spawn-menu.component';
import { LoadingScreenComponent } from './ui/loading-screen.component';
import { GameHudComponent } from './ui/game-hud.component';

@Component({
  selector: 'app-main-layout',
  imports: [
      CommonModule, 
      MainMenuComponent,
      ContextMenuComponent,
      TouchControlsComponent,
      SpawnMenuComponent,
      LoadingScreenComponent,
      GameHudComponent
  ],
  template: `
    <div class="relative w-full h-screen bg-slate-950 overflow-hidden isolate">
      
      <!-- 1. Viewport Layer (Bottom) - Z=0 -->
      <main class="absolute inset-0 z-0 select-none outline-none touch-none" aria-label="3D Viewport">
          <canvas #renderCanvas class="block w-full h-full"></canvas>
      </main>

      <!-- 2. Interaction Overlay Layer (Touch Controls) - Z=20 -->
      <!-- Wrapper must be pointer-events-none to allow pass-through to canvas where no controls exist -->
      <div class="absolute inset-0 z-20 pointer-events-none">
          <!-- Mobile Controls -->
          @if (layout.isMobile() && !engine.mainMenuVisible()) {
              <div class="absolute inset-0 pointer-events-none">
                  <app-touch-controls (toggleInspector)="layout.toggleRight()" />
              </div>
          }
      </div>

      <!-- 3. HUD Layer (Panels, Toolbars) - Z=40 -->
      <div class="absolute inset-0 z-40 pointer-events-none">
          <app-game-hud />
      </div>

      <!-- 4. System Overlay Layer (Context Menus, Modals) - Z=50+ -->
      <div class="absolute inset-0 z-50 pointer-events-none">
          <!-- Context Menu -->
          @if (contextMenu(); as cm) {
             <div class="absolute inset-0 pointer-events-auto">
                 <app-context-menu 
                    [x]="cm.x" 
                    [y]="cm.y" 
                    [entityId]="cm.entity"
                    (select)="selectEntity($event)"
                    (duplicate)="duplicateEntity($event)"
                    (delete)="deleteEntity($event)"
                    (close)="closeContextMenu()"
                 />
             </div>
          }

          <!-- Spawn Menu -->
          @if (layout.spawnMenuVisible()) {
              <app-spawn-menu (close)="layout.closeSpawnMenu()" />
          }
      </div>

      <!-- 5. Full Screen Blocking Layers - Z=100+ -->
      @if (engine.mainMenuVisible() && !engine.loading()) {
         <app-main-menu />
      }

      @if (engine.loading()) {
         <app-loading-screen />
      }

    </div>
  `
})
export class MainLayoutComponent implements AfterViewInit {
  @ViewChild('renderCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  engine = inject(EngineService);
  interaction = inject(InteractionService);
  layout = inject(LayoutService);

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
      this.engine.viewport.toggleHud();
  }

  private checkResponsive() {
    if (this.layout.isMobile()) {
       this.engine.viewport.setGizmoConfig({ size: 1.5 });
    } else {
       this.engine.viewport.setGizmoConfig({ size: 1.0 });
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
      this.engine.ops.duplicateEntity(e);
      this.closeContextMenu();
  }

  deleteEntity(e: number) {
      this.engine.ops.deleteEntity(e);
      this.closeContextMenu();
  }
}
