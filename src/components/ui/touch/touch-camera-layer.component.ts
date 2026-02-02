
import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameInputService } from '../../../services/game-input.service';
import { InteractionService } from '../../../engine/interaction.service';
import { VirtualJoystickComponent } from '../virtual-joystick.component';
import { TouchActionClusterComponent } from './touch-action-cluster.component';
import { TouchLookPadComponent } from './touch-look-pad.component';

@Component({
  selector: 'app-touch-camera-layer',
  standalone: true,
  imports: [
      CommonModule, 
      VirtualJoystickComponent, 
      TouchActionClusterComponent,
      TouchLookPadComponent
  ],
  template: `
    <div class="absolute inset-0 select-none touch-none pointer-events-none bg-transparent isolate">
        
        <!-- Left Zone (Move) - Floating Joystick -->
        <div class="absolute top-[20%] bottom-0 left-0 w-1/2 pointer-events-auto touch-none bg-transparent z-10">
           <app-virtual-joystick 
                color="cyan" 
                mode="floating"
                (move)="onSimMove($event)" 
                (tap)="onTap($event)" 
                (longPress)="onLongPress($event)" />
           
           @if (showLabels()) {
             <div class="absolute bottom-24 left-10 pointer-events-none select-none transition-all duration-700 ease-out"
                  [class.opacity-0]="!isMoving()"
                  [class.opacity-40]="isMoving()">
                <div class="flex items-center gap-3">
                    <div class="w-1.5 h-1.5 bg-cyan-400 rounded-sm shadow-[0_0_8px_cyan] animate-pulse"></div>
                    <span class="text-[10px] text-cyan-400 font-mono tracking-[0.4em] uppercase font-black">{{ modeLabelMove() }}</span>
                </div>
             </div>
           }
        </div>
        
        <!-- Right Zone (Look) - Touchpad (Swipe 1:1) -->
        <div class="absolute top-[20%] bottom-0 right-0 w-[45%] pointer-events-auto touch-none bg-transparent z-10">
           
           @if (isEditMode()) {
               <!-- Edit Mode: Keep Joystick for Orbit -->
               <app-virtual-joystick 
                    color="amber" 
                    mode="fixed"
                    (move)="onSimLook($event)" 
                    (tap)="onTap($event)" 
                    (longPress)="onLongPress($event)" />
           } @else {
               <!-- Walk/Explore Mode: Use Touchpad (Direct Delta) -->
               <app-touch-look-pad 
                    (tap)="onTap($event)"
                    (longPress)="onLongPress($event)" />
           }
           
           @if (showLabels()) {
             <div class="absolute bottom-24 right-10 pointer-events-none select-none opacity-20 hover:opacity-50 transition-opacity duration-500">
                <div class="flex items-center gap-3 justify-end">
                    <span class="text-[10px] text-amber-500 font-mono tracking-[0.4em] uppercase font-black">{{ modeLabelLook() }}</span>
                    <div class="w-1.5 h-1.5 bg-amber-500 rounded-sm shadow-[0_0_8px_orange]"></div>
                </div>
             </div>
           }
        </div>

        <!-- Combat / Action Cluster (Walk Mode Only) -->
        @if (isWalkMode()) {
            <div class="absolute inset-0 z-50 pointer-events-none">
                <app-touch-action-cluster />
            </div>
        }
    </div>
  `,
  styles: [`
    :host {
        display: block;
        width: 100%;
        height: 100%;
        pointer-events: none;
    }
  `]
})
export class TouchCameraLayerComponent {
  input = inject(GameInputService);
  interaction = inject(InteractionService);

  showLabels = input.required<boolean>();
  isEditMode = input.required<boolean>();
  isWalkMode = input.required<boolean>();

  modeLabelMove() { return this.isEditMode() ? 'PAN' : 'MOVE'; }
  modeLabelLook() { return this.isEditMode() ? 'ORBIT' : 'LOOK'; }

  isMoving() {
      const v = this.input.virtualMove;
      return Math.abs(v.x) > 0.01 || Math.abs(v.y) > 0.01;
  }

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
}
