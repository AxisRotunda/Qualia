
import { Component, ElementRef, ViewChild, AfterViewInit, HostListener, inject, signal, computed } from '@angular/core';
import { EngineService } from './services/engine.service';
import { CameraControlService } from './services/camera-control.service';
import { SelectionHighlightService } from './services/selection-highlight.service';
import { SceneTreeComponent } from './components/scene-tree.component';
import { InspectorComponent } from './components/inspector.component';
import { MenuBarComponent } from './components/menu/menu-bar.component';
import { ToolbarComponent } from './components/toolbar.component';
import { StatusBarComponent } from './components/status-bar.component';
import { DebugOverlayComponent } from './components/debug-overlay.component';
import { MainMenuComponent } from './components/main-menu.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
      CommonModule, 
      SceneTreeComponent, 
      InspectorComponent, 
      MenuBarComponent, 
      ToolbarComponent, 
      StatusBarComponent,
      DebugOverlayComponent,
      MainMenuComponent
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
          @if (contextMenu()) {
            <div class="absolute bg-slate-900 border border-slate-700 shadow-xl rounded-lg py-1 z-50 min-w-[140px] animate-in fade-in zoom-in-95 duration-100"
                 [style.top.px]="contextMenu()!.y"
                 [style.left.px]="contextMenu()!.x"
                 (mouseleave)="contextMenu.set(null)">
               <button class="menu-item" (click)="selectEntity(contextMenu()!.entity)">
                 <span class="material-symbols-outlined icon-xs">check_circle</span> Select
               </button>
               <button class="menu-item" (click)="duplicateEntity(contextMenu()!.entity)">
                 <span class="material-symbols-outlined icon-xs">content_copy</span> Duplicate
               </button>
               <div class="h-px bg-slate-800 my-1 mx-2"></div>
               <button class="menu-item text-red-400 hover:bg-red-950/50" (click)="deleteEntity(contextMenu()!.entity)">
                 <span class="material-symbols-outlined icon-xs">delete</span> Delete
               </button>
            </div>
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
  styles: [`
    .menu-item { @apply w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-slate-800 transition-colors text-slate-300; }
    .icon-xs { font-size: 16px; }
  `]
})
export class AppComponent implements AfterViewInit {
  @ViewChild('renderCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  engine = inject(EngineService);
  cameraControl = inject(CameraControlService);
  selectionHighlight = inject(SelectionHighlightService);

  // Layout State
  leftPanelOpen = signal(true);
  rightPanelOpen = signal(true);
  
  isMobile = signal(window.innerWidth < 1024);

  // Interaction State
  private pointerDownPos = { x: 0, y: 0 };
  private pointerDownTime = 0;
  
  contextMenu = signal<{x: number, y: number, entity: number} | null>(null);

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

  toggleLeft() {
    this.leftPanelOpen.update(v => !v);
  }

  toggleRight() {
    this.rightPanelOpen.update(v => !v);
  }

  private checkResponsive() {
    if (this.isMobile()) {
       // logic for mobile responsiveness
    }
  }

  // --- Interaction ---

  onPointerDown(event: PointerEvent) {
      if (this.engine.mainMenuVisible()) return;
      this.pointerDownPos = { x: event.clientX, y: event.clientY };
      this.pointerDownTime = performance.now();
      this.contextMenu.set(null);
  }

  onPointerUp(event: PointerEvent) {
      if (this.engine.mainMenuVisible()) return;
      const dx = event.clientX - this.pointerDownPos.x;
      const dy = event.clientY - this.pointerDownPos.y;
      const distSq = dx*dx + dy*dy;
      const dt = performance.now() - this.pointerDownTime;

      // Tight threshold: < 16px sq (4px linear) AND < 200ms
      const isClick = distSq < 16 && dt < 200;

      if (isClick && event.button === 0) {
          const entity = this.engine.raycastFromScreen(event.clientX, event.clientY);
          this.engine.selectedEntity.set(entity);
      }
  }

  onCanvasContextMenu(event: MouseEvent) {
      event.preventDefault();
      if (this.engine.mainMenuVisible()) return;

      const entity = this.engine.raycastFromScreen(event.clientX, event.clientY);
      
      if (entity !== null) {
          this.contextMenu.set({
              x: event.clientX,
              y: event.clientY,
              entity
          });
      } else {
          this.contextMenu.set(null);
      }
  }

  selectEntity(e: number) {
      this.engine.selectedEntity.set(e);
      this.contextMenu.set(null);
  }

  duplicateEntity(e: number) {
      this.engine.duplicateEntity(e);
      this.contextMenu.set(null);
  }

  deleteEntity(e: number) {
      this.engine.deleteEntity(e);
      this.contextMenu.set(null);
  }
}
