
import { Component, ElementRef, ViewChild, AfterViewInit, signal, HostListener } from '@angular/core';
import { PhysicsService, BodyData } from './services/physics.service';
import { SceneService } from './services/scene.service';
import { UiPanelComponent } from './components/ui-panel.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [UiPanelComponent],
  template: `
    <div class="relative w-full h-screen overflow-hidden">
      <!-- Loading Overlay -->
      @if (loading()) {
        <div class="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900 text-cyan-400">
          <div class="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
          <p class="font-mono text-sm tracking-widest animate-pulse">INITIALIZING PHYSICS ENGINE...</p>
        </div>
      }

      <canvas #renderCanvas class="block w-full h-full outline-none"></canvas>

      @if (!loading()) {
        <app-ui-panel 
          [objectCount]="objectCount()"
          [fps]="fps()"
          (onSpawnBox)="spawnBox()"
          (onSpawnSphere)="spawnSphere()"
          (onReset)="reset()"
          (onGravityChange)="updateGravity($event)"
        />
      }
    </div>
  `
})
export class AppComponent implements AfterViewInit {
  @ViewChild('renderCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  loading = signal(true);
  objectCount = signal(0);
  fps = signal(0);

  private activeHandles: number[] = [];
  private lastTime = 0;
  private frameCount = 0;
  private lastFpsTime = 0;

  constructor(
    private physics: PhysicsService,
    private scene: SceneService
  ) {}

  async ngAfterViewInit() {
    try {
      // 1. Initialize Physics (WASM)
      await this.physics.init();
      
      // 2. Initialize Scene (WebGL)
      this.scene.init(this.canvasRef.nativeElement);

      // 3. Start Loop
      this.loading.set(false);
      this.startLoop();
      
      // 4. Spawn some initial objects
      this.spawnBox();
      this.spawnSphere();
      this.spawnBox();
    } catch (err) {
      console.error("Initialization failed", err);
    }
  }

  startLoop() {
    const loop = (time: number) => {
      requestAnimationFrame(loop);

      const deltaTime = (time - this.lastTime) / 1000;
      this.lastTime = time;

      // FPS Calc
      this.frameCount++;
      if (time - this.lastFpsTime >= 1000) {
        this.fps.set(this.frameCount);
        this.frameCount = 0;
        this.lastFpsTime = time;
      }

      // Physics Step (Fixed time step is better, but simple delta for demo)
      this.physics.step();

      // Sync Physics -> Visuals
      for (const handle of this.activeHandles) {
        const transform = this.physics.getTransform(handle);
        if (transform) {
          this.scene.updateMesh(handle, transform.p, transform.q);
        }
      }

      // Render
      this.scene.render();
    };
    requestAnimationFrame(loop);
  }

  spawnBox() {
    const x = (Math.random() - 0.5) * 5;
    const y = 10 + Math.random() * 5;
    const z = (Math.random() - 0.5) * 5;
    const color = Math.random() * 0xffffff;

    const data: BodyData = this.physics.createBox(x, y, z, color);
    this.activeHandles.push(data.handle);
    this.scene.addMesh(data);
    this.updateCount();
  }

  spawnSphere() {
    const x = (Math.random() - 0.5) * 5;
    const y = 10 + Math.random() * 5;
    const z = (Math.random() - 0.5) * 5;
    const color = Math.random() * 0xffffff;

    const data: BodyData = this.physics.createSphere(x, y, z, color);
    this.activeHandles.push(data.handle);
    this.scene.addMesh(data);
    this.updateCount();
  }

  reset() {
    this.physics.reset();
    this.scene.reset();
    this.activeHandles = [];
    this.updateCount();
  }

  updateGravity(val: number) {
    this.physics.setGravity(val);
  }

  private updateCount() {
    this.objectCount.set(this.activeHandles.length);
  }

  @HostListener('window:resize')
  onResize() {
    this.scene.resize(window.innerWidth, window.innerHeight);
  }
}
