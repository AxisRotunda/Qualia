
import { Injectable, signal, inject, OnDestroy } from '@angular/core';

export type LoopCallback = (dt: number) => void;

@Injectable({
  providedIn: 'root'
})
export class GameLoopService implements OnDestroy {
  fps = signal(0);
  
  private isRunning = false;
  private lastTime = 0;
  private frameCount = 0;
  private lastFpsTime = 0;
  private loopId: number | null = null;
  
  private callbacks: LoopCallback[] = [];

  start(loopCallback: LoopCallback) {
    if (this.isRunning) return;
    
    this.callbacks.push(loopCallback);
    this.isRunning = true;
    this.lastTime = performance.now();
    this.lastFpsTime = this.lastTime;
    
    const tick = (time: number) => {
      if (!this.isRunning) return;
      this.loopId = requestAnimationFrame(tick);

      const dt = time - this.lastTime;
      this.lastTime = time;

      this.updateStats(time);

      // Execute registered callbacks
      for (const cb of this.callbacks) {
        cb(dt);
      }
    };
    
    this.loopId = requestAnimationFrame(tick);
  }

  stop() {
    this.isRunning = false;
    if (this.loopId !== null) {
      cancelAnimationFrame(this.loopId);
      this.loopId = null;
    }
    this.callbacks = [];
  }

  private updateStats(time: number) {
    this.frameCount++;
    if (time - this.lastFpsTime >= 1000) {
      this.fps.set(this.frameCount);
      this.frameCount = 0;
      this.lastFpsTime = time;
    }
  }

  ngOnDestroy() {
    this.stop();
  }
}
