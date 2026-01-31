
import { Component, input, output, signal, computed, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-virtual-joystick',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- 
      Hit Target Layer:
      Using explicit background-color: transparent ensures hit testing works on mobile 
      where 'none' might fall through.
    -->
    <div class="absolute inset-0 z-0 bg-transparent cursor-crosshair touch-none"
         (pointerdown)="onDown($event)"
         (pointermove)="onMove($event)"
         (pointerup)="onUp($event)"
         (pointercancel)="onUp($event)"
         (pointerleave)="onUp($event)">
      
      @if (active()) {
        <!-- Base Container (The anchor point) -->
        <div class="absolute w-32 h-32 -ml-16 -mt-16 pointer-events-none animate-in fade-in zoom-in-75 duration-100 flex items-center justify-center"
             [style.left.px]="base().x"
             [style.top.px]="base().y">
             
             <!-- Outer Ring -->
             <div class="absolute inset-0 rounded-full border border-white/20 bg-slate-900/60 backdrop-blur-md"></div>
             
             <!-- Inner Ring (Scope) -->
             <div class="absolute inset-4 rounded-full border border-white/10"></div>
             
             <!-- Crosshairs -->
             <div class="absolute w-full h-px bg-white/20"></div>
             <div class="absolute h-full w-px bg-white/20"></div>
        </div>
        
        <!-- Stick / Puck (The moving part) -->
        <div class="absolute w-12 h-12 -ml-6 -mt-6 rounded-full shadow-2xl pointer-events-none transform transition-transform duration-75 will-change-transform flex items-center justify-center"
             [ngClass]="stickClass()"
             [style.left.px]="stick().x"
             [style.top.px]="stick().y">
             
             <!-- Stick Center Dot -->
             <div class="w-3 h-3 rounded-full bg-white shadow-sm"></div>
        </div>
        
        <!-- Connection Line -->
        <svg class="absolute pointer-events-none overflow-visible opacity-40 top-0 left-0 w-full h-full">
             <line [attr.x1]="base().x" [attr.y1]="base().y" 
                   [attr.x2]="stick().x" [attr.y2]="stick().y" 
                   stroke="white" stroke-width="2" />
        </svg>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      touch-action: none;
      position: relative;
      pointer-events: auto; /* CRITICAL: Force capture even if parent is none */
    }
    
    /* Stick variants */
    .stick-cyan { @apply bg-cyan-500/90 border-2 border-white/50 shadow-[0_0_20px_rgba(34,211,238,0.6)]; }
    .stick-amber { @apply bg-amber-500/90 border-2 border-white/50 shadow-[0_0_20px_rgba(251,191,36,0.6)]; }
  `]
})
export class VirtualJoystickComponent {
  color = input<'cyan' | 'amber'>('cyan');
  move = output<{x: number, y: number}>();
  tap = output<{x: number, y: number}>();
  longPress = output<{x: number, y: number}>();
  
  active = signal(false);
  base = signal({x: 0, y: 0});
  stick = signal({x: 0, y: 0});
  
  private el = inject(ElementRef);
  private pointerId: number | null = null;
  private readonly MAX_RADIUS = 64;
  
  // Tap / Long Press Detection
  private downTime = 0;
  private hasMovedSignificantly = false;
  private longPressTimer: any;

  stickClass = computed(() => {
      return this.color() === 'cyan' ? 'stick-cyan' : 'stick-amber';
  });

  onDown(e: PointerEvent) {
      if (this.pointerId !== null) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const target = e.target as HTMLElement;
      try { target.setPointerCapture(e.pointerId); } catch {}
      this.pointerId = e.pointerId;
      
      // Calculate position relative to container
      const rect = this.el.nativeElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      this.active.set(true);
      this.base.set({x, y});
      this.stick.set({x, y});
      
      this.downTime = performance.now();
      this.hasMovedSignificantly = false;

      this.move.emit({x: 0, y: 0});

      // Start Long Press Timer
      this.longPressTimer = setTimeout(() => {
          if (!this.hasMovedSignificantly && this.active()) {
              this.longPress.emit({ x: e.clientX, y: e.clientY });
              this.resetState();
          }
      }, 600);
  }

  onMove(e: PointerEvent) {
      if (this.pointerId !== e.pointerId) return;
      e.preventDefault();
      e.stopPropagation();

      const rect = this.el.nativeElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const base = this.base();
      const dx = x - base.x;
      const dy = y - base.y;
      
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if (dist > 10) {
          this.hasMovedSignificantly = true;
          clearTimeout(this.longPressTimer);
      }

      const limit = Math.min(dist, this.MAX_RADIUS);
      const angle = Math.atan2(dy, dx);
      
      const sx = base.x + Math.cos(angle) * limit;
      const sy = base.y + Math.sin(angle) * limit;
      
      this.stick.set({x: sx, y: sy});
      
      // Normalize output -1 to 1
      const nx = (Math.cos(angle) * limit) / this.MAX_RADIUS;
      const ny = -(Math.sin(angle) * limit) / this.MAX_RADIUS; // Y up is positive in our engine input
      
      this.move.emit({x: nx, y: ny});
  }

  onUp(e: PointerEvent) {
      if (this.pointerId !== e.pointerId) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      clearTimeout(this.longPressTimer);
      
      const target = e.target as HTMLElement;
      try { target.releasePointerCapture(e.pointerId); } catch {}
      
      if (!this.hasMovedSignificantly && (performance.now() - this.downTime < 300)) {
          this.tap.emit({ x: e.clientX, y: e.clientY });
      }

      this.resetState();
  }

  private resetState() {
      this.pointerId = null;
      this.active.set(false);
      this.move.emit({x: 0, y: 0});
  }
}
