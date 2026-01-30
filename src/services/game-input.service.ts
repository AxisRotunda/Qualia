
import { Injectable, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameInputService {
  private destroyRef = inject(DestroyRef);

  // State
  keys = new Set<string>();
  mouseDelta = { x: 0, y: 0 };
  isPointerLocked = false;
  
  // Virtual Input (Touch)
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
        if (this.isPointerLocked) {
          this.mouseDelta.x += e.movementX;
          this.mouseDelta.y += e.movementY;
        }
      });
      
    // Pointer Lock Change
    fromEvent(document, 'pointerlockchange')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
            this.isPointerLocked = !!document.pointerLockElement;
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

  // --- Unified Input Accessors ---

  // Returns range -1 to 1 for X and Y
  // Y+ is Forward (W), Y- is Backward (S)
  getMoveDir(): { x: number, y: number } {
    const kx = (this.keys.has('KeyD') || this.keys.has('ArrowRight') ? 1 : 0) - (this.keys.has('KeyA') || this.keys.has('ArrowLeft') ? 1 : 0);
    const ky = (this.keys.has('KeyW') || this.keys.has('ArrowUp') ? 1 : 0) - (this.keys.has('KeyS') || this.keys.has('ArrowDown') ? 1 : 0);
    
    // Combine with virtual joystick
    const x = kx + this.virtualMove.x;
    const y = ky + this.virtualMove.y;
    
    // Clamp magnitude to 1 to prevent super-speed diagonal
    const len = Math.sqrt(x*x + y*y);
    if (len > 1) {
        return { x: x/len, y: y/len };
    }
    
    return { x, y };
  }
  
  // Returns delta pixels (mouse) or rate (joystick) converted to effective delta
  // Y Positive = Screen Down / Look Down
  getLookDelta(): { x: number, y: number } {
      const mouse = this.getAndResetMouseDelta();
      
      // Virtual look is -1 to 1.
      // Mouse is pixel delta.
      const joyScale = 20; 

      // Joystick Up is +1 (Standard). 
      // Mouse Up is -Y pixels.
      // We ADD Joy Y now instead of subtracting. 
      // Joy Up (+1) -> +Y Delta -> Pitch Increases -> Look Down (Standard Inverted Flight or Camera behavior)
      return {
          x: mouse.x + (this.virtualLook.x * joyScale),
          y: mouse.y + (this.virtualLook.y * joyScale) 
      };
  }
  
  getJump(): boolean {
      return this.keys.has('Space') || this.virtualJump;
  }
  
  getRun(): boolean {
      return this.keys.has('ShiftLeft') || this.virtualRun;
  }

  getAscend(): number {
      const k = (this.keys.has('Space') ? 1 : 0) - (this.keys.has('ShiftLeft') ? 1 : 0);
      return k + (this.virtualJump ? 1 : 0) - (this.virtualRun ? 1 : 0);
  }

  // --- Internal ---

  getAxis(negative: string, positive: string): number {
    return (this.keys.has(positive) ? 1 : 0) - (this.keys.has(negative) ? 1 : 0);
  }

  isPressed(code: string): boolean {
    return this.keys.has(code);
  }

  getAndResetMouseDelta() {
    const d = { ...this.mouseDelta };
    this.mouseDelta = { x: 0, y: 0 };
    return d;
  }
  
  setVirtualMove(x: number, y: number) { this.virtualMove = { x, y }; }
  setVirtualLook(x: number, y: number) { this.virtualLook = { x, y }; }
  setVirtualJump(v: boolean) { this.virtualJump = v; }
  setVirtualRun(v: boolean) { this.virtualRun = v; }
}
