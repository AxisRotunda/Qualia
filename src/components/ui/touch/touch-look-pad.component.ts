
import { Component, output, inject, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameInputService } from '../../../services/game-input.service';

@Component({
  selector: 'app-touch-look-pad',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Invisible Capture Surface -->
    <div class="absolute inset-0 bg-transparent cursor-crosshair touch-none"
         (pointerdown)="onDown($event)">
    </div>
  `,
  styles: [`
    :host {
        display: block;
        width: 100%;
        height: 100%;
        pointer-events: auto;
        touch-action: none;
    }
  `]
})
export class TouchLookPadComponent {
  tap = output<{x: number, y: number}>();
  longPress = output<{x: number, y: number}>();

  private input = inject(GameInputService);
  private pointerId: number | null = null;
  private lastX = 0;
  private lastY = 0;
  private downTime = 0;
  private hasMoved = false;
  private longPressTimer: any;

  // RUN_INDUSTRY: Touch Sensitivity Calibration
  // Mobile screens have high DPI, so raw pixel movement needs attenuation 
  // to match "Mouse Look" feel.
  private readonly SENSITIVITY = 0.4; 

  onDown(e: PointerEvent) {
      if (this.pointerId !== null) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const target = e.currentTarget as HTMLElement;
      try { target.setPointerCapture(e.pointerId); } catch {}
      
      this.pointerId = e.pointerId;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.downTime = performance.now();
      this.hasMoved = false;

      this.longPressTimer = setTimeout(() => {
          if (!this.hasMoved && this.pointerId !== null) {
              this.longPress.emit({ x: e.clientX, y: e.clientY });
              this.reset();
          }
      }, 600);
  }

  @HostListener('window:pointermove', ['$event'])
  onMove(e: PointerEvent) {
      if (this.pointerId !== e.pointerId) return;

      const dx = (e.clientX - this.lastX) * this.SENSITIVITY;
      const dy = (e.clientY - this.lastY) * this.SENSITIVITY;

      if (dx !== 0 || dy !== 0) {
          this.hasMoved = true;
          clearTimeout(this.longPressTimer);
          
          // Direct Delta Injection (1:1 Movement)
          this.input.addLookDelta(dx, dy);
      }

      this.lastX = e.clientX;
      this.lastY = e.clientY;
  }

  @HostListener('window:pointerup', ['$event'])
  @HostListener('window:pointercancel', ['$event'])
  onUp(e: PointerEvent) {
      if (this.pointerId !== e.pointerId) return;
      
      clearTimeout(this.longPressTimer);

      if (!this.hasMoved && (performance.now() - this.downTime < 300)) {
          this.tap.emit({ x: e.clientX, y: e.clientY });
      }

      this.reset();
  }

  private reset() {
      this.pointerId = null;
  }
}
