
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
    element.requestPointerLock();
  }

  exitPointerLock() {
    document.exitPointerLock();
  }

  getAxis(negative: string, positive: string): number {
    return (this.keys.has(positive) ? 1 : 0) - (this.keys.has(negative) ? 1 : 0);
  }

  isPressed(code: string): boolean {
    return this.keys.has(code);
  }

  // Consume and reset delta (call once per frame)
  getAndResetMouseDelta() {
    const d = { ...this.mouseDelta };
    this.mouseDelta = { x: 0, y: 0 };
    return d;
  }
}
