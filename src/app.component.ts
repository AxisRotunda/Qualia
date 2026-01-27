
import { Component, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { EngineService } from './services/engine.service';
import { UiPanelComponent } from './components/ui-panel.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [UiPanelComponent],
  template: `
    <div class="relative w-full h-screen overflow-hidden">
      <!-- Loading Overlay -->
      @if (engine.loading()) {
        <div class="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900 text-cyan-400">
          <div class="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
          <p class="font-mono text-sm tracking-widest animate-pulse">INITIALIZING ECS ENGINE...</p>
        </div>
      }

      <canvas #renderCanvas class="block w-full h-full outline-none"></canvas>

      @if (!engine.loading()) {
        <app-ui-panel 
          [objectCount]="engine.objectCount()"
          [fps]="engine.fps()"
          (onSpawnBox)="engine.spawnBox()"
          (onSpawnSphere)="engine.spawnSphere()"
          (onReset)="engine.reset()"
          (onGravityChange)="engine.setGravity($event)"
        />
      }
    </div>
  `
})
export class AppComponent implements AfterViewInit {
  @ViewChild('renderCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  // Public for template access
  constructor(public engine: EngineService) {}

  ngAfterViewInit() {
    this.engine.init(this.canvasRef.nativeElement);
  }

  @HostListener('window:resize')
  onResize() {
    this.engine.resize(window.innerWidth, window.innerHeight);
  }
}
