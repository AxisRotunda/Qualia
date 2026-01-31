
import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameInputService } from '../../../services/game-input.service';
import { InteractionService } from '../../../engine/interaction.service';
import { VirtualJoystickComponent } from '../virtual-joystick.component';

@Component({
  selector: 'app-touch-camera-layer',
  standalone: true,
  imports: [CommonModule, VirtualJoystickComponent],
  template: `
    <div class="absolute inset-0 z-10 select-none touch-none pointer-events-none">
        
        <!-- Left Zone (Move) -->
        <!-- Added touch-none to ensure browser pan/zoom doesn't steal input from this zone -->
        <div class="absolute top-0 bottom-0 left-0 w-1/2 pointer-events-auto touch-none border-r border-white/5">
           <!-- Zone Hint -->
           @if (showLabels()) {
             <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-white/5 pointer-events-none opacity-50 flex items-center justify-center">
                <span class="material-symbols-outlined text-4xl text-white/10">open_with</span>
             </div>
           }

           <app-virtual-joystick color="cyan" 
                (move)="onSimMove($event)" 
                (tap)="onTap($event)" 
                (longPress)="onLongPress($event)" />
           
           @if (showLabels()) {
             <div class="absolute bottom-20 left-6 text-[10px] text-cyan-500/50 font-mono tracking-widest pointer-events-none uppercase font-bold">
               {{ modeLabelMove() }}
             </div>
           }
        </div>
        
        <!-- Right Zone (Look) -->
        <div class="absolute top-0 bottom-0 right-0 w-1/2 pointer-events-auto touch-none">
           <!-- Zone Hint -->
           @if (showLabels()) {
             <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-white/5 pointer-events-none opacity-50 flex items-center justify-center">
                <span class="material-symbols-outlined text-4xl text-white/10">360</span>
             </div>
           }

           <app-virtual-joystick color="amber" 
                (move)="onSimLook($event)" 
                (tap)="onTap($event)" 
                (longPress)="onLongPress($event)" />
           
           @if (showLabels()) {
             <div class="absolute bottom-20 right-6 text-[10px] text-amber-500/50 font-mono tracking-widest pointer-events-none uppercase font-bold">
               {{ modeLabelLook() }}
             </div>
           }
        </div>

        <!-- Walk Mode Specific Actions -->
        @if (isWalkMode()) {
          <div class="absolute bottom-32 right-8 flex flex-col gap-6 z-20 pointer-events-none">
             <button class="action-btn w-16 h-16 rounded-full bg-slate-900/60 border-2 border-white/20 pointer-events-auto active:bg-cyan-900/80 active:border-cyan-400"
                     (pointerdown)="onJump($event, true)" 
                     (pointerup)="onJump($event, false)" 
                     (pointercancel)="onJump($event, false)"
                     (contextmenu)="$event.preventDefault()">
                <span class="material-symbols-outlined text-[28px] text-white">vertical_align_top</span>
             </button>
             
             <button class="action-btn w-12 h-12 rounded-full self-end mr-2 bg-slate-900/60 border border-white/20 pointer-events-auto"
                     [class.active-run]="running"
                     (click)="toggleRun()"
                     (pointerdown)="$event.stopPropagation()"
                     (contextmenu)="$event.preventDefault()">
                <span class="material-symbols-outlined text-[20px]" 
                      [class.text-white]="!running" 
                      [class.text-amber-200]="running">sprint</span>
             </button>
          </div>
        }
    </div>
  `,
  styles: [`
    :host {
        display: block;
        width: 100%;
        height: 100%;
    }
    .action-btn { @apply backdrop-blur-md shadow-lg active:scale-95 transition-transform flex items-center justify-center touch-none select-none; }
    .active-run { @apply bg-amber-900/60 border-amber-500/50 shadow-amber-900/20; }
  `]
})
export class TouchCameraLayerComponent {
  input = inject(GameInputService);
  interaction = inject(InteractionService);

  showLabels = input.required<boolean>();
  isEditMode = input.required<boolean>();
  isWalkMode = input.required<boolean>();

  running = false;

  modeLabelMove() { return this.isEditMode() ? 'Pan (XZ)' : 'Move (WASD)'; }
  modeLabelLook() { return this.isEditMode() ? 'Orbit (Cam)' : 'Look (Mouse)'; }

  onTap(pos: {x: number, y: number}) {
      this.interaction.selectEntityAt(pos.x, pos.y);
  }

  onLongPress(pos: {x: number, y: number}) {
      this.interaction.openContextMenu(pos.x, pos.y);
  }

  onSimMove(v: {x: number, y: number}) { 
      this.input.setVirtualMove(v.x, v.y); 
  }
  
  onSimLook(v: {x: number, y: number}) { 
      this.input.setVirtualLook(v.x, v.y); 
  }

  onJump(e: Event, state: boolean) {
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
      this.input.setVirtualJump(state);
  }

  toggleRun() {
      this.running = !this.running;
      this.input.setVirtualRun(this.running);
  }
}
