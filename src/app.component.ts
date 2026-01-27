
import { Component, ElementRef, ViewChild, AfterViewInit, HostListener, inject } from '@angular/core';
import { EngineService } from './services/engine.service';
import { CameraControlService } from './services/camera-control.service';
import { UiPanelComponent } from './components/ui-panel.component';
import { SceneTreeComponent } from './components/scene-tree.component';
import { InspectorComponent } from './components/inspector.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, UiPanelComponent, SceneTreeComponent, InspectorComponent],
  template: `
    <div class="w-full h-screen bg-slate-950 text-slate-200 overflow-hidden grid"
         [class]="layoutClasses()">
      
      <!-- LEFT: Scene Tree -->
      <div class="panel-left overflow-hidden hidden md:block" style="contain: layout;">
        <app-scene-tree />
      </div>

      <!-- CENTER: Viewport -->
      <div class="relative w-full h-full bg-slate-900 overflow-hidden" 
           (mousedown)="onMouseDown($event)"
           (wheel)="onWheel($event)">
           
        @if (engine.loading()) {
          <div class="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900 text-cyan-400">
            <div class="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
            <p class="font-mono text-sm tracking-widest animate-pulse">INITIALIZING ECS ENGINE...</p>
          </div>
        }

        <canvas #renderCanvas class="block w-full h-full outline-none cursor-move"></canvas>
        
        <!-- Mobile Overlay Trigger (Placeholder) -->
        <div class="absolute top-2 left-2 md:hidden text-xs text-slate-500">
          Mobile Layout Limited
        </div>
      </div>

      <!-- RIGHT: Inspector & Controls -->
      <div class="panel-right flex flex-col hidden lg:flex" style="contain: layout;">
        <div class="flex-1 overflow-hidden">
            <app-inspector />
        </div>
        <div class="h-64 shrink-0">
            <app-ui-panel 
              [objectCount]="engine.objectCount()"
              [fps]="engine.fps()"
              (onSpawnBox)="engine.spawnBox()"
              (onSpawnSphere)="engine.spawnSphere()"
              (onReset)="engine.reset()"
              (onGravityChange)="engine.setGravity($event)"
            />
        </div>
      </div>
      
      <!-- Tablet/Mobile Fallback for Controls (if right panel hidden) -->
      @if (isTablet()) {
         <div class="absolute bottom-4 right-4 z-50">
             <!-- Simplified controls could go here, for now rely on desktop layout -->
         </div>
      }
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

  layoutClasses() {
    // Simple responsive grid logic
    // lg: 3 cols. md: 2 cols (tree + canvas). sm: 1 col (canvas)
    // We hardcode the tailwind classes in template but binding allows dynamic switching if needed
    return 'grid-cols-1 md:grid-cols-[250px_1fr] lg:grid-cols-[250px_1fr_300px]';
  }
  
  isTablet() {
      return window.innerWidth < 1024 && window.innerWidth >= 768;
  }

  ngAfterViewInit() {
    this.engine.init(this.canvasRef.nativeElement);
  }

  @HostListener('window:resize')
  onResize() {
    this.engine.resize(window.innerWidth, window.innerHeight); // Approximate layout width
    // Ideally we resize based on the canvas container div, but window is a safe fallback for MVP
  }

  // --- Camera Input Handling ---

  onMouseDown(event: MouseEvent) {
    this.isDragging = true;
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
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
