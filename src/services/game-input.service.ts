
import { Injectable, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameInputService {
  private destroyRef = inject(DestroyRef);

  // Raw State
  private keys = new Set<string>();
  private mouseDelta = { x: 0, y: 0 };
  
  // Virtual Input (Touch) - Normalized -1 to 1
  virtualMove = { x: 0, y: 0 };
  virtualLook = { x: 0, y: 0 };
  virtualJump = false;
  virtualRun = false;

  constructor() {
    this.initListeners();
  }

  private initListeners() {
    // Keyboard
    fromEvent<KeyboardEvent>(window, 'keydown')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(e => this.keys.add(e.code));

    fromEvent<KeyboardEvent>(window, 'keyup')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(e => this.keys.delete(e.code));

    // Mouse Move
    fromEvent<MouseEvent>(document, 'mousemove')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(e => {
        if (document.pointerLockElement) {
          this.mouseDelta.x += e.movementX;
          this.mouseDelta.y += e.movementY;
        }
      });
  }

  requestPointerLock(element: HTMLElement) {
    if (window.matchMedia('(hover: hover)').matches) {
       element.requestPointerLock();
    }
  }

  exitPointerLock() {
    if (document.exitPointerLock) {
       document.exitPointerLock();
    }
  }

  // --- Normalized Input Accessors ---

  // Y+ is Forward (W), Y- is Backward (S)
  getMoveDir(): { x: number, y: number } {
    const kx = (this.keys.has('KeyD') || this.keys.has('ArrowRight') ? 1 : 0) - (this.keys.has('KeyA') || this.keys.has('ArrowLeft') ? 1 : 0);
    const ky = (this.keys.has('KeyW') || this.keys.has('ArrowUp') ? 1 : 0) - (this.keys.has('KeyS') || this.keys.has('ArrowDown') ? 1 : 0);
    
    // Sum hardware and virtual
    const x = kx + this.virtualMove.x;
    const y = ky + this.virtualMove.y;
    
    // Clamp magnitude to 1
    const lenSq = x*x + y*y;
    if (lenSq > 1) {
        const len = Math.sqrt(lenSq);
        return { x: x/len, y: y/len };
    }
    
    return { x, y };
  }
  
  // Returns normalized delta for current frame
  // X: Yaw (Right+), Y: Pitch (Down+)
  getLookDelta(): { x: number, y: number } {
      const mouse = this.getAndResetMouseDelta();
      
      // Constants to normalize different inputs to a similar "feel"
      // Mouse moves in pixels (e.g. 5-20 per frame)
      // Joystick moves in float (0-1)
      const JOY_SENSITIVITY = 15.0; // Multiplier to match mouse feel
      
      return {
          x: mouse.x + (this.virtualLook.x * JOY_SENSITIVITY),
          y: mouse.y + (this.virtualLook.y * JOY_SENSITIVITY) 
      };
  }
  
  getJump(): boolean {
      return this.keys.has('Space') || this.virtualJump;
  }
  
  getRun(): boolean {
      return this.keys.has('ShiftLeft') || this.virtualRun;
  }

  getAscend(): number {
      const k = (this.keys.has('Space') || this.keys.has('KeyE') ? 1 : 0) - (this.keys.has('ShiftLeft') || this.keys.has('KeyQ') ? 1 : 0);
      return k + (this.virtualJump ? 1 : 0) - (this.virtualRun ? 1 : 0);
  }

  // --- Internal Utilities ---

  private getAndResetMouseDelta() {
    const d = { ...this.mouseDelta };
    this.mouseDelta = { x: 0, y: 0 };
    return d;
  }
  
  // Virtual Input Setters (Called by UI)
  setVirtualMove(x: number, y: number) { this.virtualMove = { x, y }; }
  setVirtualLook(x: number, y: number) { this.virtualLook = { x, y }; }
  setVirtualJump(v: boolean) { this.virtualJump = v; }
  setVirtualRun(v: boolean) { this.virtualRun = v; }
}
