
import { Component, ElementRef, ViewChild, AfterViewInit, HostListener, inject, signal } from '@angular/core';
import { EngineService } from './services/engine.service';
import { CameraControlService } from './services/camera-control.service';
import { SelectionHighlightService } from './services/selection-highlight.service';
import { SceneTreeComponent } from './components/scene-tree.component';
import { InspectorComponent } from './components/inspector.component';
import { MenuBarComponent } from './components/menu/menu-bar.component';
import { ToolbarComponent } from './components/toolbar.component';
import { StatusBarComponent } from './components/status-bar.component';
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
      StatusBarComponent
  ],
  template: `
    <div class="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      <!-- Top Section -->
      <app-menu-bar />
      <app-toolbar 
        (spawnBox)="engine.spawnBox()"
        (spawnSphere)="engine.spawnSphere()"
        (toggleLeftPanel)="togglePanel('left')"
        (toggleRightPanel)="togglePanel('right')"
        [leftPanelOpen]="showLeftPanel()"
        [rightPanelOpen]="showRightPanel()"
      />

      <!-- Main Layout Area -->
      <div class="relative flex-grow overflow-hidden flex">
        
        <!-- LEFT DRAWER / PANEL -->
        <aside class="panel-transition bg-slate-900 border-r border-slate-800 flex flex-col z-20"
               [class.absolute]="isMobile"
               [class.h-full]="true"
               [class.w-64]="true"
               [class.-translate-x-full]="!showLeftPanel()"
               [class.translate-x-0]="showLeftPanel()"
               [class.shadow-2xl]="isMobile">
          <app-scene-tree />
        </aside>

        <!-- CENTER VIEWPORT -->
        <main class="relative flex-grow bg-slate-950 overflow-hidden select-none"
             (contextmenu)="onCanvasContextMenu($event)">
             
          @if (engine.loading()) {
            <div class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-cyan-400">
              <div class="w-12 h-12 border-4 border-cyan-900 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
              <p class="font-mono text-sm tracking-widest animate-pulse opacity-70">INITIALIZING ENGINE</p>
            </div>
          }

          <!-- Overlay when mobile drawer is open to close it on click -->
          @if (isMobile && (showLeftPanel() || showRightPanel())) {
             <div class="absolute inset-0 bg-black/50 z-10 backdrop-blur-sm" (click)="closeAllPanels()"></div>
          }

          <canvas #renderCanvas 
                  class="block w-full h-full outline-none touch-none"
                  (pointerdown)="onPointerDown($event)"
                  (pointerup)="onPointerUp($event)"></canvas>
          
          <!-- Context Menu -->
          @if (contextMenu()) {
            <div class="absolute bg-slate-800 border border-slate-700 shadow-xl rounded-lg py-1 z-50 min-w-[140px] animate-in fade-in zoom-in-95 duration-100"
                 [style.top.px]="contextMenu()!.y"
                 [style.left.px]="contextMenu()!.x"
                 (mouseleave)="contextMenu.set(null)">
               <button class="menu-item" (click)="selectEntity(contextMenu()!.entity)">
                 <span class="material-symbols-outlined icon-xs">check_circle</span> Select
               </button>
               <button class="menu-item" (click)="duplicateEntity(contextMenu()!.entity)">
                 <span class="material-symbols-outlined icon-xs">content_copy</span> Duplicate
               </button>
               <div class="h-px bg-slate-700 my-1 mx-2"></div>
               <button class="menu-item text-red-400 hover:text-red-300 hover:bg-red-900/20" (click)="deleteEntity(contextMenu()!.entity)">
                 <span class="material-symbols-outlined icon-xs">delete</span> Delete
               </button>
            </div>
          }

        </main>

        <!-- RIGHT DRAWER / PANEL -->
        <aside class="panel-transition bg-slate-900 border-l border-slate-800 flex flex-col z-20"
               [class.absolute]="isMobile"
               [class.right-0]="isMobile"
               [class.h-full]="true"
               [class.w-72]="true"
               [class.translate-x-full]="!showRightPanel()"
               [class.translate-x-0]="showRightPanel()"
               [class.shadow-2xl]="isMobile">
           <app-inspector />
        </aside>

      </div>
      
      <!-- Bottom Bar -->
      <app-status-bar />
    </div>
  `,
  styles: [`
    .panel-transition { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .menu-item { @apply w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-slate-700 transition-colors text-slate-200; }
    .icon-xs { font-size: 16px; }
  `]
})
export class AppComponent implements AfterViewInit {
  @ViewChild('renderCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  engine = inject(EngineService);
  cameraControl = inject(CameraControlService);
  selectionHighlight = inject(SelectionHighlightService);

  // Layout State
  showLeftPanel = signal(true);
  showRightPanel = signal(true);
  
  // Interaction State
  private pointerDownPos = { x: 0, y: 0 };
  private pointerDownTime = 0;
  
  contextMenu = signal<{x: number, y: number, entity: number} | null>(null);

  get isMobile(): boolean {
      return window.innerWidth < 1024;
  }

  ngAfterViewInit() {
    this.engine.init(this.canvasRef.nativeElement);
    this.checkResponsive();
  }

  @HostListener('window:resize')
  onResize() {
    this.engine.resize(window.innerWidth, window.innerHeight);
    this.checkResponsive();
  }

  private checkResponsive() {
    if (window.innerWidth < 1024) {
      // Auto-collapse on mobile
      this.showLeftPanel.set(false);
      this.showRightPanel.set(false);
    } else {
      // Auto-open on desktop
      this.showLeftPanel.set(true);
      this.showRightPanel.set(true);
    }
  }

  togglePanel(side: 'left' | 'right') {
      if (side === 'left') this.showLeftPanel.update(v => !v);
      if (side === 'right') this.showRightPanel.update(v => !v);
  }
  
  closeAllPanels() {
      if (this.isMobile) {
          this.showLeftPanel.set(false);
          this.showRightPanel.set(false);
      }
  }

  // --- Interaction ---

  onPointerDown(event: PointerEvent) {
      this.pointerDownPos = { x: event.clientX, y: event.clientY };
      this.pointerDownTime = performance.now();
      this.contextMenu.set(null);
  }

  onPointerUp(event: PointerEvent) {
      // Calculate distance moved to distinguish Click vs Drag
      const dist = Math.sqrt(
          Math.pow(event.clientX - this.pointerDownPos.x, 2) + 
          Math.pow(event.clientY - this.pointerDownPos.y, 2)
      );
      
      const timeDiff = performance.now() - this.pointerDownTime;

      // Threshold: Movement < 5px AND duration < 300ms (standard click definition)
      if (dist < 5 && timeDiff < 300 && event.button === 0) {
          const entity = this.engine.raycastFromScreen(event.clientX, event.clientY);
          this.engine.selectedEntity.set(entity);
      }
  }

  onCanvasContextMenu(event: MouseEvent) {
      event.preventDefault();
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
