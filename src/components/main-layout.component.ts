
import { Component, ElementRef, viewChild, AfterViewInit, OnDestroy, inject } from '@angular/core';
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
import { SystemLauncherComponent } from './ui/system-launcher.component';

@Component({
  selector: 'app-main-layout',
  imports: [
      CommonModule, 
      MainMenuComponent,
      ContextMenuComponent,
      TouchControlsComponent,
      SpawnMenuComponent,
      LoadingScreenComponent,
      GameHudComponent,
      SystemLauncherComponent
  ],
  host: {
    '(window:keydown.h)': 'onToggleHud($event)'
  },
  template: `
    <div class="relative w-full h-screen bg-slate-950 overflow-hidden isolate">
      
      <!-- 1. Viewport Layer (Bottom) - Z=0 -->
      <main #viewport class="absolute inset-0 z-0 select-none outline-none touch-none" aria-label="3D Viewport">
          <canvas #renderCanvas class="block w-full h-full"></canvas>
      </main>

      <!-- 2. Interaction Overlay Layer (Touch Controls) - Z=20 -->
      <div class="absolute inset-0 z-20 pointer-events-none">
          @if ((layout.isTouch() || layout.isMobile()) && !engine.mainMenuVisible()) {
              <app-touch-controls (toggleInspector)="layout.toggleRight()" />
          }
      </div>

      <!-- 3. HUD Layer (Panels, Toolbars) - Z=40 -->
      <div class="absolute inset-0 z-40 pointer-events-none">
          <app-game-hud />
      </div>

      <!-- 4. System Overlay Layer (Context Menus, Modals) - Z=50+ -->
      <div class="absolute inset-0 z-50 pointer-events-none">
          <app-system-launcher />

          @if (contextMenu(); as cm) {
             <div class="fixed inset-0 z-[100] pointer-events-auto bg-black/5 backdrop-blur-[1px]" (click)="closeContextMenu()">
                 <app-context-menu 
                    [x]="cm.x" 
                    [y]="cm.y" 
                    [entityId]="cm.entity"
                    (click)="$event.stopPropagation()"
                    (select)="selectEntity($event)"
                    (duplicate)="duplicateEntity($event)"
                    (delete)="deleteEntity($event)"
                    (close)="closeContextMenu()"
                 />
             </div>
          }

          @if (layout.spawnMenuVisible()) {
              <app-spawn-menu (close)="layout.closeSpawnMenu()" />
          }
      </div>

      <!-- 5. Full Screen Blocking Layers - Z=300+ -->
      @if (engine.mainMenuVisible() && !engine.loading()) {
         <app-main-menu />
      }

      @if (engine.loading()) {
         <app-loading-screen />
      }

    </div>
  `
})
export class MainLayoutComponent implements AfterViewInit, OnDestroy {
  canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('renderCanvas');
  viewportRef = viewChild.required<ElementRef<HTMLElement>>('viewport');
  
  engine = inject(EngineService);
  interaction = inject(InteractionService);
  layout = inject(LayoutService);

  contextMenu = this.interaction.contextMenuRequest;
  private resizeObserver: ResizeObserver | null = null;

  ngAfterViewInit() {
    this.engine.init(this.canvasRef().nativeElement);
    this.initResizeObserver();
    this.checkResponsive();
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }

  private initResizeObserver() {
    this.resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
            const { width, height } = entry.contentRect;
            if (width > 0 && height > 0) {
                this.engine.resize(width, height);
            }
        }
    });
    this.resizeObserver.observe(this.viewportRef().nativeElement);
  }
  
  onToggleHud(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      this.engine.viewport.toggleHud();
  }

  private checkResponsive() {
    if (this.layout.isMobile() || this.layout.isTouch()) {
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
      this.engine.interaction.selectEntity(e);
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
