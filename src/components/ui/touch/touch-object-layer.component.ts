
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
            <div class="absolute bottom-24 left-0 w-full text-center text-[10px] text-cyan-400 font-mono tracking-widest pointer-events-none font-bold">
                {{ leftLabel() }}
            </div>
          }
       </div>

       <!-- Right: Secondary Transform -->
       <div class="absolute top-0 bottom-0 right-0 w-1/2 pointer-events-auto touch-none bg-amber-950/5">
          <app-virtual-joystick color="amber" (move)="onObjectRotLiftInput($event)" (tap)="onTap($event)" />
          
          @if (showLabels()) {
            <div class="absolute bottom-24 left-0 w-full text-center text-[10px] text-amber-400 font-mono tracking-widest pointer-events-none font-bold">
                {{ rightLabel() }}
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
      switch(this.transformMode()) {
          case 'translate': return 'SLIDE (XZ)';
          case 'rotate': return 'ROTATE (Y)';
          case 'scale': return 'SCALE (XZ)';
      }
  }

  rightLabel() {
      switch(this.transformMode()) {
          case 'translate': return 'LIFT (Y)';
          case 'rotate': return 'TILT (X/Z)';
          case 'scale': return 'SCALE (Y)';
      }
  }
}
