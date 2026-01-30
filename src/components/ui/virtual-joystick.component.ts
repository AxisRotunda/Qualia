
import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-virtual-joystick',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="absolute inset-0 touch-none select-none z-0"
         (pointerdown)="onDown($event)"
         (pointermove)="onMove($event)"
         (pointerup)="onUp($event)"
         (pointercancel)="onUp($event)"
         (pointerleave)="onUp($event)">
      
      @if (active()) {
        <!-- Base Ring -->
        <div class="absolute w-28 h-28 -ml-14 -mt-14 rounded-full border-2 border-white/10 bg-slate-900/40 backdrop-blur-sm pointer-events-none animate-in fade-in zoom-in-50 duration-75"
             [style.left.px]="base().x"
             [style.top.px]="base().y">
        </div>
        
        <!-- Stick -->
        <div class="absolute w-14 h-14 -ml-7 -mt-7 rounded-full shadow-lg pointer-events-none transform transition-transform duration-75 will-change-transform"
             [ngClass]="colorClass()"
             [style.left.px]="stick().x"
             [style.top.px]="stick().y">
        </div>
      }
    </div>
  `
})
export class VirtualJoystickComponent {
  color = input<'cyan' | 'amber'>('cyan');
  move = output<{x: number, y: number}>();
  tap = output<{x: number, y: number}>();
  
  active = signal(false);
  base = signal({x: 0, y: 0});
  stick = signal({x: 0, y: 0});
  
  private pointerId: number | null = null;
  private readonly MAX_RADIUS = 56;
  
  // Tap Detection
  private downTime = 0;
  private downPos = {x: 0, y: 0};
  private hasMovedSignificantly = false;

  colorClass = computed(() => {
      return this.color() === 'cyan' 
        ? 'bg-cyan-500/80 border border-cyan-400/50 shadow-cyan-500/40' 
        : 'bg-amber-500/80 border border-amber-400/50 shadow-amber-500/40';
  });

  onDown(e: PointerEvent) {
      if (this.pointerId !== null) return;
      
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      this.pointerId = e.pointerId;
      
      const x = e.offsetX;
      const y = e.offsetY;
      
      this.active.set(true);
      this.base.set({x, y});
      this.stick.set({x, y});
      
      // Init Tap tracking
      this.downTime = performance.now();
      this.downPos = {x, y};
      this.hasMovedSignificantly = false;

      this.move.emit({x: 0, y: 0});
  }

  onMove(e: PointerEvent) {
      if (this.pointerId !== e.pointerId) return;
      e.preventDefault();

      const base = this.base();
      const dx = e.offsetX - base.x;
      const dy = e.offsetY - base.y;
      
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      // Tap threshold check
      if (dist > 10) {
          this.hasMovedSignificantly = true;
      }

      const limit = Math.min(dist, this.MAX_RADIUS);
      const angle = Math.atan2(dy, dx);
      
      const sx = base.x + Math.cos(angle) * limit;
      const sy = base.y + Math.sin(angle) * limit;
      
      this.stick.set({x: sx, y: sy});
      
      const nx = (Math.cos(angle) * limit) / this.MAX_RADIUS;
      const ny = -(Math.sin(angle) * limit) / this.MAX_RADIUS; 
      
      this.move.emit({x: nx, y: ny});
  }

  onUp(e: PointerEvent) {
      if (this.pointerId !== e.pointerId) return;
      
      e.preventDefault();
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch { /* ignore */ }
      
      // Check for tap
      if (!this.hasMovedSignificantly) {
          const dur = performance.now() - this.downTime;
          if (dur < 300) {
              // Valid tap (client coordinates)
              this.tap.emit({ x: e.clientX, y: e.clientY });
          }
      }

      this.pointerId = null;
      this.active.set(false);
      this.move.emit({x: 0, y: 0});
  }
}
