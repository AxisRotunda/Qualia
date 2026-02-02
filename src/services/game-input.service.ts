
import { Injectable, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { InputAction, DEFAULT_INPUT_MAP } from '../engine/input/input-actions';

/**
 * GameInputService: Abstraction layer for hardware input.
 * Refactored Phase 81.0: Implements Semantic Action Mapping.
 * RUN_OPT: Uses internal buffers to prevent object churn.
 */
@Injectable({
  providedIn: 'root'
})
export class GameInputService {
  private destroyRef = inject(DestroyRef);

  private keys = new Set<string>();
  private mouseDelta = { x: 0, y: 0 };
  private mouseButtons = new Set<number>();
  
  // Input Map Registry (Allow future remapping)
  private inputMap = DEFAULT_INPUT_MAP;

  // Virtual inputs from touch/UI
  virtualMove = { x: 0, y: 0 };
  virtualLook = { x: 0, y: 0 };
  virtualJump = false;
  virtualRun = false;
  virtualCrouch = false;
  virtualFire = false;
  virtualAim = false;

  private readonly DEADZONE = 0.1;
  private readonly SENSITIVITY_LOOK = 850.0; 
  private readonly LOOK_CURVE_EXPONENT = 2.2; 

  // Output Buffers (Zero-Alloc)
  private readonly _moveDir = { x: 0, y: 0 };
  private readonly _lookDelta = { x: 0, y: 0 };

  constructor() {
    this.initListeners();
  }

  private initListeners() {
    fromEvent<KeyboardEvent>(window, 'keydown')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(e => this.keys.add(e.code));

    fromEvent<KeyboardEvent>(window, 'keyup')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(e => this.keys.delete(e.code));

    fromEvent<MouseEvent>(document, 'mousemove')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(e => {
        if (document.pointerLockElement) {
          this.mouseDelta.x += e.movementX;
          this.mouseDelta.y += e.movementY;
        }
      });

    fromEvent<MouseEvent>(document, 'mousedown')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(e => {
          if (document.pointerLockElement) this.mouseButtons.add(e.button);
      });

    fromEvent<MouseEvent>(document, 'mouseup')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(e => this.mouseButtons.delete(e.button));
  }

  /**
   * Checks if an action is currently active via any bound hardware.
   */
  isActionActive(action: InputAction): boolean {
      const bindings = this.inputMap[action];
      if (!bindings) return false;

      for (let i = 0; i < bindings.length; i++) {
          const b = bindings[i];
          if (b.startsWith('Mouse')) {
              const btn = parseInt(b.replace('Mouse', ''), 10);
              if (this.mouseButtons.has(btn)) return true;
          } else {
              if (this.keys.has(b)) return true;
          }
      }
      return false;
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

  vibrate(ms: number | number[]) {
      if ('vibrate' in navigator) {
          navigator.vibrate(ms);
      }
  }

  private applyCurve(val: number): number {
      const sign = Math.sign(val);
      const abs = Math.abs(val);
      if (abs < this.DEADZONE) return 0;
      const normalized = (abs - this.DEADZONE) / (1.0 - this.DEADZONE);
      return sign * Math.pow(normalized, this.LOOK_CURVE_EXPONENT);
  }

  getMoveDir(): { x: number, y: number } {
    const kx = (this.isActionActive(InputAction.MOVE_RIGHT) ? 1 : 0) - (this.isActionActive(InputAction.MOVE_LEFT) ? 1 : 0);
    const ky = (this.isActionActive(InputAction.MOVE_FORWARD) ? 1 : 0) - (this.isActionActive(InputAction.MOVE_BACK) ? 1 : 0);
    
    let x = kx + this.virtualMove.x;
    let y = ky + this.virtualMove.y;
    
    const lenSq = x*x + y*y;
    if (lenSq > 1) {
        const len = Math.sqrt(lenSq);
        x /= len;
        y /= len;
    }
    
    this._moveDir.x = x;
    this._moveDir.y = y;
    return this._moveDir;
  }

  addLookDelta(x: number, y: number) {
      this.mouseDelta.x += x;
      this.mouseDelta.y += y;
  }

  getLookDelta(dtSec: number): { x: number, y: number } {
      const dx = this.mouseDelta.x;
      const dy = this.mouseDelta.y;
      this.mouseDelta.x = 0;
      this.mouseDelta.y = 0;
      
      const jx = this.applyCurve(this.virtualLook.x) * this.SENSITIVITY_LOOK * dtSec;
      const jy = this.applyCurve(this.virtualLook.y) * this.SENSITIVITY_LOOK * dtSec;
      
      this._lookDelta.x = dx + jx;
      this._lookDelta.y = dy - jy; 
      
      return this._lookDelta;
  }
  
  getJump(): boolean { return this.isActionActive(InputAction.JUMP) || this.virtualJump; }
  getRun(): boolean { return this.isActionActive(InputAction.RUN) || this.virtualRun; }
  getCrouch(): boolean { return this.isActionActive(InputAction.CROUCH) || this.virtualCrouch; }
  getFire(): boolean { return this.isActionActive(InputAction.FIRE) || this.virtualFire; }
  getAim(): boolean { return this.isActionActive(InputAction.AIM) || this.virtualAim; }

  getAscend(): number {
      const k = (this.isActionActive(InputAction.ASCEND) ? 1 : 0) - (this.isActionActive(InputAction.DESCEND) ? 1 : 0);
      return k + (this.virtualJump ? 1 : 0) - (this.virtualRun ? 1 : 0);
  }

  setVirtualMove(x: number, y: number) { this.virtualMove.x = x; this.virtualMove.y = y; }
  setVirtualLook(x: number, y: number) { this.virtualLook.x = x; this.virtualLook.y = y; }
  setVirtualJump(v: boolean) { this.virtualJump = v; }
  setVirtualRun(v: boolean) { this.virtualRun = v; }
  setVirtualCrouch(v: boolean) { this.virtualCrouch = v; }
  setVirtualFire(v: boolean) { this.virtualFire = v; }
  setVirtualAim(v: boolean) { this.virtualAim = v; }
}
