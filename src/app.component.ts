
import { Component, ElementRef, ViewChild, AfterViewInit, HostListener, inject, signal } from '@angular/core';
import { EngineService } from './services/engine.service';
import { CameraControlService } from './services/camera-control.service';
import { UiPanelComponent } from './components/ui-panel.component';
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
      UiPanelComponent, 
      SceneTreeComponent, 
      InspectorComponent, 
      MenuBarComponent, 
      ToolbarComponent, 
      StatusBarComponent
  ],
  template: `
    <div class="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden">
      
      <!-- Top Bar -->
      <app-menu-bar />
      <app-toolbar 
        (spawnBox)="engine.spawnBox()"
        (spawnSphere)="engine.spawnSphere()"
      />

      <!-- Main Workspace (Grid) -->
      <div class="grid flex-grow gap-0.5 p-0.5 bg-slate-950" [class]="layoutClasses()">
        
        <!-- LEFT: Scene Tree -->
        <div class="panel-left overflow-hidden hidden md:block border border-slate-700 rounded bg-slate-900" style="contain: layout style;">
          <app-scene-tree />
        </div>

        <!-- CENTER: Viewport -->
        <div class="relative w-full h-full bg-slate-900 border border-slate-700 rounded overflow-hidden" 
             style="contain: layout;"
             (contextmenu)="onCanvasContextMenu($event)"
             (mousedown)="onMouseDown($event)"
             (wheel)="onWheel($event)">
             
          @if (engine.loading()) {
            <div class="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900 text-cyan-400">
              <div class="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
              <p class="font-mono text-sm tracking-widest animate-pulse">INITIALIZING ECS ENGINE...</p>
            </div>
          }

          <canvas #renderCanvas class="block w-full h-full outline-none cursor-move"></canvas>
          
          @if (contextMenu()) {
            <div class="absolute bg-slate-800 border border-slate-600 shadow-xl rounded py-1 z-50 min-w-[120px]"
                 [style.top.px]="contextMenu()!.y"
                 [style.left.px]="contextMenu()!.x"
                 (mouseleave)="contextMenu.set(null)">
               <button class="w-full text-left px-4 py-2 text-xs hover:bg-cyan-900/50 hover:text-cyan-300" 
                       (click)="selectEntity(contextMenu()!.entity)">Select</button>
               <button class="w-full text-left px-4 py-2 text-xs hover:bg-cyan-900/50 hover:text-cyan-300"
                       (click)="duplicateEntity(contextMenu()!.entity)">Duplicate</button>
               <div class="h-px bg-slate-700 my-1"></div>
               <button class="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-900/20"
                       (click)="deleteEntity(contextMenu()!.entity)">Delete</button>
            </div>
          }

        </div>

        <!-- RIGHT: Inspector -->
        <div class="panel-right flex flex-col hidden lg:flex border border-slate-700 rounded bg-slate-900 overflow-hidden" style="contain: layout style;">
           <app-inspector />
        </div>
      </div>
      
      <!-- Bottom Bar -->
      <app-status-bar />
    </div>
  `
})
export class AppComponent implements AfterViewInit {
  @ViewChild('renderCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  engine = inject(EngineService);
  cameraControl = inject(CameraControlService);

  private isDragging = false;
  private lastMouseX = 0;
  private lastMouseY = 0;

  contextMenu = signal<{x: number, y: number, entity: number} | null>(null);

  layoutClasses() {
    return 'grid-cols-1 md:grid-cols-[220px_1fr] lg:grid-cols-[220px_1fr_280px]';
  }

  ngAfterViewInit() {
    this.engine.init(this.canvasRef.nativeElement);
  }

  @HostListener('window:resize')
  onResize() {
    this.engine.resize(window.innerWidth, window.innerHeight);
  }

  // --- Interaction ---

  onCanvasContextMenu(event: MouseEvent) {
      event.preventDefault();
      // Raycast to find entity
      const entity = this.engine.raycastFromScreen(event.clientX, event.clientY);
      
      if (entity !== null) {
          // Adjust coordinates to be relative to the container if needed, 
          // but for absolute fixed overlay, client coordinates usually work if container is relative.
          // Since canvas container is relative, we might need offsetX/Y. 
          // Simplest is to check target.
          const rect = (event.target as HTMLElement).getBoundingClientRect();
          this.contextMenu.set({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
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

  // --- Camera Input ---

  onMouseDown(event: MouseEvent) {
    if (event.button !== 0) return; // Only left click for camera
    this.isDragging = true;
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
    this.contextMenu.set(null); // Close menu on click
    
    // Also try to select if single click? 
    // For now simple selection logic
    const entity = this.engine.raycastFromScreen(event.clientX, event.clientY);
    this.engine.selectedEntity.set(entity);
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    
    const dx = event.clientX - this.lastMouseX;
    const dy = event.clientY - this.lastMouseY;
    
    this.cameraControl.onMouseDrag(dx, dy);
    
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
  }

  @HostListener('window:mouseup')
  onMouseUp() {
    this.isDragging = false;
  }
  
  onWheel(event: WheelEvent) {
    this.cameraControl.onZoom(event.deltaY > 0 ? 1 : -1);
  }
}
