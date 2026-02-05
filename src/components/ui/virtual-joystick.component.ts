
import { Component, input, output, signal, computed, ElementRef, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameInputService } from '../../services/game-input.service';

@Component({
    selector: 'app-virtual-joystick',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="absolute inset-0 z-0 bg-transparent cursor-crosshair touch-none"
         (pointerdown)="onDown($event)">

      @if (active() || mode() === 'fixed') {
        <!-- Base Container -->
        <div class="absolute w-24 h-24 -ml-12 -mt-12 pointer-events-none animate-in fade-in zoom-in-90 duration-100 flex items-center justify-center"
             [style.left.px]="base().x"
             [style.top.px]="base().y"
             [class.opacity-0]="mode() === 'floating' && !active()"
             [class.transition-opacity]="mode() === 'floating'">

             <!-- Tech Ring -->
             <div class="absolute inset-0 rounded-full border border-dashed opacity-30 transition-all duration-300"
                  [class.border-cyan-400]="color() === 'cyan'"
                  [class.border-amber-400]="color() === 'amber'"
                  [class.scale-125]="active()"></div>

             <!-- Inner Glow -->
             <div class="absolute inset-2 rounded-full opacity-10 bg-gradient-to-tr from-transparent to-white/20"></div>
        </div>

        <!-- Connection Line -->
        <svg class="absolute pointer-events-none overflow-visible top-0 left-0 w-full h-full opacity-60"
             [class.opacity-0]="mode() === 'floating' && !active()">
             <line [attr.x1]="base().x" [attr.y1]="base().y"
                   [attr.x2]="stick().x" [attr.y2]="stick().y"
                   [attr.stroke]="lineColor()" stroke-width="1.5" />
        </svg>

        <!-- Stick / Puck -->
        <div class="absolute w-12 h-12 -ml-6 -mt-6 rounded-full shadow-lg pointer-events-none transition-transform duration-75 will-change-transform flex items-center justify-center backdrop-blur-sm border"
             [ngClass]="stickClass()"
             [style.left.px]="stick().x"
             [style.top.px]="stick().y"
             [class.opacity-0]="mode() === 'floating' && !active()"
             [class.scale-110]="active()">

             <!-- Stick Center Dot -->
             <div class="w-2 h-2 rounded-full bg-white shadow-sm" [class.animate-pulse]="active()"></div>
        </div>
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
      pointer-events: auto;
    }
    .stick-cyan { @apply bg-cyan-950/60 border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.4)]; }
    .stick-amber { @apply bg-amber-900/60 border-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.4)]; }
  `]
})
export class VirtualJoystickComponent {
    private input = inject(GameInputService);
    color = input<'cyan' | 'amber'>('cyan');
    mode = input<'fixed' | 'floating'>('fixed');

    move = output<{x: number, y: number}>();
    tap = output<{x: number, y: number}>();
    longPress = output<{x: number, y: number}>();

    active = signal(false);
    base = signal({ x: 60, y: 200 });
    stick = signal({ x: 60, y: 200 });

    private el = inject(ElementRef);
    private pointerId: number | null = null;
    private readonly MAX_RADIUS = 40;

    private downTime = 0;
    private hasMovedSignificantly = false;
    private longPressTimer: any;

    stickClass = computed(() => this.color() === 'cyan' ? 'stick-cyan' : 'stick-amber');
    lineColor = computed(() => this.color() === 'cyan' ? '#22d3ee' : '#fbbf24');

    onDown(e: PointerEvent) {
        if (this.pointerId !== null) return;

        const target = e.currentTarget as HTMLElement;
        try { target.setPointerCapture(e.pointerId); } catch {}
        this.pointerId = e.pointerId;

        const rect = this.el.nativeElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.active.set(true);
        if (this.mode() === 'floating') {
            this.base.set({ x, y });
            this.stick.set({ x, y });
        } else {
            this.updateStickPosition(x, y, this.base());
        }

        this.downTime = performance.now();
        this.hasMovedSignificantly = false;
        this.move.emit({ x: 0, y: 0 });

        this.longPressTimer = setTimeout(() => {
            if (!this.hasMovedSignificantly && this.active()) {
                this.input.vibrate(20);
                this.longPress.emit({ x: e.clientX, y: e.clientY });
                this.resetState();
            }
        }, 600);
    }

  @HostListener('window:pointermove', ['$event'])
    onMove(e: PointerEvent) {
        if (this.pointerId !== e.pointerId || !this.active()) return;
        const rect = this.el.nativeElement.getBoundingClientRect();
        this.updateStickPosition(e.clientX - rect.left, e.clientY - rect.top, this.base());
    }

  private updateStickPosition(x: number, y: number, base: {x: number, y: number}) {
      const dx = x - base.x;
      const dy = y - base.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 5) {
          this.hasMovedSignificantly = true;
          clearTimeout(this.longPressTimer);
      }

      const limit = Math.min(dist, this.MAX_RADIUS);
      const angle = Math.atan2(dy, dx);
      this.stick.set({ x: base.x + Math.cos(angle) * limit, y: base.y + Math.sin(angle) * limit });

      this.move.emit({
          x: (Math.cos(angle) * limit) / this.MAX_RADIUS,
          y: -(Math.sin(angle) * limit) / this.MAX_RADIUS
      });
  }

  @HostListener('window:pointerup', ['$event'])
  @HostListener('window:pointercancel', ['$event'])
  onUp(e: PointerEvent) {
      if (this.pointerId !== e.pointerId) return;
      clearTimeout(this.longPressTimer);
      if (!this.hasMovedSignificantly && (performance.now() - this.downTime < 300)) {
          this.input.vibrate(10);
          this.tap.emit({ x: e.clientX, y: e.clientY });
      }
      this.resetState();
  }

  private resetState() {
      this.pointerId = null;
      this.active.set(false);
      this.move.emit({ x: 0, y: 0 });
      const b = this.base();
      this.stick.set({ x: b.x, y: b.y });
  }
}
