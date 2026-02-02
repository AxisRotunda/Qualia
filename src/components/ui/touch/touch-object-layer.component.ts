
import { Component, inject, input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObjectManipulationService } from '../../../engine/features/object-manipulation.service';
import { InteractionService } from '../../../engine/interaction.service';
import { VirtualJoystickComponent } from '../virtual-joystick.component';

@Component({
  selector: 'app-touch-object-layer',
  standalone: true,
  imports: [CommonModule, VirtualJoystickComponent],
  template: `
    <div class="absolute inset-0 z-10 select-none touch-none pointer-events-none">
       <!-- Left: Primary Transform -->
       <div class="absolute top-0 bottom-0 left-0 w-1/2 pointer-events-auto touch-none border-r border-cyan-500/20 bg-cyan-950/5">
          <app-virtual-joystick color="cyan" (move)="onObjectMoveInput($event)" (tap)="onTap($event)" />
          
          @if (showLabels()) {
            <div class="absolute bottom-24 left-6 pointer-events-none">
                <div class="flex items-center gap-2 opacity-60">
                    <span class="material-symbols-outlined text-[14px] text-cyan-400">open_with</span>
                    <span class="text-[9px] text-cyan-400 font-mono tracking-widest uppercase font-bold">{{ leftLabel() }}</span>
                </div>
            </div>
          }
       </div>

       <!-- Right: Secondary Transform -->
       <div class="absolute top-0 bottom-0 right-0 w-1/2 pointer-events-auto touch-none bg-amber-950/5">
          <app-virtual-joystick color="amber" (move)="onObjectRotLiftInput($event)" (tap)="onTap($event)" />
          
          @if (showLabels()) {
            <div class="absolute bottom-24 right-6 pointer-events-none">
                <div class="flex items-center gap-2 opacity-60 justify-end">
                    <span class="text-[9px] text-amber-400 font-mono tracking-widest uppercase font-bold">{{ rightLabel() }}</span>
                    <span class="material-symbols-outlined text-[14px] text-amber-400">height</span>
                </div>
            </div>
          }
       </div>
    </div>
  `,
  styles: [`
    :host {
        display: block;
        width: 100%;
        height: 100%;
    }
  `]
})
export class TouchObjectLayerComponent implements OnDestroy {
  objectControl = inject(ObjectManipulationService);
  interaction = inject(InteractionService);

  showLabels = input.required<boolean>();
  transformMode = input.required<'translate' | 'rotate' | 'scale'>();

  private objMove = { x: 0, y: 0 };
  private objRotLift = { x: 0, y: 0 };

  ngOnDestroy() {
      this.objectControl.setInput({x:0, y:0}, {x:0, y:0});
  }

  onTap(pos: {x: number, y: number}) {
      this.interaction.selectEntityAt(pos.x, pos.y);
  }

  onObjectMoveInput(v: {x: number, y: number}) { 
      this.objMove = v;
      this.objectControl.setInput(this.objMove, this.objRotLift);
  }

  onObjectRotLiftInput(v: {x: number, y: number}) { 
      this.objRotLift = v;
      this.objectControl.setInput(this.objMove, this.objRotLift);
  }

  leftLabel() {
      if (this.transformMode() === 'scale') return 'N/A';
      return 'SLIDE'; // Movement on XZ Plane
  }

  rightLabel() {
      if (this.transformMode() === 'scale') return 'RESIZE';
      return 'LIFT / TURN'; // Movement on Y, Rotation on Y
  }
}
